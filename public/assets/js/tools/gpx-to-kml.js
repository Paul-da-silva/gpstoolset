/**
 * GPX → KML. The file is read in the browser. It is not uploaded.
 */
import { parse } from '../parsers/gpx.js';
import { start } from './convert-app.js';

start({
  slug: 'gpx-to-kml',
  extensions: ['gpx'],
  reject: 'Choose a GPX file (.gpx).',
  reading: 'Reading the GPX…',
  output: 'kml',
  download: 'Download KML',
  view: 'View the GPX',
  viewMode: 'source',
  parse: parse
});
