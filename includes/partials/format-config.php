<?php
declare(strict_types=1);

/**
 * Inject config/formats.php as window.GPS_FORMATS for the drop zone,
 * viewer landing, editor landing, and converter landing.
 * FAQ and page copy stay on the server. The browser gets detection,
 * parser URLs, and export ids only.
 */
$client = [];
foreach (formats_registry() as $id => $format) {
    if (!is_array($format)) {
        continue;
    }
    $magic = is_array($format['magic'] ?? null) ? $format['magic'] : [];
    $client[] = [
        'id' => (string) ($format['id'] ?? $id),
        'label' => (string) ($format['label'] ?? $id),
        'extensions' => array_values(is_array($format['extensions'] ?? null) ? $format['extensions'] : []),
        'accept' => (string) ($format['accept'] ?? ''),
        'magic' => [
            'type' => (string) ($magic['type'] ?? ''),
            'root' => (string) ($magic['root'] ?? ''),
            'offset' => (int) ($magic['offset'] ?? 0),
            'value' => (string) ($magic['value'] ?? ''),
        ],
        'parser' => (string) ($format['parser'] ?? ''),
        'exporter' => (string) ($format['exporter'] ?? ''),
        'writable' => !empty($format['writable']),
        'mime' => (string) ($format['mime'] ?? ''),
        'ext' => (string) ($format['ext'] ?? ''),
        'landing' => (string) ($format['landing'] ?? ''),
        'slug' => (string) ($format['slug'] ?? ''),
    ];
}
$json = json_encode(
    $client,
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR
);
?>
<script>
window.GPS_FORMATS = <?= $json ?>;
</script>
