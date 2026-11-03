<?php
declare(strict_types=1);

/**
 * Ads are off until this flag is flipped.
 *
 * Map and viewer pages get $page['isMapPage'] = true from flags.map
 * (includes/router.php) and must not call render_ad(). The ads partial
 * also refuses to print when isMapPage is set, or when flags.ads is
 * false (allowAds), so a mistaken call still shows no ad.
 *
 * Slots are a whitelist. At most max_slots boxes are printed per response.
 * When enabled is false, render_ad() is a no-op: no markup and no reserved
 * height. When enabled is true, the slot is an empty box with min_height
 * so the layout does not jump once a creative is placed there.
 */
return [
    'enabled' => false,
    'max_slots' => 2,
    'slots' => [
        'ad-home-mid' => ['min_height' => 250],
        'ad-footer' => ['min_height' => 90],
        'ad-converter-mid' => ['min_height' => 90],
        'ad-guides-in' => ['min_height' => 90],
    ],
];
