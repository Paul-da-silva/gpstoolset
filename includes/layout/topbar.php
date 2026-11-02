<?php
declare(strict_types=1);
?>
<header class="topbar">
  <div class="topbar-inner">
    <a class="logo" href="/"><?= e(site('name')) ?></a>
    <input type="checkbox" id="nav-toggle" class="nav-toggle">
    <label for="nav-toggle" class="nav-burger"><span class="nav-burger-bar"></span>Menu</label>
    <nav class="site-nav" aria-label="Primary">
      <span class="nav-link is-soon" title="Coming soon">Tools</span>
      <span class="nav-link is-soon" title="Coming soon">Guides</span>
      <a class="nav-link<?= nav_active('/about') ?>" href="/about">About</a>
      <a class="nav-link<?= nav_active('/privacy') ?>" href="/privacy">Privacy</a>
    </nav>
  </div>
</header>
