<?php
declare(strict_types=1);

/**
 * Map application markup (stage, controls, optional video, graph dock).
 * The caller includes the document chrome (head, topbar). Print
 * includes/partials/scripts-map.php once, after this file, for the scripts.
 *
 * $mapAppHidden: render the app hidden until a track is ready.
 * $mapAppFileInput: set false when the page already has #file-input.
 */

if (!function_exists('map_shell_icon')) {
    function map_shell_icon(string $id): string
    {
        $paths = [
            'open' => '<path d="M7 3.5h6.2L19 9.2V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M13 3.5V9h6"/>',
            'replace' => '<path d="M20 12a8 8 0 0 1-13.6 5.7L4 16"/><path d="M4 20v-4h4"/><path d="M4 12A8 8 0 0 1 17.6 6.3L20 8"/><path d="M20 4v4h-4"/>',
            'add' => '<path d="M12 6v12"/><path d="M6 12h12"/>',
            'stats' => '<path d="M5 19V10"/><path d="M12 19V5"/><path d="M19 19v-7"/>',
            'graphs' => '<path d="M4 16.5 9 11l4 3.5L20 6"/>',
            'edit' => '<path d="M4.5 19.5 8 18.6 18.8 7.8a1.6 1.6 0 0 0-2.3-2.3L5.7 16.3 4.5 19.5z"/><path d="M14.8 6.2l3 3"/>',
            'export' => '<path d="M12 4v11"/><path d="M7.5 11.5 12 16l4.5-4.5"/><path d="M5 20h14"/>',
        ];
        $class = 'map-svg';
        if ($id === 'open' || $id === 'replace' || $id === 'add') {
            $class = 'icon-' . $id;
        }
        $body = $paths[$id] ?? '';
        return '<svg class="' . $class . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . $body . '</svg>';
    }
}

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

    <div class="map-controls" id="map-controls">
      <div class="map-file">
        <span class="file-pill" id="file-name" hidden></span>
        <button type="button" class="map-icon" id="chip-open" data-file-pick aria-label="Open file" title="Open file">
          <?= map_shell_icon('open') ?>
          <?= map_shell_icon('replace') ?>
          <?= map_shell_icon('add') ?>
        </button>
      </div>
      <div class="map-actions">
        <div class="map-slot">
          <div id="stats-panel" class="map-popover" hidden>
            <p class="popover-kicker">Stats</p>
            <p>Stats will appear here.</p>
          </div>
          <button type="button" class="map-icon" id="chip-stats" aria-pressed="false" aria-expanded="false" aria-controls="stats-panel" aria-label="Stats" title="Stats"><?= map_shell_icon('stats') ?></button>
        </div>
        <div class="map-slot">
          <button type="button" class="map-icon" id="chip-graphs" aria-pressed="false" aria-expanded="false" aria-controls="graph-dock" aria-label="Graphs" title="Graphs"><?= map_shell_icon('graphs') ?></button>
        </div>
        <?php if (!empty($mapShellEditHref) || !empty($mapShellEdit)) : ?>
        <div class="map-slot">
          <?php if (!empty($mapShellEdit)) : ?>
          <div id="edit-panel" class="map-popover" hidden>
        <p class="popover-kicker">Edit</p>
        <p class="popover-note" id="edit-note">Choose one edit. The track stays as it is until you apply it.</p>
        <div class="edit-actions">
          <button type="button" class="chip" id="edit-undo" disabled>Undo</button>
        </div>
        <div id="edit-parts" class="edit-parts" hidden></div>
        <div class="edit-actions" role="group" aria-label="Choose an edit">
          <button type="button" class="chip" data-edit-mode="simplify" aria-pressed="false" disabled>Simplify</button>
          <button type="button" class="chip" data-edit-mode="trim" aria-pressed="false" disabled>Trim</button>
          <button type="button" class="chip" data-edit-mode="reverse" aria-pressed="false" disabled>Reverse</button>
          <button type="button" class="chip" data-edit-mode="elevation" aria-pressed="false" disabled>Fix elevation</button>
          <button type="button" class="chip" data-edit-mode="merge" aria-pressed="false" disabled>Merge</button>
          <button type="button" class="chip" data-edit-mode="split" aria-pressed="false" disabled>Split</button>
        </div>
        <div id="edit-mode-simplify" class="edit-block" hidden>
          <div class="edit-field">
            <label for="edit-simplify">Distance</label>
            <span class="edit-readout" id="edit-simplify-label">Off</span>
          </div>
          <input id="edit-simplify" type="range" min="0" max="200" value="0" step="1" disabled>
          <p class="popover-note">Off leaves every point. Move the slider to preview, then simplify.</p>
          <div class="edit-actions">
            <button type="button" class="chip" id="edit-simplify-apply" disabled>Simplify</button>
          </div>
        </div>
        <div id="edit-mode-trim" class="edit-block" hidden>
          <div class="edit-field">
            <span id="edit-trim-caption">Keep</span>
            <span class="edit-readout" id="edit-trim-label">Whole track</span>
          </div>
          <div class="range-pair" id="edit-trim-range">
            <div class="range-pair-fill" id="edit-trim-fill"></div>
            <input id="edit-trim-start" type="range" min="0" max="1" value="0" step="1" disabled aria-label="Trim start">
            <input id="edit-trim-end" type="range" min="0" max="1" value="1" step="1" disabled aria-label="Trim end">
          </div>
          <p class="popover-note">The bright line is the part this trim keeps.</p>
          <div class="edit-actions">
            <button type="button" class="chip" id="edit-trim-apply" disabled>Trim</button>
          </div>
        </div>
        <div id="edit-mode-reverse" class="edit-block" hidden>
          <p class="popover-note">Flips the direction. The clock still runs forward.</p>
          <div class="edit-actions">
            <button type="button" class="chip" id="edit-reverse" disabled>Reverse track</button>
          </div>
        </div>
        <div id="edit-mode-elevation" class="edit-block" hidden>
          <p class="popover-note">Smooths spikes and short gaps using nearby points in the file. It does not download new heights.</p>
          <div class="edit-actions">
            <button type="button" class="chip" id="edit-elev" disabled>Fix elevation</button>
          </div>
        </div>
        <div id="edit-mode-merge" class="edit-block" hidden>
          <p class="popover-note">Joins every part into one track, in the order listed.</p>
          <div class="edit-actions">
            <button type="button" class="chip" id="edit-merge" disabled>Merge tracks</button>
          </div>
        </div>
        <div id="edit-mode-split" class="edit-block" hidden>
          <div class="edit-field">
            <label for="edit-split">Split after</label>
            <span class="edit-readout" id="edit-split-label">—</span>
          </div>
          <input id="edit-split" type="range" min="1" max="1" value="1" step="1" disabled>
          <p class="popover-note">The bright line is the first of the two tracks.</p>
          <div class="edit-actions">
            <button type="button" class="chip" id="edit-split-apply" disabled>Split</button>
          </div>
        </div>
          </div>
          <?php endif; ?>
          <?php if (!empty($mapShellEditHref)) : ?>
          <a class="map-icon" id="chip-edit" href="<?= e($mapShellEditHref) ?>" aria-label="Edit" title="Edit"><?= map_shell_icon('edit') ?></a>
          <?php else : ?>
          <button type="button" class="map-icon" id="chip-edit" aria-pressed="false" aria-expanded="false" aria-controls="edit-panel" aria-label="Edit" title="Edit"><?= map_shell_icon('edit') ?></button>
          <?php endif; ?>
        </div>
        <?php endif; ?>
        <div class="map-slot">
          <div id="export-panel" class="map-popover" hidden>
            <p class="popover-kicker">Export</p>
            <p>Export will be available here.</p>
          </div>
          <button type="button" class="map-icon" id="chip-export" aria-pressed="false" aria-expanded="false" aria-controls="export-panel" aria-label="Export" title="Export"><?= map_shell_icon('export') ?></button>
        </div>
      </div>
      <div id="track-parts" class="track-parts" hidden></div>
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
        </div>
        <p class="chip chip-static empty-privacy">Your file never leaves your device.</p>
      </div>
    </div>

    <div id="file-overlay" class="file-overlay" hidden>
      <p class="chip chip-static"><?= e($mapShellDrop) ?></p>
    </div>

    <?php if ($mapAppFileInput) : ?>
    <input id="file-input" class="file-input" type="file" tabindex="-1" aria-hidden="true"<?php if (!empty($mapShellMultiple)) : ?> multiple<?php endif; ?><?php if ($mapShellAccept !== '') : ?> accept="<?= e($mapShellAccept) ?>"<?php endif; ?>>
    <?php endif; ?>

    <div class="map-units" role="group" aria-label="Units">
      <button type="button" data-units="metric" aria-pressed="true">Metric</button>
      <button type="button" data-units="imperial" aria-pressed="false">Imperial</button>
    </div>
    <div id="track-tip" class="track-tip" aria-live="polite" hidden></div>
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
        <button type="button" id="video-minimap-drag" class="video-minimap-drag" aria-label="Move map"></button>
        <button type="button" id="video-minimap-resize" class="video-minimap-resize" aria-label="Resize map"></button>
      </div>
      <div class="video-toolbar">
        <button type="button" class="chip" id="video-open" data-file-pick>Open file</button>
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
      <button type="button" class="chip" role="tab" data-dock-tab="heartRate" data-available="false" aria-controls="pane-heartRate" aria-pressed="false">Heart rate</button>
      <button type="button" class="chip" role="tab" data-dock-tab="verticalSpeed" data-available="false" aria-controls="pane-verticalSpeed" aria-pressed="false">Vertical speed</button>
      <button type="button" class="chip" role="tab" data-dock-tab="gForce" data-available="false" aria-controls="pane-gForce" aria-pressed="false">G-force</button>
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
      <div id="pane-heartRate" class="dock-pane" data-pane="heartRate" role="tabpanel" hidden>
        <p class="dock-placeholder">Heart rate graph will appear here.</p>
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
