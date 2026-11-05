<?php
declare(strict_types=1);
/**
 * Global view helpers. Loaded via composer "files" autoload.
 * <!-- kuiper-core-ref: 1.1.3-draft -->
 */

if (!function_exists('e')) {
    /** Escape for HTML body/attr. Controllers leave strings raw; views call e(). */
    function e(mixed $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
