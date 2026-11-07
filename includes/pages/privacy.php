<?php
declare(strict_types=1);

/** Privacy page body. Routed by includes/router.php (config/tools.php: privacy). */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="page">
  <h1>Privacy</h1>
  <p class="page-updated">Last updated: 4 November 2026</p>
  <p>This privacy policy describes how <?= e(site('name')) ?> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares information when you use our website at <a href="<?= e(base_url('/')) ?>"><?= e(base_url('/')) ?></a>.</p>
  <p><?= e(site('name')) ?> runs GPS file tools in your browser. We do not require an account.</p>

  <h2>Files you open</h2>
  <p>Your file never leaves your device. A file you open — GPX, KML, KMZ, FIT, UBX, a GoPro video, or anything else — is read in your browser. Parsing, the map, charts, edits, and exports stay on your device. A file you download is saved by your browser.</p>
  <p>If you drop a file on the home page, the browser may keep a short-lived copy in IndexedDB so the next tool can open it. That copy stays on your device. The tool removes it as soon as it has been read, and it expires after a couple of minutes if it is left behind.</p>

  <h2>Information we collect</h2>
  <p>We do not ask for your name or an account. We use Google Analytics to see how the site is used. Google may receive technical data such as browser type, pages visited, approximate location, and an identifier stored in a cookie. Google&apos;s privacy policy governs that data.</p>

  <h2>Local storage</h2>
  <p>Some settings are stored on your device and are not sent to our servers:</p>
  <ul>
    <li>Map tool preferences, such as units, which graphs are open, dock size, and map or video view, in the browser&apos;s local storage.</li>
    <li>A point you place on Measure distance or Antipodes, kept for that browser tab and cleared when the tab closes.</li>
    <li>The short-lived file handoff described above.</li>
  </ul>
  <p>You can remove this data in your browser&apos;s site settings.</p>

  <h2>Cookies</h2>
  <p>GPS Toolset does not set its own cookies. Google Analytics may use cookies to measure visits. You can control cookies in your browser settings.</p>
  <p>Advertising is off. If we turn it on, a provider such as Google AdSense may use cookies to serve and measure ads, including ads based on your interests where you allow that. Where the law requires a choice before advertising cookies, we will ask before those cookies are used.</p>

  <h2>How we use information</h2>
  <ul>
    <li>To run the tools in your browser</li>
    <li>To remember display preferences on your device</li>
    <li>To understand traffic and improve the site</li>
    <li>To show advertisements, if advertising is enabled</li>
  </ul>

  <h2>Third-party services</h2>
  <p>We use Google Analytics for traffic analysis. Google&apos;s privacy policy is at <a href="https://policies.google.com/privacy">policies.google.com/privacy</a>.</p>
  <p>We may use Google AdSense, or a similar service, for advertising on ordinary pages. Full-screen map tools do not show ads.</p>
  <p>Map tools load map images from the OpenStreetMap tile server. Your browser requests those images directly, so the tile server can see your IP address and which map area is on screen. That request does not include your GPS file. The OpenStreetMap Foundation privacy policy is at <a href="https://osmfoundation.org/wiki/Privacy_Policy">osmfoundation.org/wiki/Privacy_Policy</a>.</p>
  <p>We do not sell your personal information.</p>

  <h2>Your rights</h2>
  <p>Where the GDPR applies, you have the right to:</p>
  <ul>
    <li>Access the personal data held about you</li>
    <li>Ask for correction or deletion of that data</li>
    <li>Withdraw consent</li>
  </ul>
  <p>We do not keep accounts or copies of your files. Data stored in your browser can be cleared in your browser settings. Analytics data is processed by Google under their privacy policy.</p>
</main>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
