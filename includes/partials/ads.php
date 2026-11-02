<?php
declare(strict_types=1);

/**
 * Print one ad slot, or nothing.
 *
 * No-op when ads are disabled, the slot id is unknown, the page is a
 * map/viewer ($page['isMapPage'] from flags.map), flags.ads is false
 * ($page['allowAds']), or this response already printed max_slots.
 * Enabled slots are an empty reserved box. This file does not load an
 * ad network.
 */
function render_ad(string $slotId): void
{
    static $rendered = 0;

    $page = $GLOBALS['page'] ?? [];
    if (!empty($page['isMapPage']) || (isset($page['allowAds']) && $page['allowAds'] === false)) {
        return;
    }

    $ads = $GLOBALS['ADS'] ?? [];
    if (empty($ads['enabled'])) {
        return;
    }

    $maxSlots = (int) ($ads['max_slots'] ?? 2);
    if ($maxSlots < 1 || $rendered >= $maxSlots) {
        return;
    }

    $slots = $ads['slots'] ?? [];
    if (!is_array($slots) || !isset($slots[$slotId]) || !is_array($slots[$slotId])) {
        return;
    }

    $minHeight = (int) ($slots[$slotId]['min_height'] ?? 0);
    if ($minHeight < 0) {
        $minHeight = 0;
    }
    if ($minHeight > 600) {
        $minHeight = 600;
    }

    $rendered++;

    echo '<div class="ad-slot" data-ad-slot="' . e($slotId) . '" style="min-height:' . $minHeight . 'px" aria-label="Advertisement"></div>' . "\n";
}
