const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'generated');
const PUBLIC_PREFIX = '/generated';
const SLIDE_KINDS = [
  'Hook',
  'Problema',
  'Transformacion',
  'CTA',
  'Prueba',
  'Objecion',
  'Urgencia',
  'Cierre'
];

function timestampTag() {
  const now = new Date();
  return now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
}

function normalizeAspect(aspect) {
  if (aspect === 'square') return { width: 1080, height: 1080, label: '1:1' };
  if (aspect === 'portrait') return { width: 1080, height: 1350, label: '4:5' };
  return { width: 1500, height: 1000, label: '3:2' };
}

function buildSlidePrompts(userPrompt, options = {}) {
  const brand = String(options.brand || '').trim();
  const audience = String(options.audience || '').trim();
  const objective = String(options.objective || '').trim();
  const offer = String(options.offer || '').trim();
  const mainProblem = String(options.mainProblem || '').trim();
  const transformation = String(options.transformation || '').trim();
  const visualStyle = String(options.visualStyle || '').trim();
  const cta = String(options.cta || '').trim();
  const slides = Math.max(1, Math.min(Number(options.slides || 4), 8));

  const shared = [
    'Editorial advertising image for a social media carousel.',
    userPrompt,
    brand ? `Brand context: ${brand}.` : '',
    audience ? `Target audience: ${audience}.` : '',
    objective ? `Marketing objective: ${objective}.` : '',
    offer ? `Product or service: ${offer}.` : '',
    mainProblem ? `Core problem to dramatize: ${mainProblem}.` : '',
    transformation ? `Promised transformation: ${transformation}.` : '',
    visualStyle ? `Visual direction: ${visualStyle}.` : '',
    'No text overlay, no watermark, no logo lockup, no UI screenshot.',
    'High contrast composition, clean focal point, premium art direction.',
    'Keep the same campaign universe and visual consistency across all slides.'
  ].filter(Boolean).join(' ');

  const beats = [
    'Slide 1: hook image, striking hero composition that stops the scroll.',
    'Slide 2: problem tension, show the pain point or conflict in a visual way.',
    'Slide 3: transformation, show momentum, relief, progress or solution.',
    cta
      ? `Slide 4: conversion frame inspired by this CTA: ${cta}. Make it aspirational and action-oriented without text overlay.`
      : 'Slide 4: conversion frame, aspirational outcome and strong buying energy without text overlay.',
    'Slide 5: social proof atmosphere, believable success and confidence.',
    'Slide 6: objection handling frame, clarity, trust and simplicity.',
    'Slide 7: urgency frame, decisive momentum and sharp visual contrast.',
    'Slide 8: closing frame, premium final image with memorable brand energy.'
  ];

  return Array.from({ length: slides }, (_, index) => ({
    index: index + 1,
    prompt: `${shared} ${beats[index] || beats[beats.length - 1]}`
  }));
}

function buildAssistantAnswer(userPrompt, prompts, options = {}) {
  const aspect = normalizeAspect(options.aspect);
  return [
    `Te armé ${prompts.length} prompts de carrusel en formato ${aspect.label}.`,
    'La secuencia sigue una estructura de hook, tensión, transformación y cierre comercial.',
    'Ahora podés llevar cada prompt a tu generador de imágenes favorito y mantener una dirección visual consistente.'
  ].join(' ');
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function saveFile(contents, filename) {
  await ensureOutputDir();
  const filePath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(filePath, contents);
  return `${PUBLIC_PREFIX}/${filename}`;
}

function clipText(text, limit) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 3)).trim()}...`;
}

function pickTopic(userPrompt, brand) {
  const cleaned = clipText(userPrompt, 84);
  return brand ? `${cleaned} para ${brand}` : cleaned;
}

function bodyLineFromOptions(options = {}) {
  const parts = [];
  if (options.audience) parts.push(`Pensado para ${options.audience}.`);
  if (options.objective) parts.push(`Objetivo: ${options.objective}.`);
  if (options.offer) parts.push(`Oferta: ${options.offer}.`);
  if (options.mainProblem) parts.push(`Problema central: ${options.mainProblem}.`);
  if (options.transformation) parts.push(`Transformacion prometida: ${options.transformation}.`);
  if (options.visualStyle) parts.push(`Estetica ${options.visualStyle}.`);
  if (options.brand) parts.push(`Territorio visual de ${options.brand}.`);
  return parts.join(' ');
}

function createSlideBlueprint(userPrompt, prompt, index, options = {}) {
  const topic = pickTopic(userPrompt, options.brand);
  const support = bodyLineFromOptions(options);
  const cta = clipText(options.cta || 'Reservar una llamada o escribir por DM.', 68);

  const variants = [
    {
      tag: 'Hook',
      title: clipText(topic, 54),
      body: `Abrí con una portada que detenga el scroll y deje clara la promesa principal. ${support}`.trim(),
      note: clipText(`Idea central: ${topic}. ${support}`.trim(), 110)
    },
    {
      tag: 'Problema',
      title: 'Lo que hoy te frena',
      body: `Mostrá el costo de seguir igual y el punto de tension que vive ${options.audience || 'tu audiencia'}. ${support}`.trim(),
      note: clipText(`Dolor principal de ${options.audience || 'tu audiencia'} y por qué ya no conviene postergarlo.`, 110)
    },
    {
      tag: 'Transformacion',
      title: 'Del caos a la claridad',
      body: `Representá el antes y despues con una narrativa visual limpia, concreta y aspiracional. ${support}`.trim(),
      note: clipText(`Mostrá el cambio visible que propone ${options.brand || 'tu propuesta'}.`, 110)
    },
    {
      tag: 'CTA',
      title: 'Invitacion final',
      body: `Cerrá con una accion simple y directa: ${cta}`,
      note: clipText(`Próximo paso sugerido: ${cta}`, 110)
    },
    {
      tag: 'Prueba',
      title: 'Confianza visible',
      body: 'Usá este slide para sumar resultados, credibilidad o señales de autoridad sin saturar la composicion.',
      note: 'Resultados, testimonios o señales de autoridad bien visibles.'
    },
    {
      tag: 'Objecion',
      title: 'Bajá la friccion',
      body: 'Respondé miedos comunes con una escena clara, simple y tranquilizadora que transmita control.',
      note: 'Reducí dudas con claridad, simplicidad y foco en confianza.'
    },
    {
      tag: 'Urgencia',
      title: 'Momento de decidir',
      body: 'Meté contraste, energia y direccion visual para empujar una accion inmediata sin perder elegancia.',
      note: 'Subí el ritmo visual para empujar una decisión concreta.'
    },
    {
      tag: 'Cierre',
      title: 'Recordacion de marca',
      body: `Terminá con una imagen consistente con ${options.brand || 'la identidad del proyecto'} y una sensacion premium.`,
      note: `Cierre con identidad clara y tono consistente de ${options.brand || 'marca'}.`
    }
  ];

  return {
    index,
    kind: SLIDE_KINDS[index - 1] || SLIDE_KINDS[SLIDE_KINDS.length - 1],
    ...(variants[index - 1] || variants[variants.length - 1])
  };
}

function buildCarouselBlueprints(userPrompt, prompts, options = {}) {
  return prompts.map((item, index) => (
    createSlideBlueprint(userPrompt, item.prompt, Number(item.index || index + 1), options)
  ));
}

function hashString(input) {
  return [...String(input || '')].reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) >>> 0, 7);
}

function pickTheme(options = {}, seedText = '') {
  const source = `${options.visualStyle || ''} ${options.brand || ''} ${seedText}`.toLowerCase();
  const presets = [
    {
      bgStart: '#080808',
      bgEnd: '#171717',
      accent: '#f0c36f',
      accentSoft: '#7b6640',
      text: '#f7f2ea',
      muted: '#b7b0a4',
      panel: 'rgba(18,18,18,0.82)'
    },
    {
      bgStart: '#06090f',
      bgEnd: '#111827',
      accent: '#6ca8ff',
      accentSoft: '#344766',
      text: '#edf4ff',
      muted: '#9aa6bb',
      panel: 'rgba(10,16,28,0.82)'
    },
    {
      bgStart: '#0b0a0f',
      bgEnd: '#1a1425',
      accent: '#cf8dff',
      accentSoft: '#56406c',
      text: '#f5efff',
      muted: '#aea3bc',
      panel: 'rgba(21,16,30,0.82)'
    }
  ];

  if (/(tech|ia|startup|saas|futur|azul|blue)/.test(source)) return presets[1];
  if (/(fashion|beauty|editorial|bold|violet|purple|lux|premium)/.test(source)) return presets[2];
  return presets[hashString(source) % presets.length];
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (words.length && lines.length === maxLines) {
    const joined = lines.join(' ');
    if (joined.length < String(text).trim().length) {
      lines[maxLines - 1] = clipText(lines[maxLines - 1], Math.max(8, maxCharsPerLine - 3));
    }
  }
  return lines;
}

function renderTspans(lines, x, startY, lineHeight) {
  return lines.map((line, index) => (
    `<tspan x="${x}" y="${startY + (index * lineHeight)}">${escapeXml(line)}</tspan>`
  )).join('');
}

function buildSvgSlide(blueprint, prompt, options = {}) {
  const aspect = normalizeAspect(options.aspect);
  const theme = pickTheme(options, prompt);
  const margin = Math.round(aspect.width * 0.075);
  const headerY = Math.round(aspect.height * 0.15);
  const titleFontSize = Math.round(aspect.width * (aspect.width > aspect.height ? 0.042 : 0.06));
  const bodyFontSize = Math.round(titleFontSize * 0.34);
  const metaFontSize = Math.round(bodyFontSize * 0.84);
  const noteFontSize = Math.round(bodyFontSize * 0.76);
  const titleLines = wrapText(blueprint.title, aspect.width > aspect.height ? 18 : 16, 3);
  const bodyLines = wrapText(blueprint.body, aspect.width > aspect.height ? 28 : 24, 5);
  const noteLines = wrapText(blueprint.note, aspect.width > aspect.height ? 24 : 21, 3);
  const footer = `${options.brand || 'Carrusel Studio'} · By jota · ${normalizeAspect(options.aspect).label}`;
  const footerLines = wrapText(footer, 28, 2);
  const patternId = `pattern-${blueprint.index}-${crypto.randomUUID().slice(0, 6)}`;
  const gradientId = `gradient-${blueprint.index}-${crypto.randomUUID().slice(0, 6)}`;
  const titleWidth = aspect.width > aspect.height ? Math.round(aspect.width * 0.62) : Math.round(aspect.width * 0.82);
  const noteBoxWidth = aspect.width > aspect.height ? Math.round(aspect.width * 0.3) : Math.round(aspect.width * 0.56);
  const noteBoxHeight = Math.round(aspect.height * 0.18);
  const noteBoxX = aspect.width - margin - noteBoxWidth;
  const noteBoxY = margin + Math.round(aspect.height * 0.1);
  const bodyY = headerY + Math.round(titleFontSize * 3.2);
  const footerY = aspect.height - margin - Math.round(aspect.height * 0.16);
  const ctaText = clipText(options.cta || 'Escribime y te cuento mas', 34);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${aspect.width}" height="${aspect.height}" viewBox="0 0 ${aspect.width} ${aspect.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0" y1="0" x2="${aspect.width}" y2="${aspect.height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${theme.bgStart}"/>
      <stop offset="1" stop-color="${theme.bgEnd}"/>
    </linearGradient>
    <pattern id="${patternId}" width="52" height="52" patternUnits="userSpaceOnUse">
      <path d="M0 51H52" stroke="${theme.accentSoft}" stroke-opacity="0.28"/>
      <path d="M51 0V52" stroke="${theme.accentSoft}" stroke-opacity="0.28"/>
    </pattern>
  </defs>

  <rect width="${aspect.width}" height="${aspect.height}" rx="38" fill="url(#${gradientId})"/>
  <rect x="${margin}" y="${margin}" width="${aspect.width - (margin * 2)}" height="${aspect.height - (margin * 2)}" rx="34" fill="url(#${patternId})"/>
  <circle cx="${Math.round(aspect.width * 0.84)}" cy="${Math.round(aspect.height * 0.18)}" r="${Math.round(aspect.width * 0.14)}" fill="${theme.accent}" fill-opacity="0.16"/>
  <circle cx="${Math.round(aspect.width * 0.15)}" cy="${Math.round(aspect.height * 0.84)}" r="${Math.round(aspect.width * 0.11)}" fill="${theme.accent}" fill-opacity="0.12"/>
  <rect x="${margin}" y="${margin}" width="${Math.round(aspect.width * 0.32)}" height="${Math.round(aspect.height * 0.055)}" rx="18" fill="${theme.panel}"/>
  <text x="${margin + 18}" y="${margin + 36}" fill="${theme.accent}" font-family="Arial, Helvetica, sans-serif" font-size="${metaFontSize}" font-weight="700" letter-spacing="1.2">${escapeXml(`SLIDE ${blueprint.index} · ${blueprint.tag.toUpperCase()}`)}</text>
  <text x="${aspect.width - margin - 118}" y="${margin + 36}" fill="${theme.muted}" font-family="Arial, Helvetica, sans-serif" font-size="${noteFontSize}" font-weight="700" letter-spacing="1">${escapeXml('BY JOTA')}</text>

  <text x="${margin}" y="${headerY}" fill="${theme.text}" font-family="Georgia, Times New Roman, serif" font-size="${titleFontSize}" font-weight="700" textLength="${titleWidth}">
    ${renderTspans(titleLines, margin, headerY, Math.round(titleFontSize * 1.08))}
  </text>

  <text x="${margin}" y="${bodyY}" fill="${theme.muted}" font-family="Arial, Helvetica, sans-serif" font-size="${bodyFontSize}" font-weight="500">
    ${renderTspans(bodyLines, margin, bodyY, Math.round(bodyFontSize * 1.45))}
  </text>

  <rect x="${noteBoxX}" y="${noteBoxY}" width="${noteBoxWidth}" height="${noteBoxHeight}" rx="28" fill="${theme.panel}" stroke="${theme.accentSoft}" stroke-opacity="0.6"/>
  <text x="${noteBoxX + 24}" y="${noteBoxY + 34}" fill="${theme.accent}" font-family="Arial, Helvetica, sans-serif" font-size="${metaFontSize}" font-weight="700">${escapeXml('Instagram angle')}</text>
  <text x="${noteBoxX + 24}" y="${noteBoxY + 74}" fill="${theme.text}" font-family="Arial, Helvetica, sans-serif" font-size="${noteFontSize}" font-weight="500">
    ${renderTspans(noteLines, noteBoxX + 24, noteBoxY + 74, Math.round(noteFontSize * 1.48))}
  </text>

  <rect x="${margin}" y="${footerY}" width="${Math.round(aspect.width * 0.58)}" height="${Math.round(aspect.height * 0.12)}" rx="24" fill="${theme.panel}" stroke="${theme.accentSoft}" stroke-opacity="0.6"/>
  <text x="${margin + 22}" y="${footerY + 34}" fill="${theme.text}" font-family="Arial, Helvetica, sans-serif" font-size="${metaFontSize}" font-weight="700">${escapeXml(blueprint.kind)}</text>
  <text x="${margin + 22}" y="${footerY + 70}" fill="${theme.muted}" font-family="Arial, Helvetica, sans-serif" font-size="${noteFontSize}" font-weight="500">
    ${renderTspans(footerLines, margin + 22, footerY + 70, Math.round(noteFontSize * 1.38))}
  </text>

  <rect x="${noteBoxX}" y="${footerY}" width="${noteBoxWidth}" height="${Math.round(aspect.height * 0.12)}" rx="24" fill="${theme.accent}" fill-opacity="0.18"/>
  <text x="${noteBoxX + 24}" y="${footerY + 34}" fill="${theme.text}" font-family="Arial, Helvetica, sans-serif" font-size="${metaFontSize}" font-weight="700">${escapeXml(ctaText)}</text>
  <text x="${noteBoxX + 24}" y="${footerY + 70}" fill="${theme.muted}" font-family="Arial, Helvetica, sans-serif" font-size="${noteFontSize}" font-weight="500">${escapeXml('Imagen lista para descargar en PNG y subir a Instagram.')}</text>
</svg>`;
}

async function generateEditableSlide(prompt, blueprint, options = {}) {
  const svg = buildSvgSlide(blueprint, prompt, options);
  const filename = `slide-${timestampTag()}-${crypto.randomUUID().slice(0, 8)}.svg`;
  const url = await saveFile(svg, filename);
  return { url, filename };
}

function buildExportGuide(options = {}) {
  const aspect = normalizeAspect(options.aspect);
  return [
    `Generá cada slide en formato ${aspect.label}, ideal para carrusel de Instagram.`,
    'Si querés publicar directo, usá "Descargar PNG" y subí esos archivos a Instagram.',
    'Si querés editar después, también podés abrir o descargar el SVG.',
    'El botón "Descargar todo en PNG" te baja el carrusel completo slide por slide.'
  ];
}

async function generateCarousel(userPrompt, options = {}) {
  const promptOverrides = Array.isArray(options.promptOverrides) ? options.promptOverrides : null;
  const prompts = promptOverrides && promptOverrides.length
    ? promptOverrides.map((item, index) => ({ index: Number(item.index || index + 1), prompt: String(item.prompt || '').trim() })).filter((item) => item.prompt)
    : buildSlidePrompts(userPrompt, options);
  const blueprints = buildCarouselBlueprints(userPrompt, prompts, options);

  const images = [];
  for (const [index, item] of prompts.entries()) {
    const blueprint = blueprints[index];
    const image = await generateEditableSlide(item.prompt, blueprint, options);
    images.push({ slide: item.index, prompt: item.prompt, blueprint, ...image });
  }

  return { prompts, images, exportGuide: buildExportGuide(options) };
}

module.exports = {
  buildSlidePrompts,
  buildCarouselBlueprints,
  buildAssistantAnswer,
  generateCarousel
};
