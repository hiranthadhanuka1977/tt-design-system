/**
 * Figma MCP Script — Phase 1e / Session 1b: Shadow effect styles
 * Source: tokens.json shadows
 */

function c(r, g, b, a) {
  return { r: r / 255, g: g / 255, b: b / 255, a };
}

function toEffects(layers) {
  return layers.map(l => ({
    type: 'DROP_SHADOW',
    color: c(l.color.r, l.color.g, l.color.b, l.color.a),
    offset: { x: l.x, y: l.y },
    radius: l.blur,
    spread: l.spread || 0,
    visible: true,
    blendMode: 'NORMAL',
  }));
}

const defs = {
  'shadow/xs': [{ x: 0, y: 1, blur: 2, spread: 0, color: { r: 9, g: 30, b: 66, a: 0.08 } }],
  'shadow/sm': [
    { x: 0, y: 1, blur: 3, spread: 0, color: { r: 9, g: 30, b: 66, a: 0.12 } },
    { x: 0, y: 0, blur: 1, spread: 0, color: { r: 9, g: 30, b: 66, a: 0.08 } },
  ],
  'shadow/md': [
    { x: 0, y: 4, blur: 8, spread: -2, color: { r: 9, g: 30, b: 66, a: 0.12 } },
    { x: 0, y: 0, blur: 1, spread: 0, color: { r: 9, g: 30, b: 66, a: 0.08 } },
  ],
  'shadow/lg': [
    { x: 0, y: 8, blur: 16, spread: -4, color: { r: 9, g: 30, b: 66, a: 0.16 } },
    { x: 0, y: 0, blur: 1, spread: 0, color: { r: 9, g: 30, b: 66, a: 0.08 } },
  ],
  'shadow/xl': [
    { x: 0, y: 12, blur: 28, spread: -6, color: { r: 9, g: 30, b: 66, a: 0.2 } },
    { x: 0, y: 0, blur: 1, spread: 0, color: { r: 9, g: 30, b: 66, a: 0.08 } },
  ],
  'shadow/2xl': [
    { x: 0, y: 20, blur: 40, spread: -8, color: { r: 9, g: 30, b: 66, a: 0.24 } },
    { x: 0, y: 0, blur: 1, spread: 0, color: { r: 9, g: 30, b: 66, a: 0.08 } },
  ],
};

const existing = await figma.getLocalEffectStylesAsync();
const created = {};

for (const [name, layers] of Object.entries(defs)) {
  let es = existing.find(s => s.name === name);
  if (!es) es = figma.createEffectStyle();
  es.name = name;
  es.effects = toEffects(layers);
  created[name] = es.id;
}

return { phase: '1e', effectStyleCount: Object.keys(created).length, styles: created };
