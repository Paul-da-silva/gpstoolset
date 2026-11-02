<?php
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

$page = [
    'title' => 'GPS Toolset',
    'description' => 'Browser tools for GPS files. Your file never leaves your device.',
    'isMapPage' => false,
];

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="home">
  <h1>GPS Toolset</h1>
  <p class="privacy-line">Your file never leaves your device.</p>
  <div class="dropzone">Drop a file here</div>
  <?php render_ad('ad-home-mid'); ?>
  <p class="home-links">
    <a href="/privacy">Privacy</a>
    <a href="/about">About</a>
  </p>
</main>
<script src="/assets/js/dropzone.js"></script>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
