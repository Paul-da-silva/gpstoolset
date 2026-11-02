/**
 * KML / KMZ → GPX. The file is read in the browser. It is not uploaded.
 */
import { parse } from '../parsers/kml.js';
import { start } from './convert-app.js';

start({
  slug: 'kml-to-gpx',
  extensions: ['kml', 'kmz'],
  reject: 'Choose a KML or KMZ file (.kml or .kmz).',
  reading: 'Reading the KML…',
  output: 'gpx',
  download: 'Download GPX',
  view: 'View on the map',
  viewMode: 'output',
  parse: parse
});
