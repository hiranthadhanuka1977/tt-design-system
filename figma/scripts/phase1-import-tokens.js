/**
 * Figma MCP Script — Phase 1a: Import Primitive Color Variables
 * Usage: Pass this file contents to use_figma tool
 * Source: tokens.json primitives.color
 */

const RUN_ID = 'jrt-ds-build-001';
const NS = 'dsb';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function rgbaToRgba(rgba) {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(m[1]) / 255,
    g: parseInt(m[2]) / 255,
    b: parseInt(m[3]) / 255,
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

async function getOrCreateCollection(name) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let coll = collections.find(c => c.name === name);
  if (!coll) {
    coll = figma.variables.createVariableCollection(name);
  }
  return coll;
}

async function getOrCreateVar(name, collectionId, type = 'COLOR') {
  const vars = await figma.variables.getLocalVariablesAsync();
  let v = vars.find(x => x.name === name && x.variableCollectionId === collectionId);
  if (!v) {
    v = figma.variables.createVariable(name, collectionId, type);
    v.setVariableCodeSyntax('WEB', `var(--${name.replace(/\//g, '-')})`);
    v.scopes = [];
  }
  return v;
}

// Primitive colors from tokens.json
const primitives = {
  'brand/50': '#e8f4fd', 'brand/100': '#c5e4fa', 'brand/200': '#9ed0f5',
  'brand/300': '#6bb8ef', 'brand/400': '#3a9fe8', 'brand/500': '#0c66e4',
  'brand/600': '#0055cc', 'brand/700': '#0047b3', 'brand/800': '#003899', 'brand/900': '#002966',
  'neutral/0': '#ffffff', 'neutral/25': '#fafbfc', 'neutral/50': '#f4f5f7',
  'neutral/100': '#ebecf0', 'neutral/200': '#dfe1e6', 'neutral/300': '#c1c7d0',
  'neutral/400': '#97a0af', 'neutral/500': '#6b778c', 'neutral/600': '#505f79',
  'neutral/700': '#42526e', 'neutral/800': '#253858', 'neutral/900': '#172b4d', 'neutral/950': '#091e42',
  'success/50': '#e3fcef', 'success/100': '#abf5d1', 'success/500': '#22a06b', 'success/600': '#1f845a', 'success/700': '#216e4e',
  'warning/50': '#fff7d6', 'warning/100': '#ffe380', 'warning/500': '#e2b203', 'warning/600': '#cf9f02', 'warning/700': '#b38600',
  'danger/50': '#ffebe6', 'danger/100': '#ffbdad', 'danger/500': '#e34935', 'danger/600': '#c9372c', 'danger/700': '#ae2e24',
  'info/50': '#e9f2ff', 'info/100': '#cce0ff', 'info/500': '#1d7afc', 'info/600': '#0c66e4', 'info/700': '#0055cc',
  'discovery/50': '#f3f0ff', 'discovery/100': '#dfd8fd', 'discovery/500': '#8270db', 'discovery/600': '#6e5dc6', 'discovery/700': '#5e4db2',
  'issue/epic': '#6554c0', 'issue/story': '#36b37e', 'issue/task': '#4c9aff', 'issue/bug': '#ff5630', 'issue/subtask': '#00b8d9',
  'priority/highest': '#ff5630', 'priority/high': '#ff7452', 'priority/medium': '#ffab00', 'priority/low': '#2684ff', 'priority/lowest': '#57d9a3',
  'status/todo': '#42526e', 'status/in-progress': '#0052cc', 'status/in-review': '#6554c0', 'status/done': '#36b37e', 'status/blocked': '#ff5630',
};

const coll = await getOrCreateCollection('Primitives');
const modeId = coll.modes[0].modeId;
const created = {};

for (const [name, hex] of Object.entries(primitives)) {
  const v = await getOrCreateVar(name, coll.id, 'COLOR');
  const rgb = hexToRgb(hex);
  v.setValueForMode(modeId, { ...rgb, a: 1 });
  created[name] = v.id;
}

// Create Foundations page
let page = figma.root.children.find(p => p.name === 'Foundations');
if (!page) {
  page = figma.createPage();
  page.name = 'Foundations';
}
await figma.setCurrentPageAsync(page);

return {
  runId: RUN_ID,
  phase: '1a',
  collectionId: coll.id,
  variableCount: Object.keys(created).length,
  variables: created,
  pageId: page.id,
};
