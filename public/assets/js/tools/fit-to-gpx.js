/**
 * FIT → GPX. The file is read in the browser. It is not uploaded.
 */
import { parse } from '../parsers/fit.js';
import { start } from './convert-app.js';

start({
  slug: 'fit-to-gpx',
  extensions: ['fit'],
  reject: 'Choose a FIT file (.fit).',
  reading: 'Reading the FIT file…',
  output: 'gpx',
  download: 'Download GPX',
  view: 'View on the map',
  viewMode: 'output',
  parse: parse
});
