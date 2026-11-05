<?php
declare(strict_types=1);
namespace Kuiper\Core;
/**
 * CI3-inspired router: trailing-slash 301, $redirect map, verb routes, optional auto-route, 404_override.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class Router
{
    /** @var array<string,mixed> */
    private array $routes;
    /** @var array<string,string> */
    private array $redirects;
    private bool $handlingNotFound = false;

    /**
     * @param array<string,mixed> $routes
     * @param array<string,string> $redirects
     */
    public function __construct(
        private readonly App $app,
        array $routes,
        array $redirects = [],
    ) {
        $this->routes = $routes;
        $this->redirects = $redirects;
    }

    public function dispatch(string $method, string $uri): void
    {
        $plan = $this->plan($method, $uri);
        match ($plan['type']) {
            'redirect' => $this->sendRedirect((int) ($plan['http_status'] ?? 301), (string) $plan['location']),
            'method_not_allowed' => $this->sendMethodNotAllowed($plan['allow'] ?? []),
            'not_found' => $this->handleNotFound(),
            'dispatch' => $this->runTarget((string) $plan['target']),
            default => $this->handleNotFound(),
        };
    }

    /**
     * Dry-run routing: no headers, no body. Use for legacy fallthrough.
     * `type`: dispatch|redirect|not_found|method_not_allowed (internal / BC).
     * `status`: ok|redirect|not_found|method_not_allowed (dispatch → ok).
     *
     * @return array{type:string, status:'ok'|'redirect'|'not_found'|'method_not_allowed', http_status?:int, location?:string, target?:string, allow?:list<string>}
     */
    public function plan(string $method, string $uri): array
    {
        $plan = $this->resolvePlan($method, $uri);
        $type = $plan['type'] ?? 'not_found';
        $plan['status'] = $type === 'dispatch' ? 'ok' : $type;
        return $plan;
    }

    /**
     * @return array{type:string, http_status?:int, location?:string, target?:string, allow?:list<string>}
     */
    private function resolvePlan(string $method, string $uri): array
    {
        $method = strtoupper($method);
        $requestMethod = $method;
        if ($method === 'HEAD') {
            $method = 'GET';
        }

        $parts = $this->splitUri($uri);
        if (!empty($parts['malformed'])) {
            return ['type' => 'not_found'];
        }

        $path = $parts['path'];
        $query = $parts['query'];

        // /index.php → /
        if (strcasecmp($path, '/index.php') === 0) {
            $loc = $this->safeLocation('/', $query);
            if ($loc === null) {
                return ['type' => 'not_found'];
            }
            return ['type' => 'redirect', 'http_status' => 301, 'location' => $loc];
        }

        // Decode segments; reject encoded / or NUL
        $decoded = $this->decodePath($path);
        if ($decoded === null) {
            return ['type' => 'not_found'];
        }
        $path = $decoded;

        // Trailing slash → 301 (not for `/`)
        if ($path !== '/' && str_ends_with($path, '/')) {
            $clean = rtrim($path, '/') ?: '/';
            $loc = $this->safeLocation($clean, $query);
            if ($loc === null) {
                return ['type' => 'not_found'];
            }
            return ['type' => 'redirect', 'http_status' => 301, 'location' => $loc];
        }

        $rel = trim($path, '/');

        $redir = $this->matchRedirect($rel, $query);
        if ($redir !== null) {
            return $redir;
        }

        $matched = $this->matchExplicit($rel, $method, $requestMethod);
        if ($matched['type'] === 'dispatch' || $matched['type'] === 'method_not_allowed') {
            return $matched;
        }

        if ($rel === '') {
            return [
                'type' => 'dispatch',
                'target' => (string) ($this->routes['default_controller'] ?? 'home'),
            ];
        }

        if ($this->autoRouteEnabled()) {
            $auto = $this->autoRoute($rel);
            if ($auto !== null) {
                return ['type' => 'dispatch', 'target' => $auto];
            }
        }

        return ['type' => 'not_found'];
    }

    /**
     * Split on '?' only (parse_url mis-handles /a:1, //host, etc.).
     *
     * @return array{path:string, query:string, malformed?:bool}
     */
    public function splitUri(string $uri): array
    {
        $hash = strpos($uri, '#');
        if ($hash !== false) {
            $uri = substr($uri, 0, $hash);
        }

        $qpos = strpos($uri, '?');
        if ($qpos === false) {
            $path = $uri;
            $query = '';
        } else {
            $path = substr($uri, 0, $qpos);
            $query = substr($uri, $qpos + 1);
        }

        if ($path === '') {
            $path = '/';
        }

        if ($this->isUnsafePath($path)) {
            return ['path' => $path, 'query' => $query, 'malformed' => true];
        }

        return ['path' => $path, 'query' => $query];
    }

    private function isUnsafePath(string $path): bool
    {
        if ($path === '' || !str_starts_with($path, '/')) {
            return true;
        }
        // Protocol-relative or backslash tricks → open redirect / confuse parsers
        if (str_starts_with($path, '//') || str_starts_with($path, '/\\')) {
            return true;
        }
        if (str_contains($path, '\\') || str_contains($path, "\0")) {
            return true;
        }
        return false;
    }

    /**
     * rawurldecode each segment; null if any decoded segment contains / or NUL.
     */
    public function decodePath(string $path): ?string
    {
        if ($path === '/') {
            return '/';
        }
        $trailing = str_ends_with($path, '/');
        $segments = explode('/', trim($path, '/'));
        $out = [];
        foreach ($segments as $seg) {
            $decoded = rawurldecode($seg);
            if ($decoded !== $seg && (str_contains($decoded, '/') || str_contains($decoded, "\0"))) {
                return null;
            }
            if (str_contains($decoded, "\0") || str_contains($decoded, '\\')) {
                return null;
            }
            $out[] = $decoded;
        }
        $result = '/' . implode('/', $out);
        if ($trailing && $result !== '/') {
            $result .= '/';
        }
        return $result;
    }

    private function withQuery(string $path, string $query): string
    {
        return $query === '' ? $path : $path . '?' . $query;
    }

    /**
     * Build a safe Location value. Relative paths get a single leading slash.
     * Never returns a value starting with // or /\. Absolute http(s) only when
     * the destination template itself was absolute (no capture-injected scheme).
     */
    public function safeLocation(string $dest, string $query, bool $templateWasAbsolute = false): ?string
    {
        if ($templateWasAbsolute && preg_match('~^https?://~i', $dest) === 1) {
            // Captures are already rawurlencode'd. Reject obvious authority tricks.
            if (preg_match('~^https?://(/|\\\\)~i', $dest) === 1) {
                return null;
            }
            // @ in host/userinfo position after scheme:// is only safe if percent-encoded
            if (preg_match('~^https?://[^/]*@~i', $dest) === 1) {
                return null;
            }
            return $this->withQuery($dest, $query);
        }

        $path = '/' . ltrim($dest, "/\\");
        if (str_starts_with($path, '//') || str_starts_with($path, '/\\') || str_contains($path, '\\')) {
            return null;
        }
        if ($path !== '/' && $this->isUnsafePath($path)) {
            return null;
        }
        return $this->withQuery($this->encodePathSegments($path), $query);
    }

    /**
     * Encode one redirect capture for a Location header.
     * rawurlencode alone leaves "."; force %2E so ".." / "." cannot reshape the path.
     */
    public function encodeLocationSegment(string $segment): string
    {
        return str_replace('.', '%2E', rawurlencode(rawurldecode($segment)));
    }

    /** Percent-encode each path segment for Location headers (decoded input OK). */
    public function encodePathSegments(string $path): string
    {
        if ($path === '/' || $path === '') {
            return '/';
        }
        $trailing = str_ends_with($path, '/');
        $parts = explode('/', trim($path, '/'));
        $enc = [];
        foreach ($parts as $part) {
            $decoded = rawurldecode($part);
            // Only force-encode . / .. segments; leave normal dots (file.ext) alone
            if ($decoded === '.' || $decoded === '..') {
                $enc[] = str_replace('.', '%2E', $decoded);
            } else {
                $enc[] = rawurlencode($decoded);
            }
        }
        $out = '/' . implode('/', $enc);
        return $trailing && $out !== '/' ? $out . '/' : $out;
    }


    /** @return array{type:string, status?:int, location?:string}|null */
    private function matchRedirect(string $rel, string $query): ?array
    {
        foreach ($this->redirects as $key => $dest) {
            if (!is_string($dest)) {
                continue;
            }
            $pattern = $this->ciPattern((string) $key);
            if (!preg_match($pattern, $rel, $m)) {
                continue;
            }
            array_shift($m);
            $templateWasAbsolute = preg_match('~^https?://~i', $dest) === 1;
            $out = $dest;
            foreach ($m as $i => $val) {
                // Encode captures for Location (CRLF, ?, spaces, @, .. stay inert)
                $out = str_replace('$' . ($i + 1), $this->encodeLocationSegment($val), $out);
            }
            $location = $this->safeLocation($out, $query, $templateWasAbsolute);
            if ($location === null) {
                return ['type' => 'not_found'];
            }
            return [
                'type' => 'redirect',
                'http_status' => 301,
                'location' => $location,
            ];
        }
        return null;
    }

    /**
     * @return array{type:string, target?:string, allow?:list<string>}
     */
    private function matchExplicit(string $rel, string $method, string $requestMethod): array
    {
        $pathHitAllow = null;

        foreach ($this->routes as $key => $dest) {
            if (!is_string($key) || $this->isMetaKey($key)) {
                continue;
            }
            $pattern = $this->ciPattern($key);
            if (!preg_match($pattern, $rel, $m)) {
                continue;
            }
            array_shift($m);

            if (is_string($dest)) {
                // Plain string = GET / HEAD / POST only
                if (!in_array($method, ['GET', 'POST'], true)) {
                    return [
                        'type' => 'method_not_allowed',
                        'allow' => $this->expandAllow(['GET', 'POST']),
                    ];
                }
                return ['type' => 'dispatch', 'target' => $this->applyCaptures($dest, $m)];
            }

            if (is_array($dest)) {
                /** @var array<string,string> $dest */
                $allow = [];
                foreach ($dest as $verb => $target) {
                    if (!is_string($verb) || !is_string($target)) {
                        continue;
                    }
                    $allow[] = strtoupper($verb);
                    if (strtoupper($verb) === $method) {
                        return ['type' => 'dispatch', 'target' => $this->applyCaptures($target, $m)];
                    }
                }
                $pathHitAllow = $allow;
            }
        }

        if ($pathHitAllow !== null) {
            return [
                'type' => 'method_not_allowed',
                'allow' => $this->expandAllow($pathHitAllow),
            ];
        }

        return ['type' => 'miss'];
    }

    /** @param list<string> $verbs */
    public function expandAllow(array $verbs): array
    {
        $out = [];
        foreach ($verbs as $v) {
            $v = strtoupper((string) $v);
            $out[] = $v;
            if ($v === 'GET') {
                $out[] = 'HEAD';
            }
        }
        $out[] = 'OPTIONS';
        return array_values(array_unique($out));
    }

    private function isMetaKey(string $key): bool
    {
        return in_array($key, ['default_controller', '404_override', 'auto_route'], true);
    }

    private function autoRouteEnabled(): bool
    {
        $flag = $this->routes['auto_route'] ?? false;
        return $flag === true || $flag === 1 || $flag === '1';
    }

    private function autoRoute(string $rel): ?string
    {
        $parts = array_values(array_filter(explode('/', $rel), static fn ($p) => $p !== ''));
        if ($parts === []) {
            return (string) ($this->routes['default_controller'] ?? 'home');
        }
        $controller = array_shift($parts);
        $method = $parts !== [] ? array_shift($parts) : 'index';
        if (str_starts_with($method, '_')) {
            return null;
        }
        $args = $parts;
        return $controller . '/' . $method . ($args !== [] ? '/' . implode('/', $args) : '');
    }

    private function ciPattern(string $key): string
    {
        $pattern = preg_replace(
            ['~\\(:any\\)~', '~\\(:num\\)~'],
            ['([^/]+)', '([0-9]+)'],
            $key
        );
        return '#^' . $pattern . '$#';
    }

    /** @param list<string> $captures */
    private function applyCaptures(string $dest, array $captures): string
    {
        $out = $dest;
        foreach ($captures as $i => $val) {
            $out = str_replace('$' . ($i + 1), $val, $out);
        }
        return $out;
    }

    private function runTarget(string $target): void
    {
        try {
            $this->invoke($target);
        } catch (NotFoundException) {
            $this->handleNotFound();
        }
    }

    private function invoke(string $target): void
    {
        $parts = array_values(array_filter(explode('/', $target), static fn ($p) => $p !== ''));
        $controllerSeg = $parts[0] ?? 'home';
        $method = $parts[1] ?? 'index';
        $args = array_slice($parts, 2);

        $controllerName = str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $controllerSeg)));
        $class = 'App\\Controllers\\' . $controllerName;

        if (!class_exists($class) || !is_subclass_of($class, Controller::class)) {
            $this->handleNotFound();
            return;
        }

        /** @var Controller $controller */
        $controller = new $class($this->app);

        if (!$this->isCallableAction($controller, $method)) {
            $this->handleNotFound();
            return;
        }

        $controller->{$method}(...$args);
    }

    private function isCallableAction(object $controller, string $method): bool
    {
        if (str_starts_with($method, '_')) {
            return false;
        }
        if (!method_exists($controller, $method)) {
            return false;
        }
        try {
            $ref = new \ReflectionMethod($controller, $method);
        } catch (\ReflectionException) {
            return false;
        }
        if (!$ref->isPublic()) {
            return false;
        }
        // Only methods declared on the concrete controller class (not base Controller, not parents)
        if ($ref->getDeclaringClass()->getName() !== $controller::class) {
            return false;
        }
        return true;
    }

    private function handleNotFound(): void
    {
        if ($this->handlingNotFound) {
            $this->plain404();
            return;
        }
        $this->handlingNotFound = true;
        $this->status(404);

        try {
            $override = $this->routes['404_override'] ?? null;
            if (is_string($override) && $override !== '') {
                try {
                    $this->invoke($override);
                    return;
                } catch (NotFoundException $e) {
                    error_log('Kuiper 404_override NotFoundException: ' . $e->getMessage());
                } catch (\Throwable $e) {
                    error_log('Kuiper 404_override error: ' . $e->getMessage());
                    $this->clearOutputBuffers();
                    $this->plain404();
                    return;
                }
            }
            $this->plain404();
        } finally {
            $this->handlingNotFound = false;
        }
    }

    private function plain404(): void
    {
        $this->status(404);
        echo 'Not found';
    }

    private function clearOutputBuffers(): void
    {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
    }

    private function sendRedirect(int $status, string $location): void
    {
        // Final guard — never emit open-redirect Locations
        if (str_starts_with($location, '//') || str_starts_with($location, '/\\')) {
            $this->handleNotFound();
            return;
        }
        $this->status($status);
        $this->header('Location: ' . $location);
    }

    /** @param list<string> $allow */
    private function sendMethodNotAllowed(array $allow): void
    {
        $this->status(405);
        if ($allow !== []) {
            $this->header('Allow: ' . implode(', ', $allow));
        }
        echo 'Method Not Allowed';
    }

    private function status(int $code): void
    {
        if (!headers_sent()) {
            http_response_code($code);
        } else {
            @http_response_code($code);
        }
    }

    private function header(string $line): void
    {
        if (!headers_sent()) {
            header($line);
        }
    }
}
