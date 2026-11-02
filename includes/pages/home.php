<?php
declare(strict_types=1);

/** Home page body. Routed by includes/router.php (config/tools.php: home). */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="home">
  <h1>GPS Toolset</h1>
  <p class="privacy-line">Your file never leaves your device.</p>
  <div class="dropzone">Drop a file here</div>
  <?php render_ad('ad-home-mid'); ?>
</main>
<script src="/assets/js/dropzone.js"></script>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
