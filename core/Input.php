<?php
declare(strict_types=1);
namespace Kuiper\Core;
/**
 * CI3-inspired request input. Strings are returned raw — escape in views with e().
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class Input
{
    /**
     * Small default Cloudflare IPv4/IPv6 CIDR set (update periodically).
     * @see https://www.cloudflare.com/ips/
     * @var list<string>
     */
    public const DEFAULT_CF_RANGES = [
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22',
        '2400:cb00::/32',
        '2606:4700::/32',
        '2803:f800::/32',
        '2405:b500::/32',
        '2405:8100::/32',
        '2a06:98c0::/29',
        '2c0f:f248::/32',
    ];

    /** @param array<string,mixed>|null $get */
    /** @param array<string,mixed>|null $post */
    /** @param array<string,mixed>|null $server */
    public function __construct(
        private readonly ?array $get = null,
        private readonly ?array $post = null,
        private readonly ?array $server = null,
        private readonly ?string $rawBody = null,
    ) {
    }

    /** @return array<string,mixed> */
    private function bagGet(): array
    {
        return $this->get ?? $_GET;
    }

    /** @return array<string,mixed> */
    private function bagPost(): array
    {
        return $this->post ?? $_POST;
    }

    /** @return array<string,mixed> */
    private function bagServer(): array
    {
        return $this->server ?? $_SERVER;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $bag = $this->bagGet();
        return array_key_exists($key, $bag) ? $bag[$key] : $default;
    }

    public function post(string $key, mixed $default = null): mixed
    {
        $bag = $this->bagPost();
        return array_key_exists($key, $bag) ? $bag[$key] : $default;
    }

    public function server(string $key, mixed $default = null): mixed
    {
        $bag = $this->bagServer();
        return array_key_exists($key, $bag) ? $bag[$key] : $default;
    }

    public function method(): string
    {
        $m = strtoupper((string) $this->server('REQUEST_METHOD', 'GET'));
        return $m !== '' ? $m : 'GET';
    }

    public function isPost(): bool
    {
        return $this->method() === 'POST';
    }

    public function isAjax(): bool
    {
        return strtolower((string) $this->server('HTTP_X_REQUESTED_WITH', '')) === 'xmlhttprequest';
    }

    public function json(): ?array
    {
        $raw = $this->rawBody;
        if ($raw === null) {
            $raw = file_get_contents('php://input');
            if ($raw === false) {
                $raw = '';
            }
        }
        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Client IP. CF-Connecting-IP is used only when TRUST_CF_CONNECTING_IP is truthy
     * AND REMOTE_ADDR is inside CF_IP_RANGES (or DEFAULT_CF_RANGES).
     * If you cannot keep the range list current, firewall the origin to Cloudflare only
     * and keep TRUST_CF_CONNECTING_IP off otherwise.
     */
    public function ip(): string
    {
        $remote = $this->server('REMOTE_ADDR');
        $remote = is_string($remote) && $remote !== '' ? $remote : '0.0.0.0';

        $trust = Env::get('TRUST_CF_CONNECTING_IP', false);
        $trust = $trust === true || $trust === 1 || $trust === '1' || $trust === 'true';
        if (!$trust) {
            return $remote;
        }

        $ranges = Env::get('CF_IP_RANGES', self::DEFAULT_CF_RANGES);
        if (!is_array($ranges)) {
            $ranges = self::DEFAULT_CF_RANGES;
        }
        /** @var list<string> $ranges */
        if (!$this->ipInRanges($remote, $ranges)) {
            return $remote;
        }

        $cf = $this->server('HTTP_CF_CONNECTING_IP');
        if (is_string($cf) && $cf !== '' && filter_var($cf, FILTER_VALIDATE_IP)) {
            return $cf;
        }
        return $remote;
    }

    /** @param list<string> $ranges */
    public function ipInRanges(string $ip, array $ranges): bool
    {
        $ipBin = inet_pton($ip);
        if ($ipBin === false) {
            return false;
        }
        foreach ($ranges as $cidr) {
            if (!is_string($cidr) || $cidr === '') {
                continue;
            }
            if ($this->ipInCidr($ipBin, $cidr)) {
                return true;
            }
        }
        return false;
    }

    private function ipInCidr(string $ipBin, string $cidr): bool
    {
        $parts = explode('/', $cidr, 2);
        if (count($parts) !== 2) {
            return false;
        }
        [$subnet, $maskLen] = $parts;
        $maskLen = (int) $maskLen;
        $subnetBin = inet_pton($subnet);
        if ($subnetBin === false || strlen($subnetBin) !== strlen($ipBin)) {
            return false;
        }
        $len = strlen($ipBin);
        $maxBits = $len * 8;
        if ($maskLen < 0 || $maskLen > $maxBits) {
            return false;
        }
        $fullBytes = intdiv($maskLen, 8);
        $remBits = $maskLen % 8;
        if ($fullBytes > 0 && substr($ipBin, 0, $fullBytes) !== substr($subnetBin, 0, $fullBytes)) {
            return false;
        }
        if ($remBits === 0) {
            return true;
        }
        $mask = (~((1 << (8 - $remBits)) - 1)) & 0xFF;
        return (ord($ipBin[$fullBytes]) & $mask) === (ord($subnetBin[$fullBytes]) & $mask);
    }

    /**
     * Path only (no query). Uses '?' split — not parse_url — so /a:1 and /time/10:30 work.
     * Unsafe paths (protocol-relative or backslash) return '/' for display; Router 404s them.
     */
    public function uri(): string
    {
        $uri = (string) $this->server('REQUEST_URI', '/');
        $hash = strpos($uri, '#');
        if ($hash !== false) {
            $uri = substr($uri, 0, $hash);
        }
        $qpos = strpos($uri, '?');
        $path = $qpos === false ? $uri : substr($uri, 0, $qpos);
        if ($path === '') {
            $path = '/';
        }
        $backslash = chr(92);
        if (
            !str_starts_with($path, '/')
            || str_starts_with($path, '//')
            || str_starts_with($path, '/' . $backslash)
            || str_contains($path, $backslash)
            || str_contains($path, "\0")
        ) {
            return '/';
        }
        if ($path !== '/') {
            $path = '/' . trim($path, '/');
        }
        return $path;
    }


    public function segment(int $n, mixed $default = null): mixed
    {
        if ($n < 1) {
            return $default;
        }
        $parts = array_values(array_filter(explode('/', trim($this->uri(), '/')), static fn ($p) => $p !== ''));
        return $parts[$n - 1] ?? $default;
    }
}
