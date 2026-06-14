const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
const BRAND = '0071E3';
const BG = 'FAFAFA';
const TEXT = '1D1D1F';
const GRAY = '6B7280';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Nomoo';
pptx.title = 'Virtual Try-On | المعاينة الافتراضية';
pptx.subject = 'Nomoo Digital Innovation';

function addSlideBg(slide) {
  slide.background = { color: BG };
}

function addLabel(slide, textAr, textEn, y = 0.4) {
  slide.addText(`${textAr}  |  ${textEn}`, {
    x: 0.5, y, w: 9, h: 0.35,
    fontSize: 11, bold: true, color: BRAND,
    align: 'right', rtlMode: true,
  });
}

function addTitle(slide, textAr, textEn, y = 0.85) {
  slide.addText([
    { text: textAr, options: { breakLine: true, rtlMode: true } },
    { text: textEn, options: { fontSize: 18, color: GRAY } },
  ], {
    x: 0.5, y, w: 9, h: 1.2,
    fontSize: 28, bold: true, color: TEXT,
    align: 'right',
  });
}

function addCard(slide, items, startY = 2.2, cols = 2) {
  const w = 4.2;
  const h = 1.5;
  const gap = 0.3;
  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.5 + col * (w + gap);
    const y = startY + row * (h + gap);

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: 'FFFFFF' },
      line: { color: 'E5E7EB', width: 1 },
      rectRadius: 0.1,
    });

    if (item.stat) {
      slide.addText(item.stat, {
        x: x + 0.2, y: y + 0.15, w: 1.5, h: 0.5,
        fontSize: 22, bold: true, color: BRAND, align: 'right',
      });
    }

    slide.addText([
      { text: item.titleAr, options: { breakLine: true, bold: true, rtlMode: true } },
      { text: item.titleEn, options: { fontSize: 10, color: GRAY } },
      { text: item.descAr || '', options: { breakLine: true, fontSize: 10, color: GRAY, rtlMode: true } },
      { text: item.descEn || '', options: { fontSize: 9, color: GRAY } },
    ], {
      x: x + 0.2, y: y + (item.stat ? 0.55 : 0.2), w: w - 0.4, h: h - 0.3,
      fontSize: 12, color: TEXT, align: 'right', valign: 'top',
    });
  });
}

// Slide 1: Hero
{
  const s = content.slides[0];
  const slide = pptx.addSlide();
  addSlideBg(slide);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 4.2, y: 1.5, w: 1.2, h: 1.2,
    fill: { color: BRAND }, rectRadius: 0.15,
  });
  slide.addText('ن', {
    x: 4.2, y: 1.5, w: 1.2, h: 1.2,
    fontSize: 36, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle',
  });

  slide.addText('Try it First', {
    x: 0.5, y: 0.5, w: 9, h: 0.4,
    fontSize: 12, bold: true, color: BRAND, align: 'center', charSpacing: 3,
  });

  slide.addText([
    { text: s.titleAr, options: { breakLine: true, bold: true, fontSize: 36, rtlMode: true } },
    { text: s.titleEn, options: { fontSize: 28, color: GRAY } },
  ], { x: 0.5, y: 2.9, w: 9, h: 1.5, align: 'center', color: TEXT });

  slide.addText([
    { text: s.subtitleAr, options: { breakLine: true, rtlMode: true } },
    { text: s.subtitleEn, options: { fontSize: 14, color: GRAY } },
  ], { x: 1, y: 4.3, w: 8, h: 0.8, fontSize: 16, align: 'center', color: GRAY });

  slide.addText([
    { text: s.descAr, options: { breakLine: true, rtlMode: true } },
    { text: s.descEn, options: { fontSize: 11, color: GRAY } },
  ], { x: 1.5, y: 5, w: 7, h: 0.7, fontSize: 13, align: 'center', color: GRAY });
}

// Slide 2: Concept
{
  const s = content.slides[1];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);

  slide.addText([
    { text: s.descAr, options: { breakLine: true, rtlMode: true } },
    { text: s.descEn, options: { fontSize: 10, color: GRAY } },
  ], { x: 0.5, y: 1.9, w: 9, h: 0.7, fontSize: 11, color: GRAY, align: 'right' });

  addCard(slide, s.items.map(i => ({
    titleAr: i.titleAr, titleEn: i.titleEn,
    descAr: i.descAr, descEn: i.descEn,
  })), 2.7, 3);
}

// Slide 3: Problems
{
  const s = content.slides[2];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);
  addCard(slide, s.items, 2.2, 2);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 5.5, w: 9, h: 0.7,
    fill: { color: BRAND }, rectRadius: 0.08,
  });
  slide.addText([
    { text: s.solutionAr, options: { rtlMode: true } },
    { text: s.solutionEn, options: { fontSize: 10 } },
  ], {
    x: 0.5, y: 5.5, w: 9, h: 0.7,
    fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle',
  });
}

// Slide 4: Customer Value
{
  const s = content.slides[3];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);
  addCard(slide, s.items, 2.2, 2);
}

// Slide 5: Business Impact
{
  const s = content.slides[4];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);
  addCard(slide, s.items, 2.2, 2);

  slide.addText('* بيانات تقديرية | Data estimates based on AR market studies', {
    x: 0.5, y: 5.6, w: 9, h: 0.3,
    fontSize: 9, color: GRAY, align: 'center',
  });
}

// Slide 6: Process
{
  const s = content.slides[5];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);

  s.steps.forEach((step, i) => {
    const x = 0.8 + i * 3.1;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.8, y: 2.3, w: 0.7, h: 0.7,
      fill: { color: BRAND },
    });
    slide.addText(step.num, {
      x: x + 0.8, y: 2.3, w: 0.7, h: 0.7,
      fontSize: 20, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle',
    });
    slide.addText([
      { text: step.titleAr, options: { breakLine: true, bold: true, rtlMode: true } },
      { text: step.titleEn, options: { fontSize: 10, color: GRAY } },
      { text: step.descAr, options: { breakLine: true, fontSize: 9, color: GRAY, rtlMode: true } },
      { text: step.descEn, options: { fontSize: 8, color: GRAY } },
    ], {
      x, y: 3.1, w: 2.5, h: 1.5,
      fontSize: 12, color: TEXT, align: 'center',
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 4.8, w: 9, h: 0.55,
    fill: { color: '0071E3', transparency: 90 }, line: { color: BRAND, width: 1 }, rectRadius: 0.08,
  });
  slide.addText([
    { text: s.highlightAr, options: { bold: true, rtlMode: true } },
    { text: s.highlightEn, options: { fontSize: 10, color: GRAY } },
  ], {
    x: 0.5, y: 4.8, w: 9, h: 0.55,
    fontSize: 12, color: BRAND, align: 'center', valign: 'middle',
  });
}

// Slide 7: Interface
{
  const s = content.slides[6];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);

  s.items.forEach((item, i) => {
    slide.addText(`✓  ${item.titleAr}\n    ${item.titleEn}\n    ${item.descAr} | ${item.descEn}`, {
      x: 0.5, y: 2.2 + i * 1.1, w: 5, h: 1,
      fontSize: 11, color: TEXT, align: 'right', rtlMode: true, valign: 'top',
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.8, y: 2, w: 3.7, h: 3.5,
    fill: { color: 'FFFFFF' }, line: { color: 'E5E7EB', width: 1 }, rectRadius: 0.1,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6, y: 2.2, w: 3.3, h: 1.8,
    fill: { color: 'F3F4F6' }, rectRadius: 0.05,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6, y: 4.3, w: 3.3, h: 0.55,
    fill: { color: BRAND }, rectRadius: 0.08,
  });
  slide.addText('شاهد كيف يبدو عليك\nSee How It Looks on You', {
    x: 6, y: 4.3, w: 3.3, h: 0.55,
    fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle',
  });
}

// Slide 8: Experience
{
  const s = content.slides[7];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);
  addCard(slide, s.items, 2.2, 3);

  slide.addText([
    { text: `"${s.quoteAr}"`, options: { italic: true, bold: true, rtlMode: true } },
    { text: `"${s.quoteEn}"`, options: { fontSize: 11, color: GRAY, italic: true } },
  ], {
    x: 0.5, y: 5.2, w: 9, h: 0.7,
    fontSize: 14, color: BRAND, align: 'center',
  });
}

// Slide 9: Vision
{
  const s = content.slides[8];
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);
  addCard(slide, s.items, 2.2, 3);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 4.8, w: 9, h: 0.9,
    fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 }, rectRadius: 0.08,
  });
  slide.addText([
    { text: `"${s.quoteAr}"`, options: { bold: true, rtlMode: true } },
    { text: `"${s.quoteEn}"`, options: { fontSize: 11, color: GRAY } },
  ], {
    x: 0.5, y: 4.8, w: 9, h: 0.9,
    fontSize: 14, color: TEXT, align: 'center', valign: 'middle',
  });
}

// Slide 10: CTA
{
  const s = content.slides[9];
  const c = content.brand.contact;
  const slide = pptx.addSlide();
  addSlideBg(slide);
  addLabel(slide, s.titleAr, s.titleEn);
  addTitle(slide, s.headingAr, s.headingEn);

  s.items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    slide.addText(`✓  ${item.titleAr}  |  ${item.titleEn}`, {
      x: 1 + col * 4.5, y: 2.3 + row * 0.5, w: 4, h: 0.4,
      fontSize: 12, color: TEXT, align: 'right', rtlMode: true,
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 2, y: 3.5, w: 6, h: 0.65,
    fill: { color: BRAND }, rectRadius: 0.1,
  });
  slide.addText([
    { text: s.ctaAr, options: { breakLine: true, rtlMode: true } },
    { text: s.buttonEn, options: { fontSize: 10 } },
  ], {
    x: 2, y: 3.5, w: 6, h: 0.65,
    fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle',
  });

  slide.addText([
    { text: `📞  ${c.phone}`, options: { breakLine: true } },
    { text: `✉  ${c.email}`, options: { breakLine: true } },
    { text: `🌐  ${c.website}`, options: {} },
  ], {
    x: 0.5, y: 4.5, w: 9, h: 1.2,
    fontSize: 13, color: GRAY, align: 'center',
  });
}

const outPath = path.join(__dirname, 'Nomoo_Virtual_TryOn_AR_EN.pptx');
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('Created:', outPath);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
