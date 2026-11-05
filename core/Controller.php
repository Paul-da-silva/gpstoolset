<?php
declare(strict_types=1);
namespace Kuiper\Core;
/**
 * Base controller: $this->view(), $this->input, $this->notFound().
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
abstract class Controller
{
    public readonly Input $input;

    public function __construct(protected readonly App $app)
    {
        $this->input = $app->input ?? new Input();
    }

    /**
     * @param array<string,mixed> $data
     */
    protected function view(string $name, array $data = [], bool $return = false, string $layout = 'layouts/main'): string|null
    {
        $file = $this->app->viewPath($name);
        if (!is_file($file)) {
            throw new \RuntimeException('View not found: ' . $name);
        }
        extract($data, EXTR_SKIP);
        ob_start();
        require $file;
        $content = (string) ob_get_clean();
        if ($layout !== '' && $layout !== 'none') {
            $layoutFile = $this->app->viewPath($layout);
            if (is_file($layoutFile)) {
                ob_start();
                require $layoutFile;
                $content = (string) ob_get_clean();
            }
        }
        if ($return) {
            return $content;
        }
        echo $content;
        return null;
    }

    /** Abort into the router 404_override (HTTP 404). */
    protected function notFound(string $message = 'Not found'): never
    {
        throw new NotFoundException($message);
    }
}
