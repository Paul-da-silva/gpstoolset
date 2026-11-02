<?php
declare(strict_types=1);

/**
 * Footer for ordinary pages. Map and viewer pages leave this file out
 * and include close.php instead. If a map page includes this file by
 * mistake, the footer markup is skipped.
 */
$showFooter = empty($page['isMapPage']);
?>
<?php if ($showFooter): ?>
<footer class="site-footer">
  <div class="footer-inner">
    <?php render_ad('ad-footer'); ?>
    <nav class="footer-nav" aria-label="Footer">
      <a href="/privacy">Privacy</a>
      <a href="/about">About</a>
    </nav>
    <p>© OpenStreetMap contributors</p>
    <p><a href="https://www.openstreetmap.org/fixthemap">Report a map issue</a></p>
  </div>
</footer>
<?php endif; ?>
<?php require __DIR__ . '/close.php'; ?>
