/**
 * Verify DOM-based markup formatting offline.
 * Run: node figma/scripts/verify-markup-format.js
 */
const fs = require('fs');
const path = require('path');

let parseHTML;
try {
  ({ parseHTML } = require('linkedom'));
} catch (err) {
  console.error('Install linkedom to run this script: npm install --no-save linkedom');
  process.exit(1);
}

const VOID_TAGS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isVoidTag(tag) {
  return VOID_TAGS.indexOf(tag.toLowerCase()) !== -1;
}

function meaningfulChildren(node) {
  const result = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      if (child.textContent.trim()) result.push(child);
    } else if (child.nodeType === 1) {
      result.push(child);
    }
  }
  return result;
}

function serializeNode(node, depth) {
  const tab = '  ';
  const pad = tab.repeat(depth);

  if (node.nodeType === 3) {
    return [pad + escapeText(node.textContent.trim())];
  }
  if (node.nodeType !== 1) return [];

  const tag = node.tagName.toLowerCase();
  const attrs = [...node.attributes].map((a) => `${a.name}="${escapeAttr(a.value)}"`).join(' ');
  const attrStr = attrs ? ' ' + attrs : '';

  if (isVoidTag(tag)) return [pad + `<${tag}${attrStr}>`];

  const children = meaningfulChildren(node);
  if (!children.length) return [pad + `<${tag}${attrStr}></${tag}>`];
  if (children.length === 1 && children[0].nodeType === 3) {
    return [pad + `<${tag}${attrStr}>${escapeText(children[0].textContent.trim())}</${tag}>`];
  }

  const lines = [pad + `<${tag}${attrStr}>`];
  for (const child of children) lines.push(...serializeNode(child, depth + 1));
  lines.push(pad + `</${tag}>`);
  return lines;
}

function formatHtml(html) {
  const { document } = parseHTML('<!DOCTYPE html><body><template id="t"></template></body>');
  const template = document.getElementById('t');
  template.innerHTML = html.trim();
  const lines = [];
  for (const node of template.content.childNodes) {
    lines.push(...serializeNode(node, 0));
  }
  return lines.join('\n');
}

const tests = [
  ['label', '<label class="checkbox"><input type="checkbox" checked> Notify watchers</label>'],
  ['btnGroup', '<div class="btn-group"><button class="btn btn--secondary is-active">List</button><button class="btn btn--secondary">Board</button></div>'],
  ['icons', '<span class="icon"><span class="icon-glyph icon-glyph--plus"></span></span>'],
  ['breadcrumb', '<nav class="breadcrumbs"><span class="breadcrumbs__item"><a href="#">Projects</a><span class="breadcrumbs__separator">/</span></span></nav>'],
];

let failed = 0;
for (const [name, html] of tests) {
  const out = formatHtml(html);
  const lines = out.split('\n');
  const ok = lines.length > 1 && !/^<\w[^>]*>.*<\/.+>$/.test(lines[0].trim()) || lines[0].includes('Notify');
  console.log(`\n=== ${name} (${lines.length} lines) ${ok ? 'OK' : 'CHECK'} ===`);
  console.log(out);
  if (lines.length <= 1 && html.length > 60) failed++;
}

const indexHtml = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
const demoCount = (indexHtml.match(/class="ds-demo/g) || []).length;
console.log(`\nTotal ds-demo blocks in index.html: ${demoCount}`);
console.log(failed ? `\n${failed} tests may still be single-line` : '\nAll sample tests multi-line formatted');
