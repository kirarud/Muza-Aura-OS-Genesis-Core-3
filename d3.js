
// This file acts as a proxy to the d3 library from the CDN,
// working around a local module resolution issue.
import * as d3 from 'https://esm.sh/d3@^7.9.0';
export default d3;
