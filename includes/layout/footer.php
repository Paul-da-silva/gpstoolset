<?php
declare(strict_types=1);

/**
 * Footer for ordinary pages and map-tool landings. After a file loads,
 * the tool JS hides this footer. Ads stay off map pages because
 * render_ad() no-ops when isMapPage is set or allowAds is false.
 */
$showFooter = true;
?>
<?php if ($showFooter): ?>
<footer class="site-footer">
  <div class="footer-inner">
    <?php render_ad('ad-footer'); ?>
    <nav class="footer-nav" aria-label="Footer">
      <a href="/privacy">Privacy</a>
      <a href="/about">About</a>
    </nav>
  </div>
</footer>
<?php endif; ?>
<?php
if (empty($footerInPreamble) && (!isset($footerClose) || $footerClose)) {
    require __DIR__ . '/close.php';
}
