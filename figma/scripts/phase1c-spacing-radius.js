/**
 * Figma MCP Script — Phase 1c: Spacing, Radius, Layout variables
 */

async function getOrCreateCollection(name, modes = ['Value']) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let coll = collections.find(c => c.name === name);
  if (!coll) {
    coll = figma.variables.createVariableCollection(name);
    modes.slice(1).forEach((m) => coll.addMode(m));
  }
  return coll;
}

async function setNumberVar(coll, name, px, scope) {
  const vars = await figma.variables.getLocalVariablesAsync();
  let v = vars.find(x => x.name === name && x.variableCollectionId === coll.id);
  if (!v) v = figma.variables.createVariable(name, coll.id, 'FLOAT');
  v.setValueForMode(coll.modes[0].modeId, px);
  v.setVariableCodeSyntax('WEB', `var(--${name.replace(/\//g, '-')})`);
  v.scopes = scope;
  return v.id;
}

const spacingColl = await getOrCreateCollection('Spacing');
const spacing = { 'spacing/0': 0, 'spacing/1': 4, 'spacing/2': 8, 'spacing/3': 12, 'spacing/4': 16, 'spacing/5': 20, 'spacing/6': 24, 'spacing/8': 32, 'spacing/10': 40, 'spacing/12': 48, 'spacing/16': 64 };
const spacingIds = {};
for (const [n, px] of Object.entries(spacing)) spacingIds[n] = await setNumberVar(spacingColl, n, px, ['GAP', 'WIDTH_HEIGHT']);

const radiusColl = await getOrCreateCollection('Radius');
const radii = { 'radius/none': 0, 'radius/xs': 2, 'radius/sm': 3, 'radius/md': 4, 'radius/lg': 6, 'radius/xl': 8, 'radius/2xl': 12, 'radius/full': 9999 };
const radiusIds = {};
for (const [n, px] of Object.entries(radii)) radiusIds[n] = await setNumberVar(radiusColl, n, px, ['CORNER_RADIUS']);

const layoutColl = await getOrCreateCollection('Layout');
const layout = { 'layout/sidebar-width': 240, 'layout/topbar-height': 48, 'layout/kanban-column-width': 280, 'layout/content-max-width': 1280 };
const layoutIds = {};
for (const [n, px] of Object.entries(layout)) layoutIds[n] = await setNumberVar(layoutColl, n, px, ['WIDTH_HEIGHT']);

return { phase: '1c', spacing: spacingIds, radius: radiusIds, layout: layoutIds };
