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
<?php if (!empty($page['isMapPage'])): ?>
      <a class="nav-link" href="https://www.openstreetmap.org/fixthemap">Report a map issue</a>
      <span class="nav-note">Your file never leaves your device.</span>
<?php endif; ?>
    </nav>
  </div>
</header>
