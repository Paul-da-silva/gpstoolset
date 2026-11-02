<?php
declare(strict_types=1);

/**
 * Map application markup (stage, chips, optional video, graph dock).
 * The caller includes the document chrome and scripts.
 *
 * $mapAppHidden: render the app hidden until a track is ready.
 * $mapAppFileInput: set false when the page already has #file-input.
 */

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
$mapShellVideo = !empty($mapShellVideo);
$mapAppHidden = !empty($mapAppHidden);
$mapAppFileInput = !isset($mapAppFileInput) || (bool) $mapAppFileInput;
?>
<div class="map-app" id="map-app"<?php if ($mapAppHidden) : ?> hidden<?php endif; ?>>
<?php if ($mapShellVideo) : ?>
  <div id="view-switch" class="view-switch" role="group" aria-label="View" hidden>
    <button type="button" id="view-map" aria-pressed="true">Map</button>
    <button type="button" id="view-video" aria-pressed="false">Video</button>
  </div>
<?php endif; ?>
  <div class="map-stage" id="map-stage">
    <div id="map" role="region" aria-label="Map"></div>

    <div class="map-chips" id="map-chips">
      <div class="chip-bar">
        <button type="button" class="chip" id="chip-open" data-file-pick>Open file</button>
        <span class="chip chip-static" id="file-name" hidden></span>
        <button type="button" class="chip" id="chip-stats" aria-pressed="false" aria-expanded="false" aria-controls="stats-panel">Stats</button>
        <button type="button" class="chip" id="chip-graphs" aria-pressed="false" aria-expanded="false" aria-controls="graphs-panel">Graphs</button>
        <button type="button" class="chip" id="chip-export" aria-pressed="false" aria-expanded="false" aria-controls="export-panel">Export</button>
      </div>
      <div id="graphs-panel" class="map-popover" hidden>
        <p class="popover-kicker">Graphs</p>
        <div class="graph-menu" role="group" aria-label="Graphs">
          <button type="button" class="chip" data-graph="speed" aria-pressed="false">Speed</button>
          <button type="button" class="chip" data-graph="altitude" aria-pressed="false">Altitude</button>
          <button type="button" class="chip" data-graph="distance" aria-pressed="false">Distance</button>
          <button type="button" class="chip" data-graph="time" aria-pressed="false">Time</button>
          <button type="button" class="chip" data-graph="verticalSpeed" data-available="false" aria-pressed="false" hidden>Vertical speed</button>
          <button type="button" class="chip" data-graph="gForce" data-available="false" aria-pressed="false" hidden>G-force</button>
        </div>
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
        <p class="empty-title"><?= e($mapShellHeading) ?></p>
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

    <?php if ($mapAppFileInput) : ?>
    <input id="file-input" class="file-input" type="file" tabindex="-1" aria-hidden="true"<?php if ($mapShellAccept !== '') : ?> accept="<?= e($mapShellAccept) ?>"<?php endif; ?>>
    <?php endif; ?>
  </div>

<?php if ($mapShellVideo) : ?>
  <div id="video-stage" class="video-stage" hidden>
    <video id="gopro-video" class="video-player" playsinline controls controlsList="nofullscreen" preload="metadata" aria-label="Video from this device"></video>
    <div class="video-overlays">
      <div id="video-metrics" class="video-metrics" aria-live="polite"></div>
      <div id="video-minimap-frame" class="video-minimap-frame" hidden>
        <div class="video-minimap-body">
          <div id="video-minimap" class="video-minimap" role="region" aria-label="Track on a map"></div>
          <p id="video-wait" class="video-wait" hidden>Waiting for GPS fix</p>
        </div>
        <button type="button" id="video-minimap-resize" class="video-minimap-resize" aria-label="Resize map"></button>
      </div>
      <div class="video-toolbar">
        <div class="video-menu-wrap">
          <button type="button" class="chip" id="video-menu-btn" aria-expanded="false" aria-controls="video-menu">Display</button>
          <div id="video-menu" class="video-menu" hidden>
            <div class="unit-switch" role="group" aria-label="Units">
              <button type="button" class="chip" data-units="metric" aria-pressed="true">Metric</button>
              <button type="button" class="chip" data-units="imperial" aria-pressed="false">Imperial</button>
            </div>
            <div class="unit-switch" role="group" aria-label="Metrics layout">
              <button type="button" class="chip" data-metrics-layout="row" aria-pressed="true">Row</button>
              <button type="button" class="chip" data-metrics-layout="column" aria-pressed="false">Column</button>
            </div>
            <div id="video-toggles" class="video-toggles" role="group" aria-label="Video overlays"></div>
          </div>
        </div>
        <button type="button" class="chip" id="video-fullscreen">Fullscreen</button>
      </div>
    </div>
  </div>
<?php endif; ?>

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
      <button type="button" class="chip" role="tab" data-dock-tab="distance" aria-controls="pane-distance" aria-pressed="false">Distance</button>
      <button type="button" class="chip" role="tab" data-dock-tab="time" aria-controls="pane-time" aria-pressed="false">Time</button>
      <button type="button" class="chip" role="tab" data-dock-tab="verticalSpeed" aria-controls="pane-verticalSpeed" aria-pressed="false">Vertical speed</button>
      <button type="button" class="chip" role="tab" data-dock-tab="gForce" aria-controls="pane-gForce" aria-pressed="false">G-force</button>
    </div>
    <div class="dock-panes">
      <div id="pane-speed" class="dock-pane" data-pane="speed" role="tabpanel" hidden>
        <p class="dock-placeholder">Speed graph will appear here.</p>
      </div>
      <div id="pane-altitude" class="dock-pane" data-pane="altitude" role="tabpanel" hidden>
        <p class="dock-placeholder">Altitude graph will appear here.</p>
      </div>
      <div id="pane-distance" class="dock-pane" data-pane="distance" role="tabpanel" hidden>
        <p class="dock-placeholder">Distance graph will appear here.</p>
      </div>
      <div id="pane-time" class="dock-pane" data-pane="time" role="tabpanel" hidden>
        <p class="dock-placeholder">Time graph will appear here.</p>
      </div>
      <div id="pane-verticalSpeed" class="dock-pane" data-pane="verticalSpeed" role="tabpanel" hidden>
        <p class="dock-placeholder">Vertical speed graph will appear here.</p>
      </div>
      <div id="pane-gForce" class="dock-pane" data-pane="gForce" role="tabpanel" hidden>
        <p class="dock-placeholder">G-force graph will appear here.</p>
      </div>
    </div>
  </section>
</div>
