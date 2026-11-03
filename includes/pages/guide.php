<?php
declare(strict_types=1);

/**
 * Single guide page. $route comes from tools.php (built from config/guides.php).
 * Article body is a static PHP/HTML partial under includes/guides/.
 */

$guideSlug = (string) ($route['guideSlug'] ?? '');
$guide = guide_by_slug($guideSlug);
if ($guide === null) {
    http_response_code(404);
    require APP_ROOT . '/includes/pages/not-found.php';
    return;
}

$updated = (string) ($guide['updated'] ?? '');
$faq = isset($route['faq']) && is_array($route['faq']) ? $route['faq'] : [];
$links = isset($guide['internal_links']) && is_array($guide['internal_links'])
    ? $guide['internal_links']
    : [];
$toolPaths = isset($links['tools']) && is_array($links['tools']) ? $links['tools'] : [];
$guidePaths = isset($links['guides']) && is_array($links['guides']) ? $links['guides'] : [];

$relatedTools = [];
foreach ($toolPaths as $path) {
    if (!is_string($path) || $path === '') {
        continue;
    }
    $path = route_normalize($path);
    if (!site_path_exists($path)) {
        continue;
    }
    $relatedTools[$path] = site_path_label($path);
}

$relatedGuides = [];
foreach ($guidePaths as $path) {
    if (!is_string($path) || $path === '') {
        continue;
    }
    $path = route_normalize($path);
    if ($path === '/guides/' . $guideSlug) {
        continue;
    }
    if (!site_path_exists($path)) {
        continue;
    }
    $relatedGuides[$path] = site_path_label($path);
}

$graph = [
    [
        '@type' => 'Article',
        'headline' => (string) $guide['title'],
        'description' => (string) ($guide['description'] ?? ''),
        'dateModified' => $updated !== '' ? $updated : null,
        'mainEntityOfPage' => base_url($route['path']),
        'author' => [
            '@type' => 'Organization',
            'name' => site('name'),
        ],
        'publisher' => [
            '@type' => 'Organization',
            'name' => site('name'),
            'url' => base_url('/'),
        ],
    ],
    [
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
            [
                '@type' => 'ListItem',
                'position' => 3,
                'name' => (string) $guide['title'],
                'item' => base_url($route['path']),
            ],
        ],
    ],
];

if ($graph[0]['dateModified'] === null) {
    unset($graph[0]['dateModified']);
}

if ($faq !== []) {
    $graph[] = [
        '@type' => 'FAQPage',
        'url' => base_url($route['path']),
        'mainEntity' => seo_faq_entities($faq),
    ];
}

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';

echo seo_json_ld([
    '@context' => 'https://schema.org',
    '@graph' => $graph,
]);
?>
<main class="page guide-article">
  <nav class="guide-crumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span aria-hidden="true">/</span>
    <a href="/guides">Guides</a>
    <span aria-hidden="true">/</span>
    <span><?= e((string) $guide['title']) ?></span>
  </nav>
  <article class="guide-prose">
    <h1><?= e((string) $guide['title']) ?></h1>
    <?php
    $content = route_file((string) ($guide['content'] ?? $route['content'] ?? ''));
    if ($content !== null) {
        require $content;
    }
    ?>
  </article>

  <?php if ($relatedTools !== [] || $relatedGuides !== []): ?>
  <aside class="guide-related" aria-label="Related">
    <?php if ($relatedTools !== []): ?>
    <section class="guide-related-box">
      <h2>Related tools</h2>
      <ul>
        <?php foreach ($relatedTools as $path => $label): ?>
          <li><a href="<?= e($path) ?>"><?= e($label) ?></a></li>
        <?php endforeach; ?>
      </ul>
    </section>
    <?php endif; ?>
    <?php if ($relatedGuides !== []): ?>
    <section class="guide-related-box">
      <h2>Related guides</h2>
      <ul>
        <?php foreach ($relatedGuides as $path => $label): ?>
          <li><a href="<?= e($path) ?>"><?= e($label) ?></a></li>
        <?php endforeach; ?>
      </ul>
    </section>
    <?php endif; ?>
  </aside>
  <?php endif; ?>
</main>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
