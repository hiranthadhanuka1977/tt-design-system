/**
 * Audit markup generation — run with: node figma/scripts/audit-markup.js
 * Uses linkedom if available; falls back to regex checks only.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const showcaseJs = fs.readFileSync(path.join(root, 'js/showcase.js'), 'utf8');

const SKIP = new Set(['intro','colors','typography','spacing','shadows','radius','layout','sample-pages','figma-mcp']);

// Extract formatHtml from showcase.js for offline test
const formatHtmlSrc = showcaseJs.match(/function formatHtml[\s\S]*?\n  \}/);
if (!formatHtmlSrc) {
  console.error('Could not extract formatHtml');
  process.exit(1);
}

const VOID_TAGS = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
eval(formatHtmlSrc[0]);

const demoBlocks = [];
const re = /<div class="(ds-demo[^"]*)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="ds-(?:demo|subsection|section)|<\/section>)/g;
let m;
while ((m = re.exec(indexHtml)) !== null) {
  demoBlocks.push({ classes: m[1], html: m[2].trim() });
}

console.log('Found ~' + demoBlocks.length + ' demo blocks (approx)\n');

const badIndentSamples = [];
demoBlocks.slice(0, 15).forEach(function (block, i) {
  const formatted = formatHtml(block.html);
  const lines = formatted.split('\n');
  const hasDeepWrong = lines.some(function (line, idx) {
    if (line.match(/^<\/\w/)) {
      const prev = lines[idx - 1] || '';
      if (prev.match(/^<\w/) && !prev.match(/\/>$/) && line.trim() === prev.trim().replace(/^</, '</').replace(/>.*/, '>')) {
        return false;
      }
    }
    // closing tag at indent 0 while previous opening was nested content on same line
    return /^<\w[^>]*>.*<\//.test(line) && line.length > 80;
  });
  if (hasDeepWrong || formatted.split('\n').length <= 2 && block.html.length > 200) {
    badIndentSamples.push({ i, classes: block.classes, lines: formatted.split('\n').length, len: block.html.length, preview: formatted.slice(0, 200) });
  }
});

console.log('Samples with likely bad formatting:', badIndentSamples.length);
badIndentSamples.slice(0, 5).forEach(function (s) {
  console.log('\n--- Demo', s.i, s.classes, '---');
  console.log(s.preview + '...');
});

// Test known problematic pattern
const labelTest = '<label class="checkbox"><input type="checkbox" checked> Notify watchers</label>';
console.log('\n=== Label test (current formatter) ===');
console.log(formatHtml(labelTest));

const nestedTest = '<div class="btn-group"><button class="btn btn--secondary is-active">List</button><button class="btn btn--secondary">Board</button></div>';
console.log('\n=== Btn group test ===');
console.log(formatHtml(nestedTest));
