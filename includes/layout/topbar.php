<?php
declare(strict_types=1);
?>
<header class="topbar">
  <div class="topbar-inner">
    <a class="logo" href="/">
      <img class="logo-mark" src="/assets/images/logo.webp" alt="" width="43" height="36">
      <?= e(site('name')) ?>
    </a>
    <div id="topbar-tools" class="topbar-tools" hidden></div>
    <input type="checkbox" id="nav-toggle" class="nav-toggle">
    <label for="nav-toggle" class="nav-burger"><span class="nav-burger-bar"></span>Menu</label>
    <nav class="site-nav" aria-label="Primary">
      <a class="nav-link<?= nav_active('/gopro-gps-extract') ?>" href="/gopro-gps-extract">GoPro GPS</a>
      <span class="nav-link is-soon" title="Coming soon">Tools</span>
      <span class="nav-link is-soon" title="Coming soon">Guides</span>
    </nav>
  </div>
</header>
