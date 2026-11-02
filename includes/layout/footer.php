<?php
declare(strict_types=1);

/**
 * Footer for ordinary pages. Map tools omit it unless this include is
 * pulled into the pre-upload block ($footerInPreamble). That block is
 * hidden after a file loads. close.php runs only for a normal page footer.
 */
$showFooter = empty($page['isMapPage']) || !empty($footerInPreamble);
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
