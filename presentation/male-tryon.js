/* Nomoo — Professional Yemeni Virtual Try-On with real photos */

window.MaleTryOn = (() => {
  const BASE = 'assets/';
  const MODEL_BASE = `${BASE}model-green-shawl.png`;

  const IDX_NAVY = 0;
  const IDX_GREEN = 1;

  const SHAWL_ASSETS = [
    {
      nameAr: 'K101 — كحلي ووردي',
      nameEn: 'K101 Navy & Rose',
      product: `${BASE}shawl-product-k101.png`,
      model: `${BASE}model-navy-shawl.png`,
      code: 'K101',
      swatch: 'linear-gradient(135deg,#1B2A4A 0%,#C48BA0 100%)',
    },
    {
      nameAr: 'شال أخضر مطرّز',
      nameEn: 'Green Embroidered',
      product: `${BASE}model-green-shawl.png`,
      model: `${BASE}model-green-shawl.png`,
      code: 'YEM-G',
      swatch: 'linear-gradient(135deg,#1B4332 0%,#D4AF37 100%)',
    },
    {
      nameAr: 'شال يمني — صنع اليمن',
      nameEn: 'Made in Yemen',
      product: `${BASE}shawl-product-k101.png`,
      model: `${BASE}model-navy-shawl.png`,
      code: 'MADE IN YEMEN',
      swatch: 'linear-gradient(135deg,#0F172A 0%,#E8B4BC 100%)',
    },
  ];

  const PIECES = {
    shawl: {
      ar: 'شال يمني', en: 'Yemeni Shawl',
      usePhotos: true,
      variants: SHAWL_ASSETS,
    },
    top: {
      ar: 'فنيلة / ثوب', en: 'Thobe / Top',
      usePhotos: false,
      variants: [
        { color: '#FFFFFF', accent: '#E5E7EB', border: '#D1D5DB', nameAr: 'أبيض', nameEn: 'White' },
        { color: '#F8FAFC', accent: '#CBD5E1', border: '#94A3B8', nameAr: 'ثلجي', nameEn: 'Off-White' },
        { color: '#E2E8F0', accent: '#94A3B8', border: '#64748B', nameAr: 'رمادي فاتح', nameEn: 'Light Gray' },
      ],
    },
    pants: {
      ar: 'بنطال / حزام', en: 'Pants / Belt',
      usePhotos: false,
      variants: [
        { color: '#1E3A5F', accent: '#152A45', border: '#0F2440', nameAr: 'كحلي', nameEn: 'Navy' },
        { color: '#7F1D1D', accent: '#D4AF37', border: '#450A0A', nameAr: 'حزام أحمر', nameEn: 'Red Belt' },
        { color: '#1A1A1A', accent: '#D4AF37', border: '#000', nameAr: 'أسود ذهبي', nameEn: 'Black Gold' },
      ],
    },
  };

  const PIECE_ORDER = ['shawl', 'top', 'pants'];

  function flowSteps(lang, activeStep) {
    const steps = lang === 'ar'
      ? ['① صورة المنتج', '② معالجة AI', '③ المعاينة على الشخص']
      : ['① Product Photo', '② AI Processing', '③ On-Model Preview'];
    return `<div class="ai-flow-steps">${steps.map((s, i) =>
      `<div class="flow-step ${i + 1 <= activeStep ? 'active' : ''} ${i + 1 === activeStep ? 'current' : ''}">${s}</div>${i < 2 ? '<div class="flow-arrow">◀</div>' : ''}`
    ).join('')}</div>`;
  }

  function renderGarmentSVG(piece, v, mode) {
    const c = v.color, a = v.accent, b = v.border;
    if (piece === 'top') {
      if (mode === 'product') return `<svg viewBox="0 0 120 140" class="w-full h-full"><rect width="120" height="140" fill="#F9FAFB" rx="8"/><path d="M20,22 L100,22 L105,108 L60,120 L15,108 Z" fill="${c}" stroke="${b}" stroke-width="1.5"/></svg>`;
      return `<path d="M88,178 L212,178 L218,310 L150,330 L82,310 Z" fill="${c}" stroke="${b}" stroke-width="1.2" opacity="0.88"/>`;
    }
    if (mode === 'product') return `<svg viewBox="0 0 120 140" class="w-full h-full"><rect width="120" height="140" fill="#F9FAFB" rx="8"/><rect x="25" y="18" width="70" height="12" rx="3" fill="${c}" stroke="${b}"/><rect x="28" y="32" width="22" height="95" fill="${c}"/><rect x="70" y="32" width="22" height="95" fill="${c}"/></svg>`;
    return `<g opacity="0.9"><rect x="88" y="295" width="124" height="14" fill="${c}" stroke="${b}"/><rect x="92" y="308" width="52" height="230" fill="${c}"/><rect x="156" y="308" width="52" height="230" fill="${c}"/></g>`;
  }

  function productCardSrc(asset) {
    return asset.productCard || asset.product;
  }

  function productImgClass(src) {
    return src.includes('shawl-product') ? 'product-img product-img--flat' : 'product-img product-img--crop';
  }

  function renderPhotoTryOn(state, lang, context, scanning, flowStep, transition) {
    const greenAsset = SHAWL_ASSETS[IDX_GREEN];
    const navyAsset = SHAWL_ASSETS[IDX_NAVY];
    const onModel = transition ? SHAWL_ASSETS[transition.to] : SHAWL_ASSETS[state.selections.shawl];
    const fromAsset = transition ? SHAWL_ASSETS[transition.from] : null;
    const toAsset = transition ? SHAWL_ASSETS[transition.to] : navyAsset;
    const isColorSwap = Boolean(transition && fromAsset && toAsset);
    const isGreenView = !isColorSwap && state.selections.shawl === IDX_GREEN;
    const step = flowStep || (scanning ? 2 : 3);

    const productPhoto = `
          <div class="product-card-photo">
            <img src="${navyAsset.product}" alt="" class="product-img shawl-product-img"/>
          </div>`;

    const modelLayers = isColorSwap ? `
          <img src="${fromAsset.model}" alt="" class="model-from"/>
          <img src="${toAsset.model}" alt="" class="model-to"/>
          <div class="color-wipe-overlay"></div>` : `
          <img src="${onModel.model}" alt="" class="model-result-img visible"/>`;

    const triggerAttrs = context !== 'interface'
      ? `data-tryon-trigger="1" role="button" tabindex="0" aria-label="${lang === 'ar' ? 'جرّب الشال الكحلي على الرجل' : 'Try navy shawl on model'}"`
      : '';

    const ctaBtn = isGreenView && !scanning ? `
          <button type="button" class="tryon-cta-btn" onclick="triggerNavyTryOn(event)">
            <span class="tryon-cta-icon">✦</span>
            <span class="font-bold">${lang === 'ar' ? 'شاهد كيف يبدو عليك' : 'See how it looks on you'}</span>
          </button>` : '';

    return `
    <div class="tryon-pro google-style" data-context="${context}">
      ${context === 'demo' ? flowSteps(lang, step) : ''}
      <div class="google-tryon-stack ${!isGreenView && !isColorSwap ? 'is-navy-applied' : ''}">
        <div class="google-model-card model-card-main tryon-stage male-stage pro-model ${scanning ? 'scanning ai-processing' : ''} ${isColorSwap ? 'ai-color-swap' : ''}" id="male-stage-${context}" data-shawl-view="${isColorSwap ? 'transition' : (isGreenView ? 'green' : 'navy')}">
          ${modelLayers}
          <div class="model-processing-layer">
            <div class="processing-product-wrap">
              <img src="${navyAsset.product}" alt="" class="shawl-product-img"/>
            </div>
            <div class="processing-grid"></div>
          </div>
          <div class="scan-line scan-line-swap"></div>
          <div class="ar-brackets"><span></span><span></span><span></span><span></span></div>
          <div class="ai-badge video-processing">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
          ${ctaBtn}
        </div>

        <div class="google-product-card product-card-float pro-card ${scanning ? 'cloth-swap' : ''} ${isGreenView ? 'is-invite' : 'is-applied'}" id="product-card-${context}" ${triggerAttrs}>
          ${productPhoto}
        </div>
      </div>
    </div>`;
  }

  function renderSvgTryOn(state, lang, context, scanning) {
    const { piece, selections } = state;
    const v = PIECES[piece].variants[selections[piece]];
    const pieceLabel = lang === 'ar' ? PIECES[piece].ar : PIECES[piece].en;
    const variantName = lang === 'ar' ? v.nameAr : v.nameEn;

    const layers = piece === 'top'
      ? renderGarmentSVG('top', PIECES.top.variants[selections.top], 'model')
      : renderGarmentSVG('pants', PIECES.pants.variants[selections.pants], 'model');

    return `
    <div class="tryon-pro google-style" data-context="${context}">
      <div class="google-tryon-stack">
        <div class="google-model-card model-card-main tryon-stage male-stage pro-model ${scanning ? 'scanning' : ''}">
          <img src="${MODEL_BASE}" alt="model" class="model-result-img visible"/>
          <svg class="garment-layers" viewBox="0 0 300 600" preserveAspectRatio="xMidYMid slice">${layers}</svg>
          <div class="scan-line"></div>
        </div>
        <div class="google-product-card product-card-float pro-card">
          <div class="product-card-photo product-card-photo--garment">${renderGarmentSVG(piece, v, 'product')}</div>
        </div>
      </div>
    </div>`;
  }

  function render(state, lang, context = 'demo', scanning = false, flowStep = 3, transition = null) {
    if (state.piece === 'shawl' || context !== 'demo') {
      return renderPhotoTryOn(state, lang, context, scanning, flowStep, transition);
    }
    return renderSvgTryOn(state, lang, context, scanning);
  }

  function renderControls(state, lang, brandColor) {
    const { piece, selections } = state;
    const tabs = PIECE_ORDER.map(key => {
      const p = PIECES[key];
      const active = piece === key;
      return `<button type="button" onclick="setDemoPiece('${key}')" class="piece-tab ${active ? 'active' : ''}" style="${active ? 'background:' + brandColor : ''}">${lang === 'ar' ? p.ar : p.en}</button>`;
    }).join('');

    let swatches = '';
    if (PIECES[piece].usePhotos) {
      swatches = SHAWL_ASSETS.map((a, i) => {
        const active = selections.shawl === i;
        const name = lang === 'ar' ? a.nameAr : a.nameEn;
        return `<button type="button" onclick="setDemoVariant(${i})" class="variant-swatch photo-swatch ${active ? 'active' : ''}" title="${name}">
          <span class="photo-thumb" style="background:${a.swatch}"><img src="${a.product}" alt="" class="${a.product.includes('shawl-product') ? 'shawl-product-img' : ''}"/></span>
          <span class="variant-name">${name.split('—')[0].trim()}</span>
        </button>`;
      }).join('');
    } else {
      swatches = PIECES[piece].variants.map((v, i) => {
        const active = selections[piece] === i;
        return `<button type="button" onclick="setDemoVariant(${i})" class="variant-swatch ${active ? 'active' : ''}" title="${lang === 'ar' ? v.nameAr : v.nameEn}">
          <span style="background:linear-gradient(135deg,${v.color},${v.accent})"></span>
          <span class="variant-name">${lang === 'ar' ? v.nameAr : v.nameEn}</span>
        </button>`;
      }).join('');
    }

    const swapBtn = piece === 'shawl' ? `
      <button type="button" onclick="playGreenToNavy()" class="ai-swap-btn mt-4 w-full sm:w-auto">
        <span class="ai-swap-dot green"></span>
        <span>${lang === 'ar' ? '▶ شاهد AI: أخضر → كحلي' : '▶ Watch AI: Green → Navy'}</span>
        <span class="ai-swap-dot navy"></span>
      </button>` : '';

    return `
      <div class="piece-tabs mb-4">${tabs}</div>
      <div class="variant-swatches flex flex-wrap gap-2">${swatches}</div>
      ${swapBtn}
      <p class="tryon-hint">${lang === 'ar'
        ? 'الصورة الرئيسية: شال أخضر — البطاقة الصغيرة: شال كحلي K101 — اضغط أو مرّر على البطاقة الصغيرة لتفعيل AI'
        : 'Main: green shawl — Small card: navy K101 — click or hover the small card to run AI try-on'}</p>`;
  }

  function nextState(state) {
    const { piece, selections } = state;
    const idx = selections[piece];
    const max = PIECES[piece].usePhotos ? SHAWL_ASSETS.length : PIECES[piece].variants.length;
    if (idx < max - 1) {
      return { piece, selections: { ...selections, [piece]: idx + 1 } };
    }
    const pieceIdx = PIECE_ORDER.indexOf(piece);
    const nextPiece = PIECE_ORDER[(pieceIdx + 1) % PIECE_ORDER.length];
    return { piece: nextPiece, selections: { ...selections, [nextPiece]: 0 } };
  }

  function nextShawlSwap(state) {
    const cur = state.selections.shawl;
    const next = cur === IDX_GREEN ? IDX_NAVY : IDX_GREEN;
    return { piece: 'shawl', selections: { ...state.selections, shawl: next } };
  }

  return { PIECES, PIECE_ORDER, SHAWL_ASSETS, IDX_GREEN, IDX_NAVY, render, renderControls, nextState, nextShawlSwap };
})();
