/**
 * Figma MCP Script — Phase 1b: Semantic Color Variables (Light/Dark)
 * Requires: Phase 1a primitives collection
 */

const NS = 'dsb';

async function getCollection(name) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  return collections.find(c => c.name === name);
}

async function getOrCreateVar(name, collectionId, type = 'COLOR') {
  const vars = await figma.variables.getLocalVariablesAsync();
  let v = vars.find(x => x.name === name && x.variableCollectionId === collectionId);
  if (!v) {
    v = figma.variables.createVariable(name, collectionId, type);
    const cssName = name.replace(/\//g, '-');
    v.setVariableCodeSyntax('WEB', `var(--color-${cssName.replace('color-', '')})`);
  }
  return v;
}

const primitives = await getCollection('Primitives');
if (!primitives) return { error: 'Run phase1-import-tokens.js first' };

const primVars = await figma.variables.getLocalVariablesAsync();
const primMap = {};
primVars.filter(v => v.variableCollectionId === primitives.id).forEach(v => { primMap[v.name] = v; });

let colorColl = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Color');
if (!colorColl) {
  colorColl = figma.variables.createVariableCollection('Color');
  colorColl.addMode('dark');
}

const lightMode = colorColl.modes[0].modeId;
const darkMode = colorColl.modes[1].modeId;

const semantics = [
  { name: 'color/bg/primary', light: 'neutral/0', dark: '#1d2125' },
  { name: 'color/bg/secondary', light: 'neutral/25', dark: '#22272b' },
  { name: 'color/bg/tertiary', light: 'neutral/50', dark: '#282e33' },
  { name: 'color/bg/inverse', light: 'neutral/900', dark: 'neutral/0' },
  { name: 'color/bg/selected', light: 'brand/50', dark: 'rgba(12,102,228,0.16)' },
  { name: 'color/bg/hover', light: 'neutral/50', dark: 'rgba(255,255,255,0.04)' },
  { name: 'color/text/primary', light: 'neutral/900', dark: '#b6c2cf' },
  { name: 'color/text/secondary', light: 'neutral/600', dark: '#8c9bab' },
  { name: 'color/text/tertiary', light: 'neutral/500', dark: '#6b778c' },
  { name: 'color/text/link', light: 'brand/500', dark: '#579dff' },
  { name: 'color/border/default', light: 'neutral/200', dark: '#3d474f' },
  { name: 'color/border/subtle', light: 'neutral/100', dark: '#2c333a' },
  { name: 'color/border/focus', light: 'brand/500', dark: '#579dff' },
  { name: 'color/icon/default', light: 'neutral/600', dark: '#8c9bab' },
];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255, a: 1 };
}

function resolveValue(val) {
  if (val.startsWith('#') || val.startsWith('rgba')) {
    if (val.startsWith('rgba')) {
      const m = val.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
      return { r: +m[1]/255, g: +m[2]/255, b: +m[3]/255, a: +m[4] };
    }
    return hexToRgb(val);
  }
  const prim = primMap[val];
  if (prim) return { type: 'VARIABLE_ALIAS', id: prim.id };
  return hexToRgb('#000000');
}

const created = {};
for (const sem of semantics) {
  const v = await getOrCreateVar(sem.name, colorColl.id, 'COLOR');
  if (sem.name.includes('/bg/')) v.scopes = ['FRAME_FILL', 'SHAPE_FILL'];
  else if (sem.name.includes('/text/')) v.scopes = ['TEXT_FILL'];
  else v.scopes = ['STROKE_COLOR'];

  v.setValueForMode(lightMode, resolveValue(sem.light));
  v.setValueForMode(darkMode, resolveValue(sem.dark));
  created[sem.name] = v.id;
}

return { phase: '1b', collectionId: colorColl.id, variableCount: Object.keys(created).length, variables: created };
