<?php
declare(strict_types=1);

require dirname(__DIR__) . '/includes/bootstrap.php';

$page = [
    'title' => 'Map demo',
    'description' => 'Full-screen map shell. Your file never leaves your device.',
    'isMapPage' => true,
];

/* Sample route is drawn on load so the shell can be checked with a track. */
$mapShellEmpty = false;

require APP_ROOT . '/includes/layout/map-shell.php';
?>
<script>
(function () {
  var DEMO = [
    [51.5010, -0.1246],
    [51.5055, -0.1160],
    [51.5088, -0.1005],
    [51.5060, -0.0878],
    [51.5008, -0.0935],
    [51.4985, -0.1120],
    [51.5010, -0.1246]
  ];
  var line = null;

  function routeColor() {
    var value = getComputedStyle(document.documentElement).getPropertyValue('--route');
    value = value ? value.trim() : '';
    return value || '#0369a1';
  }

  function draw(map) {
    if (line) {
      map.removeLayer(line);
    }
    line = L.polyline(DEMO, {
      color: routeColor(),
      weight: 5,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);
    GpsMapShell.fitBounds(line.getBounds(), {
      paddingTopLeft: [56, 56],
      paddingBottomRight: [56, 72]
    });
    GpsMapShell.setEmpty(false);
  }

  GpsMapShell.onReady(function (map) {
    requestAnimationFrame(function () {
      draw(map);
    });
  });
  document.addEventListener('gpstoolset:sample', function () {
    GpsMapShell.onReady(draw);
  });
})();
</script>
<?php require APP_ROOT . '/includes/layout/close.php'; ?>
