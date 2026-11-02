<?php
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

$page = [
    'title' => 'GoPro GPS Extractor — Free, No Upload',
    'description' => 'Extract GPS from a GoPro video in your browser. Read the GoPro GPS data, view the track, and download a GPX, CSV, or KML file. Nothing is uploaded.',
    'isMapPage' => false,
    'allowAds' => false,
    'mapAssets' => true,
    'styles' => ['/assets/css/tool-page.css'],
];

$faq = [
    [
        'q' => 'Does the video get uploaded?',
        'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
    ],
    [
        'q' => 'Which cameras does this read?',
        'a' => 'GoPro HERO models that store GPS in the video file. Many HERO5 and newer cameras do that when GPS was on while the clip was recorded. A video shot with GPS off has no track to read.',
    ],
    [
        'q' => 'Why is there no GPS data in my video?',
        'a' => 'GPS has to be on in the camera before you record, and the camera needs time outdoors to get a fix. Indoor clips, or clips that start before the fix, can have little or no usable track.',
    ],
    [
        'q' => 'What is a GPX file?',
        'a' => 'GPX is a common file for a GPS track. Maps, watches, and sports apps can open it. This page can also save CSV for a spreadsheet or KML for an earth-style map.',
    ],
    [
        'q' => 'How large can the video be?',
        'a' => 'The limit is the memory in your browser. The page reads the GPS data in the file, not the picture stream, so a long clip is lighter than it looks. The smaller .LRV proxy has the same GPS and is quicker to open.',
    ],
    [
        'q' => 'Can I watch the clip with the map?',
        'a' => 'Yes. After the track loads, choose Video on the map. The clip plays from your device, with a small map and the numbers you leave switched on. Until the first good GPS sample, the page says it is waiting for a fix.',
    ],
    [
        'q' => 'Will this work on a phone?',
        'a' => 'Yes. Pick the video from your phone. After the track loads you can use the map or play the video. The controls are large enough to tap.',
    ],
];

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GoPro video. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>GoPro GPS Extractor</h1>
        <p class="tool-lead">Extract GPS from a GoPro video and download a GPX, CSV, or KML file. Your video stays on your device.</p>
        <ul class="tool-pills">
          <li>MP4 or LRV</li>
          <li>Map view</li>
          <li>Video view</li>
        </ul>
        <p class="tool-copy">Works with GoPro HERO video that recorded GPS. An .MP4 or the smaller .LRV proxy both work. GPS has to be on in the camera while it records. “GoPro” here is compatibility: the camera writes the track, and this page reads it.</p>
      </div>

      <div class="tool-card">
        <h2>Open a GoPro video</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a video here</span>
          <span class="tool-drop-note">or choose a file. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading GPS from the video…</p>
          <div id="landing-progress-track" class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading GPS from the video">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose video</button>
          <p class="tool-privacy">Your file never leaves your device.</p>
        </div>
        
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How it works</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open a video</h3>
          <p>Choose a GoPro .MP4 or .LRV, or drop it on this page. The .LRV proxy is smaller and usually faster, with the same GPS.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read the GPS here</h3>
          <p>The browser reads the GoPro GPS data stored in the file. That read stays on your device. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Use the track</h3>
          <p>See the path on a map, open speed and altitude, and download GPX, CSV, or KML. You can also play the clip with a live map and speed overlay.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Extract GPS from a GoPro video</h2>
      <p>This GoPro GPS extractor is for a clip you already have on your computer or phone. It reads the GPS data in the video and draws the path. When you want a file for another app, download a GoPro GPX, or take CSV or KML instead.</p>
      <p>After the track loads, the map fills the page. Speed, altitude, distance, and time sit under the map. Video view plays your clip from this device: a small map follows the camera, and you can turn each number on or off.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What you get</h2>
      <ul>
        <li>The track on a street map, fitted to the route.</li>
        <li>Speed and altitude graphs under the map.</li>
        <li>A download of the path as GPX, CSV, or KML.</li>
        <li>Video view: the clip, a live map, and a speed overlay, synced to the video clock.</li>
      </ul>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Cameras this can read</h2>
      <p>It works with GoPro HERO models that embed GPS in the video (often called GPMF). Many HERO5 and newer cameras do that when GPS was switched on for the recording. This is not a GoPro product, and it does not sign in to a camera account or a cloud library.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>Your file never leaves your device. There is no upload and no account. Closing the tab drops the video from this page.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Questions</h2>
      <div class="faq">
        <?php foreach ($faq as $item) : ?>
        <details class="faq-item">
          <summary><?= e($item['q']) ?></summary>
          <p><?= e($item['a']) ?></p>
        </details>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>More on GPS Toolset</h2>
      <p>A GPX viewer is coming on this site for a track you already have. Short guides to GPS files will live with the other tools.</p>
      <p class="tool-credit">GPS reading uses the open-source libraries <a href="https://github.com/JuanIrache/gpmf-extract">gpmf-extract</a> and <a href="https://github.com/JuanIrache/gopro-telemetry">gopro-telemetry</a> by Juan Irache, under the ISC license.</p>
    </div>
  </section>
</main>
<?php
$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';

$mapShellHeading = '';
$mapShellLead = 'Drop a video or choose one. Nothing is uploaded.';
$mapShellNote = 'Works with GoPro HERO video that recorded GPS. The file stays in this browser.';
$mapShellDropText = 'Drop a GoPro video. Nothing is uploaded.';
$mapShellAccept = '.mp4,.lrv,video/*';
$mapShellVideo = true;
$mapShellEmpty = true;
$mapAppHidden = true;
$mapAppFileInput = false;
require APP_ROOT . '/includes/layout/map-app.php';
?>
<input id="file-input" class="file-input" type="file" tabindex="-1" aria-hidden="true" accept=".mp4,.lrv,video/*">
<?php require APP_ROOT . '/includes/partials/tile-config.php'; ?>
<script src="/assets/vendor/leaflet/leaflet.js"></script>
<script src="/assets/js/ui-state.js"></script>
<script src="/assets/js/graph-dock.js"></script>
<script src="/assets/js/file-drop.js"></script>
<script src="/assets/js/map-shell.js"></script>
<script src="/assets/vendor/chartjs/chart.umd.min.js"></script>
<script src="/assets/vendor/gopro/gpmf-fast.js"></script>
<script src="/assets/vendor/gopro/gopro-telemetry-bundle.min.js"></script>
<script src="/assets/js/gopro-app.js"></script>
<script type="application/ld+json">
<?php
$faqEntities = [];
foreach ($faq as $item) {
    $faqEntities[] = [
        '@type' => 'Question',
        'name' => $item['q'],
        'acceptedAnswer' => [
            '@type' => 'Answer',
            'text' => $item['a'],
        ],
    ];
}
$schema = [
    '@context' => 'https://schema.org',
    '@graph' => [
        [
            '@type' => 'SoftwareApplication',
            'name' => 'GoPro GPS Extractor',
            'applicationCategory' => 'UtilitiesApplication',
            'operatingSystem' => 'Web',
            'url' => base_url('gopro-gps-extract'),
            'description' => $page['description'],
            'offers' => [
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
            ],
        ],
        [
            '@type' => 'FAQPage',
            'url' => base_url('gopro-gps-extract'),
            'mainEntity' => $faqEntities,
        ],
    ],
];
echo json_encode(
    $schema,
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR
);
?>
</script>
<?php require APP_ROOT . '/includes/layout/close.php'; ?>
