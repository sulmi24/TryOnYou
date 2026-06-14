/* Nomoo Virtual Try-On Presentation */

const BRAND = {
  color: '#111111',
  accent: '#8A1538',
  bg: '#FFFFFF',
  text: '#111111',
  muted: '#6B7280',
  aiIcon: '#9CA3AF',
};

let content = null;
let lang = 'ar';
let currentSlide = 0;
let demoMode = 'clothing';
let demoPiece = 'shawl';
let demoSelections = { shawl: 1, top: 0, pants: 0 };
let demoStyle = 'top'; // legacy compat for furniture keys

let slideObserver = null;
let isNavigating = false;
let autoPlayTimer = null;
let progressTimer = null;
let demoProgress = 0;
let isScanning = false;
let shawlTransition = null;
let flowStepCurrent = 3;
let navyHoverTimer = null;
let flowSimStep = 1;
let flowSimTimer = null;

const FLOW_ASSETS = {
  product: 'assets/shawl-product-k101.png',
  modelGreen: 'assets/model-green-shawl.png',
  modelNavy: 'assets/model-navy-shawl.png',
};

const PERSON_IMG = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=750&fit=crop&crop=face';
const TOY_VIDEO_URL = 'https://storage.googleapis.com/gweb-uniblog-publish-prod/original_videos/ToY_User_Flow_Under_32MB.mp4';

let videoReady = false;
let videoFallback = false;
let videoSegments = { gulf: 0, omani: 8, shoulder: 16 };
const STYLE_ORDER = ['gulf', 'omani', 'shoulder'];
const OUTFITS = {
  gulf: {
    color: '#F5F5F4', accent: '#8A1538', border: '#D4AF37',
    path: 'M70,200 Q150,175 230,200 L240,460 Q150,480 60,460 Z',
    detail: 'M90,220 L210,220 M85,280 L215,280 M90,340 L210,340',
  },
  omani: {
    color: '#F5E6C8', accent: '#B8860B', border: '#8B6914',
    path: 'M65,195 Q150,168 235,195 L245,465 Q150,485 55,465 Z',
    detail: 'M80,215 Q150,195 220,215 M75,270 Q150,250 225,270 M75,330 Q150,310 225,330',
  },
  shoulder: {
    color: '#1B4332', accent: '#D4AF37', border: '#2D6A4F',
    path: 'M45,190 L255,190 L235,310 L150,350 L65,310 Z M70,310 L240,310 L235,465 Q150,485 65,465 Z',
    detail: 'M150,190 L150,350 M45,190 L150,240 L255,190',
  },
};
const FURNITURE = {
  sofa: { color: '#8B7355', w: 180, h: 70 },
  table: { color: '#C4A35A', w: 100, h: 8 },
  carpet: { color: '#2D6A4F', w: 200, h: 40 },
};

async function init() {
  try {
    const res = await fetch('content.json');
    content = await res.json();
  } catch {
    content = window.PRESENTATION_CONTENT;
  }
  if (!content) return;
  renderSlides();
  setupNavigation();
  setupLanguage();
  setupDemo();
  setupKeyboard();
  updateUI();
}

function t(obj, key) {
  return lang === 'ar' ? obj[key + 'Ar'] || obj[key] : obj[key + 'En'] || obj[key];
}

/** Inline emphasis: **bold** and [[accent bold]] */
function rich(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[\[(.+?)\]\]/g, '<strong class="font-bold text-accent">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
}

function richT(obj, key) {
  return rich(t(obj, key));
}

function ctaLabel(obj, key) {
  return `<strong class="font-bold">${t(obj, key)}</strong>`;
}

function slideCount() {
  return content?.slides?.length ?? 6;
}

function slideIds() {
  return Array.from({ length: slideCount() }, (_, i) => `slide-${i}`);
}

function renderSlides() {
  const container = document.getElementById('slides');
  const s = content.slides;

  container.innerHTML = [
    createHero(s[0]),
    createProblems(s[1]),
    createHowItWorks(s[2]),
    createDemoSlide(s[3]),
    createValue(s[4]),
    createCTA(s[5]),
  ].join('');
}

function slideWrapper(id, inner, extra = '') {
  return `<section id="${id}" class="slide w-full flex items-center justify-center px-6 py-20 ${extra}">${inner}</section>`;
}

function sectionLabel(slide) {
  return `<span class="section-label">${t(slide, 'title')}</span>`;
}

function createHero(s) {
  const tagline = lang === 'ar' ? content.brand.tagline : content.brand.taglineEn;
  return slideWrapper('slide-0', `
    <div class="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div class="animate-fade-up text-center lg:text-${lang === 'ar' ? 'right' : 'left'} order-2 lg:order-1">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 leading-[1.08] tracking-tight text-[#111111]">
          ${t(s, 'title')}
        </h1>
        <div class="mb-4">
          <p class="text-xl md:text-2xl font-bold text-[#111111]">${t(s, 'subProduct')}</p>
          <p class="text-sm font-semibold text-accent mt-1">${t(s, 'subProductTag')}</p>
        </div>
        <p class="text-lg md:text-xl text-gray-600 mb-4 leading-relaxed">${richT(s, 'subtitle')}</p>
        <p class="text-gray-500 mb-8 max-w-lg ${lang === 'ar' ? 'lg:mr-0' : 'lg:ml-0'} mx-auto lg:mx-0 leading-relaxed">${richT(s, 'desc')}</p>
        <div class="flex gap-3 flex-wrap justify-center lg:justify-start">
          <button onclick="goTo(3)" class="btn-primary">${lang === 'ar' ? '▶ جرب المعاينة' : '▶ Try Live Demo'}</button>
          <button onclick="goTo(1)" class="btn-secondary">${lang === 'ar' ? 'لماذا تحتاجه؟' : 'Why you need it'}</button>
        </div>
        <p class="mt-10 text-xs text-gray-400 font-medium tracking-wide">${tagline}</p>
      </div>
      <div class="flex justify-center animate-fade-up order-1 lg:order-2" id="hero-viewport">
        ${renderTryOnViewer(demoStyle, 'hero')}
      </div>
    </div>
  `, 'slide-bg-hero');
}

function createProblems(s) {
  const cards = s.items.map(item => `
    <div class="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
      <span class="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></span>
      <h3 class="font-bold text-[#111111] text-sm md:text-base">${t(item, 'title')}</h3>
    </div>
  `).join('');

  return slideWrapper('slide-1', `
    <div class="max-w-6xl mx-auto w-full animate-fade-up">
      ${sectionLabel(s)}
      <h2 class="text-3xl md:text-4xl font-bold mb-2 text-[#111111]">${richT(s, 'heading')}</h2>
      <p class="text-xl font-bold text-accent mb-3">${richT(s, 'subheading')}</p>
      <p class="text-gray-500 mb-8 max-w-3xl">${richT(s, 'desc')}</p>
      <p class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">${t(s, 'challengesLabel')}</p>
      <div class="grid sm:grid-cols-2 gap-3 mb-8">${cards}</div>
      <div class="rounded-2xl p-6 text-white text-center text-base md:text-lg leading-relaxed solution-banner">${richT(s, 'solution')}</div>
    </div>
  `, 'bg-gray-50');
}

function createHowItWorks(s) {
  const stepsHtml = s.steps.map(step => `
    <div class="flow-step-card pro-card rounded-2xl p-4 md:p-5 border border-gray-200 bg-white flex gap-3 items-start cursor-pointer transition-all duration-300 ${step.isCta ? 'ring-2 ring-[#8A1538]/20' : ''}" data-flow-step="${step.num}" role="button" tabindex="0" onclick="setFlowSimStep(${step.num})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setFlowSimStep(${step.num})}">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 step-badge">${step.num}</div>
      <div>
        <h3 class="font-bold mb-1 text-sm md:text-base ${step.isCta ? 'text-accent' : 'text-[#111111]'}">${step.isCta ? ctaLabel(step, 'title') : t(step, 'title')}</h3>
        <p class="text-gray-500 text-xs md:text-sm">${richT(step, 'desc')}</p>
      </div>
    </div>
  `).join('');

  return slideWrapper('slide-2', `
    <div class="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-14 items-center animate-fade-up">
      <div>
        ${sectionLabel(s)}
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-[#111111]">${richT(s, 'heading')}</h2>
        <p class="text-gray-500 mb-4">${richT(s, 'desc')}</p>
        <div class="inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-feature text-sm mb-6">
          <span>✦</span>
          <span>${ctaLabel(s, 'buttonLabel')}</span>
        </div>
        <div id="flow-step-cards" class="grid sm:grid-cols-2 gap-3 mb-6">${stepsHtml}</div>
        <p class="text-gray-600 text-sm leading-relaxed border-t border-gray-200 pt-5">${richT(s, 'goal')}</p>
      </div>
      <div class="product-page-mock mx-auto w-full max-w-sm">
        ${renderFlowSimulator()}
      </div>
    </div>
  `, 'slide-bg-mesh');
}

function renderFlowSimulator() {
  const addCart = lang === 'ar' ? 'إضافة للسلة' : 'Add to Cart';
  const tryOn = lang === 'ar' ? 'شاهد كيف يبدو عليك' : 'See how it looks on you';
  const uploadLabel = lang === 'ar' ? 'ارفع صورتك أو التقطها' : 'Upload or take your photo';
  const aiLabel = lang === 'ar' ? 'ذكاء اصطناعي' : 'AI Try-On';
  const processingLabel = lang === 'ar' ? 'جاري الدمج...' : 'Merging...';
  const successLabel = lang === 'ar' ? 'جاهز للشراء ✓' : 'Ready to buy ✓';
  const productName = lang === 'ar' ? 'شال يمني — K101' : 'Yemeni Shawl — K101';
  const price = lang === 'ar' ? '٤٩٩ ر.س' : 'SAR 499';

  return `
    <div id="flow-simulator" class="flow-simulator rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" data-step="1">
      <div class="flow-sim-viewport relative rounded-xl overflow-hidden bg-gray-50 mb-4">
        <div class="flow-scene flow-scene-1 absolute inset-0">
          <div class="flow-sim-product-area absolute inset-0 overflow-hidden bg-[#E8E8ED]">
            <img src="${FLOW_ASSETS.product}" alt="" class="shawl-product-img"/>
          </div>
        </div>
        <div class="flow-scene flow-scene-2 absolute inset-0 flex items-center justify-center p-5">
          <div class="flow-upload-box w-full h-full min-h-[220px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 bg-white">
            <div class="flow-upload-icon w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <p class="text-sm text-gray-500 font-medium text-center px-4">${uploadLabel}</p>
            <div class="flow-upload-thumb w-20 h-28 rounded-lg overflow-hidden border-2 border-accent shadow-md">
              <img src="${FLOW_ASSETS.modelGreen}" alt="" class="w-full h-full object-cover object-top scale-125"/>
            </div>
          </div>
        </div>
        <div class="flow-scene flow-scene-3 absolute inset-0">
          <img src="${FLOW_ASSETS.modelGreen}" alt="" class="flow-scene-model w-full h-full object-cover object-top"/>
          <div class="flow-ai-overlay absolute inset-0">
            <div class="flow-ai-grid"></div>
            <div class="flow-ai-scan"></div>
            <div class="flow-ai-product-float">
              <img src="${FLOW_ASSETS.product}" alt="" class="shawl-product-img"/>
            </div>
            <div class="flow-ai-badge">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              ${aiLabel}
            </div>
            <p class="flow-ai-status">${processingLabel}</p>
          </div>
        </div>
        <div class="flow-scene flow-scene-4 absolute inset-0">
          <img src="${FLOW_ASSETS.modelNavy}" alt="" class="flow-scene-model w-full h-full object-cover object-top"/>
          <div class="flow-color-pills">
            <span class="flow-swatch flow-swatch-green" title="${lang === 'ar' ? 'أخضر' : 'Green'}"></span>
            <span class="flow-swatch flow-swatch-navy active" title="${lang === 'ar' ? 'كحلي' : 'Navy'}"></span>
          </div>
          <div class="flow-success-pill">${successLabel}</div>
        </div>
      </div>
      <p class="font-semibold text-sm text-[#111111] mb-1">${productName}</p>
      <p class="text-accent font-bold text-sm mb-4">${price}</p>
      <div class="flow-sim-actions">
        <div class="h-11 w-full rounded-xl bg-[#111111] text-white flex items-center justify-center text-sm font-semibold mb-3">${addCart}</div>
        <button type="button" class="flow-sim-cta h-11 w-full rounded-xl btn-feature flex items-center justify-center text-sm gap-2" onclick="advanceFlowSim()">
          <span>✦</span><strong class="font-bold">${tryOn}</strong>
        </button>
      </div>
    </div>`;
}

function setFlowSimStep(step, { restartTimer = true } = {}) {
  flowSimStep = Math.max(1, Math.min(4, step));
  const sim = document.getElementById('flow-simulator');
  if (sim) sim.dataset.step = String(flowSimStep);

  document.querySelectorAll('.flow-step-card').forEach(card => {
    const n = Number(card.dataset.flowStep);
    card.classList.toggle('flow-step-card-active', n === flowSimStep);
  });

  if (restartTimer && currentSlide === 2) scheduleFlowSimNext();
}

function advanceFlowSim() {
  setFlowSimStep(flowSimStep >= 4 ? 1 : flowSimStep + 1);
}

function scheduleFlowSimNext() {
  clearTimeout(flowSimTimer);
  const delays = { 1: 3200, 2: 2800, 3: 3200, 4: 3200 };
  flowSimTimer = setTimeout(() => {
    setFlowSimStep(flowSimStep >= 4 ? 1 : flowSimStep + 1);
  }, delays[flowSimStep] || 3000);
}

function startFlowSimAutoPlay() {
  stopFlowSimAutoPlay();
  setFlowSimStep(1, { restartTimer: false });
  scheduleFlowSimNext();
}

function stopFlowSimAutoPlay() {
  clearTimeout(flowSimTimer);
  flowSimTimer = null;
}

function createDemoSlide(s) {
  const tips = (lang === 'ar' ? s.tipsAr : s.tipsEn).map(tip => `
    <li class="flex items-center gap-3 text-gray-700 text-sm">
      <span class="w-5 h-5 rounded-full check-accent text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
      <span>${rich(tip)}</span>
    </li>
  `).join('');

  return slideWrapper('slide-3', `
    <div class="max-w-6xl mx-auto w-full">
      ${sectionLabel(s)}
      <h2 class="text-3xl md:text-4xl font-extrabold mb-2 text-[#111111]">${richT(s, 'heading')}</h2>
      <p class="text-gray-500 mb-4 max-w-3xl">${richT(s, 'desc')}</p>
      <ul class="flex flex-wrap gap-x-6 gap-y-2 mb-8">${tips}</ul>
      <div id="demo-section" class="demo-panel rounded-3xl p-6 md:p-10 overflow-hidden">
        <div class="flex flex-col xl:flex-row items-start gap-8">
          <div class="flex-1 w-full min-w-0">
            <div id="demo-controls"></div>
            <div class="demo-progress mt-4"><div id="demo-progress-bar" class="demo-progress-bar" style="width:0%"></div></div>
          </div>
          <div id="demo-viewport" class="flex-shrink-0 w-full xl:w-auto flex justify-center"></div>
        </div>
      </div>
    </div>
  `, 'slide-bg-mesh');
}

function createValue(s) {
  const storeCards = s.storeItems.map(item => `
    <div class="bg-white rounded-2xl p-5 border border-gray-200">
      <h3 class="font-bold mb-1 text-[#111111]">${t(item, 'title')}</h3>
      <p class="text-gray-500 text-sm leading-relaxed">${richT(item, 'desc')}</p>
    </div>
  `).join('');

  const customerCards = s.customerItems.map(item => `
    <div class="bg-white rounded-2xl p-5 border border-gray-200">
      <h3 class="font-bold mb-1 text-[#111111]">${t(item, 'title')}</h3>
      <p class="text-gray-500 text-sm leading-relaxed">${richT(item, 'desc')}</p>
    </div>
  `).join('');

  const sectorPills = s.sectors.map(sec =>
    `<span class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">${t(sec, 'title')}</span>`
  ).join('');

  return slideWrapper('slide-4', `
    <div class="max-w-6xl mx-auto w-full">
      ${sectionLabel(s)}
      <h2 class="text-3xl md:text-4xl font-bold mb-8 text-[#111111]">${richT(s, 'heading')}</h2>
      <p class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">${t(s, 'storeLabel')}</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">${storeCards}</div>
      <p class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">${t(s, 'customerLabel')}</p>
      <div class="grid sm:grid-cols-2 gap-4 mb-8 max-w-2xl">${customerCards}</div>
      <p class="text-sm text-gray-500 mb-3">${t(s, 'sectorsLabel')}</p>
      <div class="flex flex-wrap gap-2">${sectorPills}</div>
    </div>
  `, 'bg-gray-50');
}

function createCTA(s) {
  const contact = content.brand;
  const tagline = lang === 'ar' ? contact.tagline : contact.taglineEn;
  const copyright = lang === 'ar' ? contact.copyrightAr : contact.copyrightEn;

  return slideWrapper('slide-5', `
    <div class="max-w-3xl mx-auto w-full text-center">
      ${sectionLabel(s)}
      <h2 class="text-3xl md:text-4xl font-bold mb-2 text-[#111111]">${richT(s, 'heading')}</h2>
      <p class="text-xl font-bold text-accent mb-4">${richT(s, 'subheading')}</p>
      <p class="text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">${richT(s, 'desc')}</p>
      <div class="rounded-2xl p-10 text-white mb-10 vision-cta-box">
        <p class="text-xs font-extrabold tracking-[0.2em] uppercase mb-3 opacity-90">${t(s, 'badge')}</p>
        <p class="text-2xl md:text-3xl font-extrabold mb-6">${t(s, 'cta')}</p>
        <a href="mailto:${contact.contact.email}" class="inline-block px-10 py-4 rounded-xl bg-[#111111] text-white font-bold text-lg hover:opacity-90 transition">${t(s, 'button')}</a>
      </div>
      <p class="text-sm text-gray-400 font-medium mb-6">${tagline}</p>
      <div class="flex flex-wrap justify-center gap-8 text-gray-500 mb-8">
        <div><span class="block text-xs uppercase tracking-wider mb-1">${lang === 'ar' ? 'الهاتف' : 'Phone'}</span><span class="font-semibold text-[#111111]">${contact.contact.phone}</span></div>
        <div><span class="block text-xs uppercase tracking-wider mb-1">${lang === 'ar' ? 'البريد' : 'Email'}</span><span class="font-semibold text-[#111111]">${contact.contact.email}</span></div>
        <div><span class="block text-xs uppercase tracking-wider mb-1">${lang === 'ar' ? 'الموقع' : 'Website'}</span><span class="font-semibold text-[#111111]">${contact.contact.website}</span></div>
      </div>
      <p class="text-xs text-gray-400 font-medium">${copyright}</p>
    </div>
  `);
}

function setupDemo() {
  [FLOW_ASSETS.product, FLOW_ASSETS.modelGreen, FLOW_ASSETS.modelNavy].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
  renderDemo();
  startAutoPlay();
}

function maleState() {
  return { piece: demoPiece, selections: { ...demoSelections } };
}

function renderTryOnViewer(_style, context = 'demo') {
  if (demoMode === 'furniture') return renderFurnitureRoom(demoStyle);
  const flowStep = context === 'demo' ? flowStepCurrent : 3;
  return MaleTryOn.render(maleState(), lang, context, isScanning, flowStep, shawlTransition);
}

function renderTryOnVideo(context = 'demo') {
  const d = content?.demo?.styles || {};
  const thumbs = STYLE_ORDER.map(key => {
    const val = d[key] || { ar: key, en: key };
    const outfit = OUTFITS[key];
    return `<button type="button" class="toy-thumb ${demoStyle === key ? 'active' : ''}" data-style="${key}" onclick="setDemoStyle('${key}')" title="${lang === 'ar' ? val.ar : val.en}">
      <span class="toy-thumb-swatch" style="background:linear-gradient(135deg,${outfit.color},${outfit.accent})"></span>
      <span class="toy-thumb-label">${lang === 'ar' ? val.ar : val.en}</span>
    </button>`;
  }).join('');

  return `
    <div class="phone-mockup ${context === 'hero' ? 'scale-90' : ''} ${context === 'interface' ? 'scale-75' : ''}">
      <div class="phone-screen">
        <div id="tryon-${context}" class="tryon-stage tryon-video-stage relative w-full h-full" data-context="${context}">
          <video class="tryon-video" data-context="${context}" src="${TOY_VIDEO_URL}" autoplay muted loop playsinline webkit-playsinline preload="auto"></video>
          <div class="video-shimmer"></div>
          <div class="video-scan-flash"></div>
          <div class="ar-brackets"><span></span><span></span><span></span><span></span></div>
          <span class="compare-label compare-before">${lang === 'ar' ? 'قبل' : 'Before'}</span>
          <span class="compare-label compare-after">${lang === 'ar' ? 'بعد AI' : 'After AI'}</span>
          <div class="toy-ui-bar">
            <p class="toy-ui-title">${lang === 'ar' ? '▶ جرّب المظهر' : '▶ Try the look'}</p>
            <div class="toy-thumbnails">${thumbs}</div>
          </div>
          <div class="ai-badge video-processing">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            ${lang === 'ar' ? 'ذكاء اصطناعي' : 'AI Try-On'}
          </div>
          <div class="video-fallback hidden" data-fallback="${context}"></div>
        </div>
      </div>
    </div>`;
}

function renderTryOnPhone(style, context = 'demo') {
  const outfit = OUTFITS[style] || OUTFITS.gulf;
  const id = `tryon-${context}`;
  const scanning = isScanning ? 'scanning' : '';
  const label = lang === 'ar' ? 'جاري المعالجة...' : 'AI Processing...';

  return `
    <div class="phone-mockup ${context === 'hero' ? 'scale-90' : ''} ${context === 'interface' ? 'scale-75' : ''}">
      <div class="phone-screen">
        <div id="${id}" class="tryon-stage ${scanning} relative w-full h-full">
          <img src="${PERSON_IMG}" alt="person" class="tryon-person" crossorigin="anonymous"/>
          <svg class="outfit-overlay active absolute inset-0 w-full h-full" viewBox="0 0 300 500" preserveAspectRatio="xMidYMax slice">
            <defs>
              <linearGradient id="grad-${style}-${context}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${outfit.color}" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="${outfit.color}" stop-opacity="0.85"/>
              </linearGradient>
            </defs>
            <path d="${outfit.path}" fill="url(#grad-${style}-${context})" stroke="${outfit.border}" stroke-width="2"/>
            <path d="${outfit.detail}" fill="none" stroke="${outfit.accent}" stroke-width="2" opacity="0.6"/>
          </svg>
          <div class="ar-brackets"><span></span><span></span><span></span><span></span></div>
          <div class="scan-line"></div>
          <span class="compare-label compare-before">${lang === 'ar' ? 'قبل' : 'Before'}</span>
          <span class="compare-label compare-after">${lang === 'ar' ? 'بعد AI' : 'After AI'}</span>
          <div class="ai-badge">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            ${label}
          </div>
        </div>
      </div>
    </div>`;
}

function renderFurnitureRoom(style) {
  const f = FURNITURE[style] || FURNITURE.sofa;
  const shapes = {
    sofa: `<svg width="${f.w}" height="90" viewBox="0 0 180 90"><rect x="10" y="10" width="160" height="50" rx="10" fill="${f.color}"/><rect x="0" y="30" width="20" height="40" rx="6" fill="${f.color}" opacity="0.8"/><rect x="160" y="30" width="20" height="40" rx="6" fill="${f.color}" opacity="0.8"/></svg>`,
    table: `<svg width="${f.w}" height="70" viewBox="0 0 100 70"><rect x="5" y="5" width="90" height="8" rx="3" fill="${f.color}"/><rect x="15" y="13" width="6" height="50" fill="${f.color}"/><rect x="79" y="13" width="6" height="50" fill="${f.color}"/></svg>`,
    carpet: `<svg width="${f.w}" height="50" viewBox="0 0 200 50"><ellipse cx="100" cy="30" rx="95" ry="20" fill="${f.color}" opacity="0.7"/></svg>`,
  };

  return `
    <div class="phone-mockup">
      <div class="phone-screen">
        <div class="room-stage tryon-stage ${isScanning ? 'scanning' : ''}">
          <div class="room-wall"></div>
          <div class="furniture-item swap-in">${shapes[style] || shapes.sofa}</div>
          <div class="scan-line"></div>
          <div class="ar-brackets"><span></span><span></span><span></span><span></span></div>
          <div class="ai-badge">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            ${lang === 'ar' ? 'معاينة AR' : 'AR Preview'}
          </div>
        </div>
      </div>
    </div>`;
}

function renderModeToggle() {
  const d = content.demo;
  return `<div class="flex gap-2 mb-5">
    <button type="button" onclick="setDemoMode('clothing')" class="style-pill px-5 py-2.5 rounded-xl font-bold text-sm ${demoMode === 'clothing' ? 'text-white active' : 'bg-stone-100 text-stone-600'}" style="${demoMode === 'clothing' ? 'background:' + BRAND.color : ''}">${lang === 'ar' ? d.clothingAr : d.clothingEn}</button>
    <button type="button" onclick="setDemoMode('furniture')" class="style-pill px-5 py-2.5 rounded-xl font-bold text-sm ${demoMode === 'furniture' ? 'text-white active' : 'bg-stone-100 text-stone-600'}" style="${demoMode === 'furniture' ? 'background:' + BRAND.color : ''}">${lang === 'ar' ? d.furnitureAr : d.furnitureEn}</button>
  </div>`;
}

function renderDemo() {
  const controls = document.getElementById('demo-controls');
  const viewport = document.getElementById('demo-viewport');

  if (controls && viewport) {
    if (demoMode === 'clothing') {
      controls.innerHTML = renderModeToggle() + MaleTryOn.renderControls(maleState(), lang, BRAND.accent);
      viewport.innerHTML = renderTryOnViewer(null, 'demo');
    } else {
      const d = content.demo;
      controls.innerHTML = renderModeToggle() + `<div class="flex flex-wrap gap-2">${Object.entries(d.furniture).map(([k, v]) =>
        `<button type="button" onclick="setDemoStyle('${k}')" class="style-pill px-4 py-2 rounded-xl text-sm font-semibold ${demoStyle === k ? 'text-white active' : 'bg-gray-100 text-gray-600'}" style="${demoStyle === k ? 'background:' + BRAND.accent : ''}">${lang === 'ar' ? v.ar : v.en}</button>`
      ).join('')}</div>`;
      viewport.innerHTML = renderFurnitureRoom(demoStyle);
    }
  }

  const heroWrap = document.getElementById('hero-viewport');
  if (heroWrap && demoMode === 'clothing') {
    heroWrap.innerHTML = renderTryOnViewer(null, 'hero');
  }

  updateDemoControlsHighlight();
  bindTryOnInteraction();
}

function bindTryOnInteraction() {
  document.querySelectorAll('[data-tryon-trigger]').forEach(card => {
    if (card.dataset.tryonBound) return;
    card.dataset.tryonBound = '1';

    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerNavyTryOn(e);
    });

    card.addEventListener('mouseenter', () => {
      if (demoMode !== 'clothing' || demoPiece !== 'shawl') return;
      if (demoSelections.shawl !== MaleTryOn.IDX_GREEN || isScanning) return;
      card.classList.add('is-hover-ready');
      clearTimeout(navyHoverTimer);
      navyHoverTimer = setTimeout(() => triggerNavyTryOn(), 350);
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hover-ready');
      clearTimeout(navyHoverTimer);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerNavyTryOn(e);
      }
    });
  });
}

function triggerNavyTryOn(e) {
  if (e?.stopPropagation) e.stopPropagation();
  if (isScanning || demoMode !== 'clothing') return;
  if (demoSelections.shawl === MaleTryOn.IDX_NAVY) return;
  demoPiece = 'shawl';
  shawlTransition = { from: MaleTryOn.IDX_GREEN, to: MaleTryOn.IDX_NAVY };
  demoSelections = { ...demoSelections, shawl: MaleTryOn.IDX_NAVY };
  runShawlAiTransition();
  resetProgress();
}

function resetGreenShawl() {
  shawlTransition = null;
  flowStepCurrent = 3;
  demoSelections = { ...demoSelections, shawl: MaleTryOn.IDX_GREEN };
  renderDemo();
}

function setDemoPiece(piece) {
  if (piece === demoPiece) return;
  demoPiece = piece;
  renderDemo();
  resetProgress();
}

function setDemoVariant(idx) {
  if (demoSelections[demoPiece] === idx || isScanning) return;
  if (demoPiece === 'shawl') {
    if (idx === MaleTryOn.IDX_NAVY && demoSelections.shawl === MaleTryOn.IDX_GREEN) {
      shawlTransition = { from: MaleTryOn.IDX_GREEN, to: MaleTryOn.IDX_NAVY };
      demoSelections = { ...demoSelections, shawl: idx };
      runShawlAiTransition();
      resetProgress();
      return;
    }
    if (idx === MaleTryOn.IDX_GREEN) {
      resetGreenShawl();
      resetProgress();
      return;
    }
    shawlTransition = { from: demoSelections.shawl, to: idx };
  }
  demoSelections = { ...demoSelections, [demoPiece]: idx };
  if (demoPiece === 'shawl' && shawlTransition) {
    runShawlAiTransition();
  } else {
    updateMaleView(true);
  }
  resetProgress();
}

function updateFlowStep(step) {
  flowStepCurrent = step;
  document.querySelectorAll('#demo-viewport .flow-step').forEach((el, i) => {
    el.classList.toggle('active', i + 1 <= step);
    el.classList.toggle('current', i + 1 === step);
  });
}

function getTryOnStages() {
  const nodes = [
    document.getElementById('male-stage-demo'),
    document.getElementById('male-stage-hero'),
  ].filter(Boolean);
  return nodes;
}

function getTryOnProductCards() {
  return [
    document.getElementById('product-card-demo'),
    document.getElementById('product-card-hero'),
  ].filter(Boolean);
}

function runShawlAiTransition() {
  if (!shawlTransition) return;
  isScanning = true;
  flowStepCurrent = 1;
  renderDemo();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const stages = getTryOnStages();
      const cards = getTryOnProductCards();

      stages.forEach((stage) => {
        if (!stage) return;
        stage.classList.add('scanning', 'ai-processing', 'ai-color-swap');
      });
      cards.forEach((c) => c?.classList.add('cloth-swap'));

      updateFlowStep(1);

      setTimeout(() => {
        updateFlowStep(2);
        stages.forEach((s) => s?.classList.add('phase-analyze'));
      }, 600);

      setTimeout(() => {
        stages.forEach((s) => s?.classList.add('phase-reveal'));
      }, 1100);

      setTimeout(() => updateFlowStep(3), 1900);

      setTimeout(() => {
        isScanning = false;
        shawlTransition = null;
        flowStepCurrent = 3;
        renderDemo();
      }, 2600);
    });
  });
}

function playGreenToNavy() {
  triggerNavyTryOn();
}

function updateMaleView(animate) {
  if (animate) {
    isScanning = true;
    document.querySelectorAll('.male-stage, .product-card-float, .transform-connector').forEach(el => {
      el.classList.add('scanning', 'cloth-swap', 'active');
    });
    setTimeout(() => {
      isScanning = false;
      renderDemo();
    }, 1400);
  } else {
    renderDemo();
  }
}

function bindVideoPlayers() {
  document.querySelectorAll('.tryon-video').forEach(video => {
    if (video.dataset.bound) return;
    video.dataset.bound = '1';
    const context = video.dataset.context;
    const stage = video.closest('.tryon-video-stage');

    video.addEventListener('loadedmetadata', () => {
      videoReady = true;
      const d = video.duration;
      if (d && isFinite(d)) {
        videoSegments = {
          gulf: 0,
          omani: d / 3,
          shoulder: (d * 2) / 3,
        };
      }
      video.play().catch(() => {});
    });

    video.addEventListener('timeupdate', () => {
      if (context !== 'demo' || demoMode !== 'clothing' || videoFallback) return;
      const style = styleFromTime(video.currentTime, video.duration);
      if (style !== demoStyle) {
        demoStyle = style;
        updateDemoControlsHighlight();
        pulseVideoScan(stage);
      }
      syncProgressToVideo(video);
    });

    video.addEventListener('error', () => {
      videoFallback = true;
      activateVideoFallback(context);
    });

    if (video.readyState >= 1) video.dispatchEvent(new Event('loadedmetadata'));
  });
}

function styleFromTime(t, duration) {
  if (!duration || !isFinite(duration)) return demoStyle;
  if (t >= duration * 0.66) return 'shoulder';
  if (t >= duration * 0.33) return 'omani';
  return 'gulf';
}

function pulseVideoScan(stage) {
  if (!stage) return;
  stage.classList.add('scanning');
  clearTimeout(stage._scanTimer);
  stage._scanTimer = setTimeout(() => stage.classList.remove('scanning'), 900);
}

function playStyleTransition(style) {
  document.querySelectorAll('.tryon-video').forEach(video => {
    const stage = video.closest('.tryon-video-stage');
    pulseVideoScan(stage);
    const target = videoSegments[style] ?? 0;
    try {
      video.currentTime = target;
      video.play().catch(() => {});
    } catch (_) { /* seek while loading */ }
  });
}

function syncProgressToVideo(video) {
  if (!video.duration || !isFinite(video.duration)) return;
  const bar = document.getElementById('demo-progress-bar');
  if (!bar) return;
  const segIdx = STYLE_ORDER.indexOf(demoStyle);
  const segStart = videoSegments[STYLE_ORDER[segIdx]] ?? 0;
  const segEnd = segIdx < 2 ? videoSegments[STYLE_ORDER[segIdx + 1]] : video.duration;
  const pct = ((video.currentTime - segStart) / (segEnd - segStart)) * 100;
  bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
}

function activateVideoFallback(context) {
  if (context === 'demo') {
    const viewport = document.getElementById('demo-viewport');
    if (viewport) viewport.innerHTML = renderTryOnPhone(demoStyle);
  }
  if (context === 'hero') {
    const hero = document.getElementById('hero-viewport');
    if (hero) hero.innerHTML = renderTryOnPhone(demoStyle, 'hero');
  }
  if (context === 'interface') {
    const iface = document.getElementById('interface-viewport');
    if (iface) iface.innerHTML = renderTryOnPhone('gulf', 'interface');
  }
}

function updateDemoControlsHighlight() { /* tabs update via renderDemo */ }

function triggerScan(callback) {
  isScanning = true;
  document.querySelectorAll('.tryon-stage, .male-stage').forEach(el => el.classList.add('scanning'));
  setTimeout(() => {
    isScanning = false;
    callback();
  }, 700);
}

function setDemoMode(mode) {
  if (mode === demoMode) return;
  demoMode = mode;
  if (mode === 'clothing') {
    demoPiece = 'shawl';
    demoSelections = { shawl: 1, top: 0, pants: 0 };
  } else {
    demoStyle = 'sofa';
  }
  renderDemo();
  resetProgress();
}

function setDemoStyle(style) {
  if (demoMode !== 'furniture') return;
  if (style === demoStyle || isScanning) return;
  demoStyle = style;
  triggerScan(() => {
    renderDemo();
    resetProgress();
  });
}

function startAutoPlay() {
  stopAutoPlay();
  autoPlayTimer = setInterval(() => {
    if (currentSlide !== 0 && currentSlide !== 3) return;
    if (isScanning) return;
    if (demoMode === 'clothing') {
      if (demoPiece === 'shawl') {
        if (demoSelections.shawl === MaleTryOn.IDX_NAVY) {
          resetGreenShawl();
          setTimeout(() => {
            if (!isScanning) triggerNavyTryOn();
          }, 800);
        } else {
          triggerNavyTryOn();
        }
      } else {
        const next = MaleTryOn.nextState(maleState());
        demoPiece = next.piece;
        demoSelections = next.selections;
        updateMaleView(true);
      }
    } else {
      const keys = ['sofa', 'table', 'carpet'];
      setDemoStyle(keys[(keys.indexOf(demoStyle) + 1) % keys.length]);
    }
  }, 5500);
  resetProgress();
}

function resetProgress() {
  demoProgress = 0;
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    demoProgress += 2.5;
    const bar = document.getElementById('demo-progress-bar');
    if (bar) bar.style.width = Math.min(demoProgress, 100) + '%';
    if (demoProgress >= 100) demoProgress = 0;
  }, 100);
}

function setupNavigation() {
  const dots = document.getElementById('nav-dots');
  const total = slideCount();
  dots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    dots.innerHTML += `<button type="button" data-slide="${i}" class="nav-dot w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'scale-125' : ''}" style="background:${i === currentSlide ? BRAND.accent : '#D1D5DB'}"></button>`;
  }

  dots.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.slide)));
  });

  document.getElementById('prev-slide').onclick = () => goTo(currentSlide - 1);
  document.getElementById('next-slide').onclick = () => goTo(currentSlide + 1);

  if (slideObserver) slideObserver.disconnect();

  slideObserver = new IntersectionObserver(entries => {
    if (isNavigating) return;
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const num = slideIds().indexOf(entry.target.id);
        if (num >= 0) setActiveSlide(num);
      }
    });
  }, { root: document.getElementById('scroll-container'), threshold: 0.5 });

  document.querySelectorAll('.slide').forEach(s => slideObserver.observe(s));
  setActiveSlide(currentSlide);
}

function setActiveSlide(idx) {
  const max = slideCount() - 1;
  currentSlide = Math.max(0, Math.min(max, idx));
  document.querySelectorAll('.nav-dot').forEach((dot, i) => {
    const active = i === currentSlide;
    dot.classList.toggle('scale-125', active);
    dot.style.background = active ? BRAND.accent : '#D1D5DB';
  });
  document.getElementById('slide-counter').textContent = `${currentSlide + 1} / ${slideCount()}`;
  if (currentSlide === 0 || currentSlide === 3) startAutoPlay();
  if (currentSlide === 2) startFlowSimAutoPlay();
  else stopFlowSimAutoPlay();
}

function goTo(idx) {
  if (idx < 0 || idx > slideCount() - 1) return;
  const slide = document.getElementById(slideIds()[idx]);
  const scroller = document.getElementById('scroll-container');
  if (!slide || !scroller) return;

  isNavigating = true;
  setActiveSlide(idx);
  slide.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => { isNavigating = false; }, 600);
}

function nextSlide() { goTo(currentSlide + 1); }
function prevSlide() { goTo(currentSlide - 1); }

function setupLanguage() {
  const btn = document.getElementById('lang-toggle');
  btn.onclick = () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-label').textContent = lang === 'ar' ? 'EN' : 'AR';
    const saved = currentSlide;
    renderSlides();
    setupDemo();
    setupNavigation();
    goTo(Math.min(saved, slideCount() - 1));
    updateCopyright();
    startAutoPlay();
  };
}

function updateCopyright() {
  const el = document.getElementById('site-copyright');
  if (!el || !content?.brand) return;
  el.textContent = lang === 'ar' ? content.brand.copyrightAr : content.brand.copyrightEn;
}

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const nextKeys = ['ArrowDown', 'PageDown', ' '];
    const prevKeys = ['ArrowUp', 'PageUp'];

    if (nextKeys.includes(e.key)) {
      e.preventDefault();
      nextSlide();
    } else if (prevKeys.includes(e.key)) {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      lang === 'ar' ? prevSlide() : nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      lang === 'ar' ? nextSlide() : prevSlide();
    } else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  const scroller = document.getElementById('scroll-container');
  let wheelTimeout = null;
  scroller.addEventListener('wheel', e => {
    if (wheelTimeout) return;
    if (Math.abs(e.deltaY) < 30) return;
    e.preventDefault();
    if (e.deltaY > 0) nextSlide();
    else prevSlide();
    wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);
  }, { passive: false });
}

function updateUI() {
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  updateCopyright();
}

window.goTo = goTo;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.setDemoMode = setDemoMode;
window.setDemoPiece = setDemoPiece;
window.setDemoVariant = setDemoVariant;
window.playGreenToNavy = playGreenToNavy;
window.triggerNavyTryOn = triggerNavyTryOn;
window.setDemoStyle = setDemoStyle;
window.setFlowSimStep = setFlowSimStep;
window.advanceFlowSim = advanceFlowSim;

document.addEventListener('DOMContentLoaded', init);
