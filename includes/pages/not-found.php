<?php
declare(strict_types=1);

/** 404 body. Sent by includes/router.php when no registry entry matches. */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="page">
  <h1>Page not found</h1>
  <p>That page does not exist. <a href="/">Go to the home page</a>.</p>
</main>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
