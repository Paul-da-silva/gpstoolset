<?php
declare(strict_types=1);

/**
 * Drop card shared by the converter tools.
 *
 * Expects $convertCardTitle, $convertDropTitle, $convertDropNote,
 * $convertChoose, $convertAccept, $convertDownload, $convertView.
 */
?>
<div class="tool-card convert-card">
  <h2><?= e($convertCardTitle) ?></h2>
  <div class="convert-fields">
    <label class="convert-field">From
      <select id="convert-from" aria-label="Convert from"></select>
    </label>
    <label class="convert-field">To
      <select id="convert-to" aria-label="Convert to"></select>
    </label>
  </div>
  <button type="button" class="tool-drop" data-file-pick>
    <span class="tool-drop-title"><?= e($convertDropTitle) ?></span>
    <span class="tool-drop-note"><?= e($convertDropNote) ?></span>
  </button>
  <p id="landing-file" class="tool-file" hidden></p>
  <p id="convert-status" class="convert-status" role="status" hidden></p>
  <p id="landing-error" class="tool-error" role="alert" hidden></p>
  <div id="convert-result" class="convert-result" hidden>
    <p id="convert-summary" class="convert-summary" aria-live="polite"></p>
    <div class="tool-actions">
      <button type="button" class="tool-btn" id="convert-download"><?= e($convertDownload) ?></button>
      <button type="button" class="tool-btn tool-btn-quiet" id="convert-view"><?= e($convertView) ?></button>
      <button type="button" class="tool-btn tool-btn-quiet" id="convert-another">Convert another</button>
    </div>
  </div>
  <div class="tool-actions">
    <button type="button" class="tool-btn" data-file-pick><?= e($convertChoose) ?></button>
    <p class="tool-privacy">Your file never leaves your device.</p>
  </div>
  <input type="file" id="file-input" accept="<?= e($convertAccept) ?>" hidden>
</div>
