<?php
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

$page = [
    'title' => 'Privacy',
    'description' => 'GPS Toolset handles files in your browser. They are not uploaded.',
    'isMapPage' => false,
];

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="page">
  <h1>Privacy</h1>
  <p>Your file never leaves your device.</p>
  <p>Tools on this site are meant to run in your browser. A file you open is not uploaded to GPS Toolset.</p>
</main>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
