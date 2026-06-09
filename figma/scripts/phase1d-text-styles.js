/**
 * Figma MCP Script — Phase 1d: Create Text Styles
 */

await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

const styles = [
  { name: 'Heading/1', size: 28, style: 'Bold', lineHeight: 34 },
  { name: 'Heading/2', size: 24, style: 'Semi Bold', lineHeight: 29 },
  { name: 'Heading/3', size: 20, style: 'Semi Bold', lineHeight: 27 },
  { name: 'Heading/4', size: 18, style: 'Semi Bold', lineHeight: 25 },
  { name: 'Heading/5', size: 16, style: 'Medium', lineHeight: 24 },
  { name: 'Body/Medium', size: 14, style: 'Regular', lineHeight: 21 },
  { name: 'Body/Small', size: 12, style: 'Regular', lineHeight: 18 },
  { name: 'Caption', size: 11, style: 'Regular', lineHeight: 17 },
  { name: 'Label', size: 12, style: 'Medium', lineHeight: 18 },
  { name: 'Overline', size: 10, style: 'Semi Bold', lineHeight: 15 },
];

const existing = await figma.getLocalTextStylesAsync();
const created = {};

for (const s of styles) {
  let ts = existing.find(x => x.name === s.name);
  if (!ts) ts = figma.createTextStyle();
  ts.name = s.name;
  ts.fontName = { family: 'Inter', style: s.style };
  ts.fontSize = s.size;
  ts.lineHeight = { value: s.lineHeight, unit: 'PIXELS' };
  created[s.name] = ts.id;
}

return { phase: '1d', textStyleCount: Object.keys(created).length, styles: created };
