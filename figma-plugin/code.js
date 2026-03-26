figma.showUI(__html__, { width: 420, height: 640, title: 'Carrusel Studio Local' });

const FONT_REGULAR = { family: 'Inter', style: 'Regular' };
const FONT_BOLD = { family: 'Inter', style: 'Bold' };

function aspectSize(aspect) {
  if (aspect === 'square') return { width: 1080, height: 1080 };
  if (aspect === 'landscape') return { width: 1500, height: 1000 };
  return { width: 1080, height: 1350 };
}

function pickPalette(payload, blueprint) {
  const source = `${payload.visualStyle || ''} ${payload.brand || ''} ${blueprint.tag || ''}`.toLowerCase();

  if (/(premium|lux|luxury|finanzas|finance|wealth|elegan)/.test(source)) {
    return {
      bg: { type: 'SOLID', color: rgb('#0f1b2d') },
      panel: { type: 'SOLID', color: rgb('#18253a') },
      soft: { type: 'SOLID', color: rgb('#243754') },
      accent: { type: 'SOLID', color: rgb('#f0c36f') },
      text: rgb('#f6f1e8'),
      muted: rgb('#c8d0dd')
    };
  }

  if (/(editorial|fashion|beauty|bold|creativ)/.test(source)) {
    return {
      bg: { type: 'SOLID', color: rgb('#f3ebff') },
      panel: { type: 'SOLID', color: rgb('#ffffff') },
      soft: { type: 'SOLID', color: rgb('#e8d9ff') },
      accent: { type: 'SOLID', color: rgb('#6e39b8') },
      text: rgb('#2f2147'),
      muted: rgb('#665678')
    };
  }

  if (/(wellness|salud|natural|organic|green)/.test(source)) {
    return {
      bg: { type: 'SOLID', color: rgb('#edf8f1') },
      panel: { type: 'SOLID', color: rgb('#ffffff') },
      soft: { type: 'SOLID', color: rgb('#d8efe0') },
      accent: { type: 'SOLID', color: rgb('#176d50') },
      text: rgb('#163f33'),
      muted: rgb('#4c6f63')
    };
  }

  return {
    bg: { type: 'SOLID', color: rgb('#eef5ff') },
    panel: { type: 'SOLID', color: rgb('#ffffff') },
    soft: { type: 'SOLID', color: rgb('#d8e8ff') },
    accent: { type: 'SOLID', color: rgb('#1f73e0') },
    text: rgb('#143865'),
    muted: rgb('#587aa4')
  };
}

function rgb(hex) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255
  };
}

function createTextLayer({ text, fontSize, fontName, fills, x, y, width, name, lineHeight }) {
  const node = figma.createText();
  node.name = name;
  node.fontName = fontName;
  node.characters = text;
  node.fontSize = fontSize;
  node.fills = [{ type: 'SOLID', color: fills }];
  if (lineHeight) {
    node.lineHeight = { unit: 'PIXELS', value: lineHeight };
  }
  if (width) {
    node.resize(width, node.height);
    node.textAutoResize = 'HEIGHT';
  }
  node.x = x;
  node.y = y;
  return node;
}

function createRect({ x, y, width, height, radius, fill, opacity, name }) {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.resize(width, height);
  rect.x = x;
  rect.y = y;
  rect.cornerRadius = radius;
  rect.fills = [fill];
  if (typeof opacity === 'number') rect.opacity = opacity;
  return rect;
}

function createSlideFrame(payload, blueprint, index) {
  const size = aspectSize(payload.aspect);
  const palette = pickPalette(payload, blueprint);
  const margin = 72;
  const frame = figma.createFrame();
  frame.name = `Slide ${index + 1} - ${blueprint.tag || 'Carrusel'}`;
  frame.resize(size.width, size.height);
  frame.fills = [palette.bg];
  frame.x = index * (size.width + 120);
  frame.y = 0;
  frame.cornerRadius = 28;
  frame.clipsContent = false;

  const tagPill = createRect({
    x: margin,
    y: margin,
    width: 260,
    height: 56,
    radius: 28,
    fill: palette.panel,
    name: 'Tag Pill'
  });

  const tagText = createTextLayer({
    text: `SLIDE ${blueprint.index} · ${String(blueprint.tag || 'Slide').toUpperCase()}`,
    fontSize: 20,
    fontName: FONT_BOLD,
    fills: palette.text,
    x: margin + 24,
    y: margin + 17,
    width: 210,
    name: 'Tag'
  });

  const title = createTextLayer({
    text: blueprint.title || 'Titulo editable',
    fontSize: size.height > size.width ? 68 : 58,
    fontName: FONT_BOLD,
    fills: palette.text,
    x: margin,
    y: 170,
    width: size.width - 460,
    lineHeight: size.height > size.width ? 76 : 64,
    name: 'Title'
  });

  const body = createTextLayer({
    text: blueprint.body || 'Texto base editable',
    fontSize: 28,
    fontName: FONT_REGULAR,
    fills: palette.muted,
    x: margin,
    y: title.y + title.height + 28,
    width: size.width - 470,
    lineHeight: 40,
    name: 'Body'
  });

  const visualPanel = createRect({
    x: size.width - 330,
    y: 190,
    width: 250,
    height: Math.min(620, size.height - 500),
    radius: 32,
    fill: palette.panel,
    name: 'Visual Panel'
  });

  const visualPanelHeader = createTextLayer({
    text: 'Direccion visual',
    fontSize: 24,
    fontName: FONT_BOLD,
    fills: palette.text,
    x: visualPanel.x + 24,
    y: visualPanel.y + 24,
    width: 180,
    name: 'Visual Header'
  });

  const visualNote = createTextLayer({
    text: blueprint.note || 'Referencia visual editable',
    fontSize: 20,
    fontName: FONT_REGULAR,
    fills: palette.muted,
    x: visualPanel.x + 24,
    y: visualPanelHeader.y + visualPanelHeader.height + 18,
    width: 200,
    lineHeight: 30,
    name: 'Visual Note'
  });

  const imagePlaceholder = createRect({
    x: size.width - 330,
    y: visualPanel.y + visualPanel.height + 28,
    width: 250,
    height: 170,
    radius: 28,
    fill: palette.soft,
    name: 'Image Placeholder'
  });

  const imageText = createTextLayer({
    text: 'Foto / mockup / captura',
    fontSize: 22,
    fontName: FONT_BOLD,
    fills: palette.text,
    x: imagePlaceholder.x + 24,
    y: imagePlaceholder.y + 58,
    width: 190,
    lineHeight: 30,
    name: 'Image Placeholder Label'
  });

  const footer = createRect({
    x: margin,
    y: size.height - 180,
    width: size.width - 410,
    height: 108,
    radius: 28,
    fill: palette.panel,
    name: 'Footer'
  });

  const footerTitle = createTextLayer({
    text: blueprint.kind || 'Slide',
    fontSize: 24,
    fontName: FONT_BOLD,
    fills: palette.text,
    x: footer.x + 24,
    y: footer.y + 22,
    width: 220,
    name: 'Footer Title'
  });

  const footerMeta = createTextLayer({
    text: `${payload.brand || 'Carrusel Studio'} · ${payload.audience || 'Editable'} · ${payload.aspectLabel || '4:5'}`,
    fontSize: 18,
    fontName: FONT_REGULAR,
    fills: palette.muted,
    x: footer.x + 24,
    y: footerTitle.y + footerTitle.height + 8,
    width: footer.width - 48,
    lineHeight: 24,
    name: 'Footer Meta'
  });

  const ctaBox = createRect({
    x: size.width - 330,
    y: size.height - 180,
    width: 250,
    height: 108,
    radius: 28,
    fill: palette.accent,
    opacity: 0.16,
    name: 'CTA Box'
  });

  const ctaText = createTextLayer({
    text: payload.cta || 'CTA editable',
    fontSize: 22,
    fontName: FONT_BOLD,
    fills: palette.text,
    x: ctaBox.x + 24,
    y: ctaBox.y + 24,
    width: 190,
    lineHeight: 28,
    name: 'CTA'
  });

  const circle = figma.createEllipse();
  circle.name = 'Accent Orb';
  circle.resize(180, 180);
  circle.x = size.width - 190;
  circle.y = 40;
  circle.fills = [palette.accent];
  circle.opacity = 0.18;

  frame.appendChild(circle);
  frame.appendChild(tagPill);
  frame.appendChild(tagText);
  frame.appendChild(title);
  frame.appendChild(body);
  frame.appendChild(visualPanel);
  frame.appendChild(visualPanelHeader);
  frame.appendChild(visualNote);
  frame.appendChild(imagePlaceholder);
  frame.appendChild(imageText);
  frame.appendChild(footer);
  frame.appendChild(footerTitle);
  frame.appendChild(footerMeta);
  frame.appendChild(ctaBox);
  frame.appendChild(ctaText);

  return frame;
}

async function createCarouselInFigma(payload, response) {
  await figma.loadFontAsync(FONT_REGULAR);
  await figma.loadFontAsync(FONT_BOLD);

  const page = figma.currentPage;
  const blueprints = Array.isArray(response.blueprints) ? response.blueprints : [];
  const created = blueprints.map((blueprint, index) => createSlideFrame(payload, blueprint, index));

  if (!created.length) {
    figma.notify('No llegaron slides para crear.');
    return;
  }

  page.selection = created;
  figma.viewport.scrollAndZoomIntoView(created);
  figma.notify(`Listo. Se crearon ${created.length} slides en Figma.`);
}

figma.ui.onmessage = async (message) => {
  if (message.type === 'create-carousel') {
    try {
      await createCarouselInFigma(message.payload, message.response);
    } catch (error) {
      figma.notify(error.message || 'No pude crear el carrusel en Figma.');
    }
  }

  if (message.type === 'cancel') {
    figma.closePlugin();
  }
};
