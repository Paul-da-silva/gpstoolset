<?php
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

$page = [
    'title' => 'About',
    'description' => 'GPS Toolset is a set of browser tools for GPS files and maps.',
    'isMapPage' => false,
];

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="page">
  <h1>About</h1>
  <p>GPS Toolset is a set of browser tools for GPS files and maps.</p>
  <p>Maps use tiles from OpenStreetMap. © OpenStreetMap contributors.</p>
</main>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
