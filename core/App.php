<?php
declare(strict_types=1);
namespace Kuiper\Core;
/**
 * DI hub (spacegame-inspired).
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */
final class App
{
    public readonly Input $input;

    /** @param array<string,mixed> $config */
    public function __construct(
        public readonly string $root,
        public readonly array $config,
        ?Input $input = null,
    ) {
        $this->input = $input ?? new Input();
    }

    public static function boot(string $root): self
    {
        require_once $root . '/core/helpers.php';
        Env::load($root);
        $site = is_file($root . '/config/site.php')
            ? require $root . '/config/site.php'
            : [];
        return new self($root, is_array($site) ? $site : []);
    }

    public function viewPath(string $name): string
    {
        $safe = preg_replace('~[^a-zA-Z0-9_/]~', '', str_replace('.', '', $name)) ?? '';
        return $this->root . '/views/' . $safe . '.php';
    }
}
