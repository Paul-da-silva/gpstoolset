<?php
declare(strict_types=1);

/**
 * /guides hub — lists every published guide (formats hub first).
 */

$guides = guides_published();

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';

echo seo_json_ld([
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [
        [
            '@type' => 'ListItem',
            'position' => 1,
            'name' => 'Home',
            'item' => base_url('/'),
        ],
        [
            '@type' => 'ListItem',
            'position' => 2,
            'name' => 'Guides',
            'item' => base_url('/guides'),
        ],
    ],
]);
?>
<main class="page guide-index">
  <h1>Guides</h1>
  <p class="guide-lead">Short practical guides for GPS file formats and conversions. Files stay in your browser when you use the tools.</p>
  <?php render_ad('ad-guides-in'); ?>
  <ul class="guide-index-list">
    <?php foreach ($guides as $guide): ?>
      <li>
        <a href="/guides/<?= e((string) $guide['slug']) ?>"><?= e((string) $guide['title']) ?></a>
        <?php if (!empty($guide['description'])): ?>
          <p><?= e((string) $guide['description']) ?></p>
        <?php endif; ?>
      </li>
    <?php endforeach; ?>
  </ul>
</main>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
