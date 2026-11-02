<?php
declare(strict_types=1);

/**
 * Full-screen map layout: slim top bar, map, graph dock, floating chips.
 * No footer and no ad slots. The page may print scripts after this file,
 * then include close.php.
 *
 * Set $mapShellEmpty = false before including when the page already has a track.
 * Optional copy: $mapShellHeading, $mapShellLead, $mapShellNote,
 * $mapShellDropText, $mapShellAccept.
 */

if (!isset($page) || !is_array($page)) {
    $page = [];
}
$page['isMapPage'] = true;

$showEmpty = !isset($mapShellEmpty) || (bool) $mapShellEmpty;

$emptyLead = 'Drop a file or choose one. Nothing is uploaded.';
if (isset($mapShellLead) && is_string($mapShellLead) && $mapShellLead !== '') {
    $emptyLead = $mapShellLead;
}
$mapShellHeading = isset($mapShellHeading) && is_string($mapShellHeading) ? $mapShellHeading : '';
$mapShellNote = isset($mapShellNote) && is_string($mapShellNote) ? $mapShellNote : '';
$mapShellDrop = 'Drop a file to open it. Nothing is uploaded.';
if (isset($mapShellDropText) && is_string($mapShellDropText) && $mapShellDropText !== '') {
    $mapShellDrop = $mapShellDropText;
}
$mapShellAccept = isset($mapShellAccept) && is_string($mapShellAccept) ? $mapShellAccept : '';

require __DIR__ . '/head.php';
require __DIR__ . '/topbar.php';
?>
<div class="map-app" id="map-app">
  <div class="map-stage" id="map-stage">
    <div id="map" role="region" aria-label="Map"></div>

    <div class="map-chips" id="map-chips">
      <div class="chip-bar">
        <button type="button" class="chip" id="chip-open" data-file-pick>Open file</button>
        <span class="chip chip-static" id="file-name" hidden></span>
        <button type="button" class="chip" id="chip-stats" aria-pressed="false" aria-expanded="false" aria-controls="stats-panel">Stats</button>
        <button type="button" class="chip" id="chip-speed" data-graph="speed" aria-pressed="false">Speed</button>
        <button type="button" class="chip" id="chip-altitude" data-graph="altitude" aria-pressed="false">Altitude</button>
        <button type="button" class="chip" id="chip-export" aria-pressed="false" aria-expanded="false" aria-controls="export-panel">Export</button>
      </div>
      <div id="stats-panel" class="map-popover" hidden>
        <p class="popover-kicker">Stats</p>
        <p>Stats will appear here.</p>
      </div>
      <div id="export-panel" class="map-popover" hidden>
        <p class="popover-kicker">Export</p>
        <p>Export will be available here.</p>
      </div>
    </div>

    <div id="empty-state" class="empty-state"<?php if (!$showEmpty) : ?> hidden<?php endif; ?>>
      <div class="empty-card">
        <?php if ($mapShellHeading !== '') : ?>
        <h1 class="empty-title"><?= e($mapShellHeading) ?></h1>
        <?php endif; ?>
        <p class="empty-lead"><?= e($emptyLead) ?></p>
        <?php if ($mapShellNote !== '') : ?>
        <p class="empty-note"><?= e($mapShellNote) ?></p>
        <?php endif; ?>
        <p id="empty-error" class="empty-error" role="alert" hidden></p>
        <div class="empty-actions">
          <button type="button" class="chip" data-file-pick>Choose file</button>
          <button type="button" class="chip" id="chip-sample">Sample</button>
        </div>
        <p class="chip chip-static empty-privacy">Your file never leaves your device.</p>
      </div>
    </div>

    <div id="file-overlay" class="file-overlay" hidden>
      <p class="chip chip-static"><?= e($mapShellDrop) ?></p>
    </div>

    <input id="file-input" class="file-input" type="file" tabindex="-1" aria-hidden="true"<?php if ($mapShellAccept !== '') : ?> accept="<?= e($mapShellAccept) ?>"<?php endif; ?>>
  </div>

  <section id="graph-dock" class="graph-dock" aria-label="Graphs" hidden>
    <div
      id="dock-handle"
      class="dock-handle"
      role="separator"
      tabindex="0"
      aria-orientation="horizontal"
      aria-label="Resize graphs"
      aria-valuemin="120"
      aria-valuenow="180"
      aria-valuemax="180"
    ></div>
    <div class="dock-tabs" role="tablist" aria-label="Graph">
      <button type="button" class="chip" role="tab" data-dock-tab="speed" aria-controls="pane-speed" aria-pressed="false">Speed</button>
      <button type="button" class="chip" role="tab" data-dock-tab="altitude" aria-controls="pane-altitude" aria-pressed="false">Altitude</button>
    </div>
    <div class="dock-panes">
      <div id="pane-speed" class="dock-pane" data-pane="speed" role="tabpanel" hidden>
        <p class="dock-placeholder">Speed graph will appear here.</p>
      </div>
      <div id="pane-altitude" class="dock-pane" data-pane="altitude" role="tabpanel" hidden>
        <p class="dock-placeholder">Altitude graph will appear here.</p>
      </div>
    </div>
  </section>
</div>
<?php require APP_ROOT . '/includes/partials/tile-config.php'; ?>
<script src="/assets/vendor/leaflet/leaflet.js"></script>
<script src="/assets/js/ui-state.js"></script>
<script src="/assets/js/graph-dock.js"></script>
<script src="/assets/js/file-drop.js"></script>
<script src="/assets/js/map-shell.js"></script>
<script>
GpsMapShell.init();
</script>
