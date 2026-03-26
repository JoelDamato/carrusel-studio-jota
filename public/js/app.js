const state = { prompts: [] };

function addMessage(text, role = 'assistant') {
  const wrap = document.getElementById('chatMessages');
  const node = document.createElement('div');
  node.className = `msg ${role}`;
  node.textContent = text;
  wrap.appendChild(node);
  wrap.scrollTop = wrap.scrollHeight;
}

function getPayload() {
  return {
    prompt: document.getElementById('promptInput').value.trim(),
    brand: document.getElementById('brandInput').value.trim(),
    audience: document.getElementById('audienceInput').value.trim(),
    objective: document.getElementById('objectiveInput').value.trim(),
    offer: document.getElementById('offerInput').value.trim(),
    mainProblem: document.getElementById('problemInput').value.trim(),
    transformation: document.getElementById('transformationInput').value.trim(),
    cta: document.getElementById('ctaInput').value.trim(),
    visualStyle: document.getElementById('styleInput').value.trim(),
    aspect: document.getElementById('aspectInput').value,
    slides: Number(document.getElementById('slidesInput').value)
  };
}

function renderPrompts(prompts) {
  const list = document.getElementById('promptList');
  state.prompts = prompts;
  list.innerHTML = prompts.map((item) => `
    <article class="prompt-card">
      <strong>Slide ${item.index}</strong>
      <textarea data-slide-index="${item.index}">${item.prompt}</textarea>
    </article>
  `).join('');
}

function collectPromptOverrides() {
  return [...document.querySelectorAll('[data-slide-index]')].map((node) => ({
    index: Number(node.dataset.slideIndex),
    prompt: node.value.trim()
  }));
}

function promptPackText() {
  const prompts = collectPromptOverrides().filter((item) => item.prompt);
  return prompts.map((item) => `Slide ${item.index}\n${item.prompt}`).join('\n\n');
}

async function copyPromptPack() {
  const text = promptPackText();
  if (!text) {
    throw new Error('Todavía no hay prompts para copiar.');
  }
  await navigator.clipboard.writeText(text);
}

function downloadPromptPack() {
  const text = promptPackText();
  if (!text) {
    throw new Error('Todavía no hay prompts para descargar.');
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'prompt-pack-carrusel.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderGuide(steps) {
  const guide = document.getElementById('usageGuide');
  if (!steps?.length) {
    guide.innerHTML = '';
    return;
  }

  guide.innerHTML = `
    <h3>Como usar este pack</h3>
    <ol>
      ${steps.map((step) => `<li>${step}</li>`).join('')}
    </ol>
  `;
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Error HTTP ${res.status}`);
  }
  return data;
}

document.getElementById('chatForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = getPayload();
  if (!payload.prompt) return;

  addMessage(payload.prompt, 'user');
  addMessage('Estoy armando la secuencia de prompts para tu carrusel...', 'assistant');

  try {
    const response = await postJson('/api/carrusel/chat', payload);
    document.getElementById('providerBadge').textContent = 'Prompt pack listo';
    renderPrompts(response.prompts || []);
    renderGuide([
      'Revisá cada slide y ajustá tono, composición o nivel de detalle.',
      'Copiá o descargá el pack completo.',
      'Pegá cada prompt en tu generador de imágenes favorito slide por slide.',
      'Mantené el mismo estilo visual en todos para conservar consistencia de carrusel.'
    ]);
    addMessage(response.answer || 'Te dejé los prompts listos.', 'assistant');
  } catch (error) {
    addMessage(error.message, 'assistant');
  }
});

document.getElementById('copyPromptsBtn').addEventListener('click', async () => {
  try {
    await copyPromptPack();
    addMessage('Copié el pack de prompts al portapapeles.', 'assistant');
  } catch (error) {
    addMessage(error.message, 'assistant');
  }
});

document.getElementById('downloadPromptsBtn').addEventListener('click', () => {
  try {
    downloadPromptPack();
    addMessage('Te descargué el pack de prompts en TXT.', 'assistant');
  } catch (error) {
    addMessage(error.message, 'assistant');
  }
});
