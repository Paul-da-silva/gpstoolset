<?php
declare(strict_types=1);
?>
<div class="preamble-inner">
  <h2>A GoPro GPS extractor that stays on your device</h2>
  <p>This page reads the GoPro GPS data stored inside a video and draws the path on a map. It is a GPS Toolset utility for people who already have a clip on their computer or phone. The video is not sent anywhere.</p>
  <p>Use it when you want to extract GPS from a GoPro video, look at the route, and leave with a file you can open somewhere else. The wording “GoPro” here is compatibility: the camera writes the track; this site just reads it.</p>

  <h2>How it works</h2>
  <ol>
    <li>Choose a video, or drop it on the map above.</li>
    <li>The browser reads the GPMF GPS data in the file. That read happens locally.</li>
    <li>The track is drawn on the map. Open Speed or Altitude when you want the graphs.</li>
    <li>Export the path, or switch to Video and play the clip against the same track.</li>
  </ol>

  <h2>What you get</h2>
  <ul>
    <li>The track on a street map, fitted to the route.</li>
    <li>Speed and altitude graphs under the map.</li>
    <li>An export of the path as GPX, CSV, or KML, including a GoPro GPX file you can open in a GPS app.</li>
    <li>Video view: play your video with a live map and speed overlay. A small map follows the camera, and you can turn speed, altitude, distance, and time on or off.</li>
  </ul>

  <h2>Cameras this can read</h2>
  <p>It works with GoPro HERO models that embed GPS in the video file (GPMF). Many HERO5 and newer cameras do that when GPS was on while the clip was recorded. A video shot with GPS off has no track to read. This is not a GoPro product, and it does not talk to a camera account or a cloud library.</p>

  <h2>Privacy</h2>
  <p>Your file never leaves your device. There is no upload and no account. Closing the tab drops the video from this page.</p>

  <h2>Questions</h2>
  <div class="faq">
    <details class="faq-item">
      <summary>Does the video get uploaded?</summary>
      <p>No. The browser reads the file where it already is. GPS Toolset does not receive a copy.</p>
    </details>
    <details class="faq-item">
      <summary>Why does Video view say it is waiting for a GPS fix?</summary>
      <p>The camera often starts recording before the GPS has a fix. Until the first valid sample, the page shows “Waiting for GPS fix” and keeps the position marker hidden. After that, the marker follows the video clock.</p>
    </details>
    <details class="faq-item">
      <summary>What if no track appears?</summary>
      <p>GPS was probably off, or this camera did not write GPS into the file. Try a clip you know was recorded with GPS on.</p>
    </details>
    <details class="faq-item">
      <summary>Which export should I use?</summary>
      <p>GPX is the usual choice for maps and watches. CSV opens in a spreadsheet. KML suits earth-style map apps.</p>
    </details>
    <details class="faq-item">
      <summary>Can I watch the clip with the map?</summary>
      <p>Yes. After the track loads, choose Video in the top bar. The clip plays from your device, with a mini map and the metrics you leave switched on. Fullscreen is on that view.</p>
    </details>
    <details class="faq-item">
      <summary>Will this work on a phone?</summary>
      <p>Yes. Pick the video from your phone, then use Map or Video. The overlay controls are large enough to tap, and fullscreen fills the screen.</p>
    </details>
  </div>

  <h2>More on GPS Toolset</h2>
  <p>When you have a GPX file, open it in the <a href="/gpx-viewer">GPX viewer</a>. Short guides to file formats and GPS topics will live under <a href="/guides/">guides</a>.</p>
</div>
