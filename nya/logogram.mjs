// Nya logograms — an Arrival-inspired, compositional writing system.
//
// Idea (and the key to decipherability): meaning is NOT phonetic. Each concept
// is a circular logogram built from a small set of ~16 semantic RADICALS
// (atomic ideas: self, water, see, big, small, made, flow, place, life...).
// Complex concepts are transparent compositions of radicals, so a reader who
// learns the ~16 marks can reverse-engineer most words by pure logic:
//
//   water = ~        river = water + flow        world = big + place
//   see = eye        research = see + many        university = place + see
//   plastic = made + not + life     microplastic = small + plastic
//
// Grammar is shown by the ring itself: a plural gets a second outer ring, a
// question opens a gap, emphasis thickens the stroke. The layout is holistic
// (marks sit around one ring at fixed clock positions), not linear, echoing the
// non-linear logograms of the film.
//
// renderGlyph(conceptId, opts) -> standalone <svg> string.
// glyphFor(englishWord)        -> {concept, radicals, svg} (with phonetic
//                                 fallback so any word still renders).

const C = 50, R = 34;            // ring centre + radius (viewBox 0..100)
const deg = (d) => (d * Math.PI) / 180;
const at = (angle, rad = R) => [C + rad * Math.cos(deg(angle)), C - rad * Math.sin(deg(angle))];

// ---------- radicals: gloss + a small stroke mark drawn at (x,y) ----------
// Each draw(x,y) returns SVG markup centred on the anchor point.
const RADICALS = {
  self:   { gloss: 'self / I',        anchor: 'center', draw: (x, y) => `<circle cx="${x}" cy="${y}" r="3.4" fill="currentColor" stroke="none"/>` },
  water:  { gloss: 'water',           anchor: 215,      draw: (x, y) => `<path d="M${x - 9} ${y} q4.5 -5 9 0 q4.5 5 9 0"/>` },
  flow:   { gloss: 'flow / move',     anchor: 'center', draw: (x, y) => `<path d="M${x - 11} ${y + 8} q11 -16 22 0"/><path d="M${x + 7} ${y - 6} l4 2 l-4 3"/>` },
  big:    { gloss: 'big / great',     anchor: 'ring',   draw: () => `<circle cx="${C}" cy="${C}" r="${R + 8}"/>` },
  small:  { gloss: 'small',           anchor: 'center', draw: (x, y) => `<circle cx="${x}" cy="${y}" r="7"/>` },
  see:    { gloss: 'see / know',      anchor: 90,       draw: (x, y) => `<path d="M${x - 9} ${y} q9 -8 18 0 q-9 8 -18 0z"/><circle cx="${x}" cy="${y}" r="2.4" fill="currentColor" stroke="none"/>` },
  light:  { gloss: 'light',           anchor: 55,       draw: (x, y) => `<circle cx="${x}" cy="${y}" r="2.6" fill="currentColor" stroke="none"/>${[0, 60, 120, 180, 240, 300].map(a => `<line x1="${x + 4 * Math.cos(deg(a))}" y1="${y - 4 * Math.sin(deg(a))}" x2="${x + 9 * Math.cos(deg(a))}" y2="${y - 9 * Math.sin(deg(a))}"/>`).join('')}` },
  made:   { gloss: 'made / artifact', anchor: 0,        draw: (x, y) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="1.5"/>` },
  not:    { gloss: 'not / negate',    anchor: 'ring',   draw: () => `<line x1="${C - R + 4}" y1="${C + R - 4}" x2="${C + R - 4}" y2="${C - R + 4}"/>` },
  place:  { gloss: 'place / ground',  anchor: 270,      draw: (x, y) => `<line x1="${x - 12}" y1="${y}" x2="${x + 12}" y2="${y}"/><line x1="${x - 7}" y1="${y}" x2="${x - 7}" y2="${y + 5}"/><line x1="${x + 7}" y1="${y}" x2="${x + 7}" y2="${y + 5}"/>` },
  life:   { gloss: 'life / plant',    anchor: 315,      draw: (x, y) => `<path d="M${x} ${y + 7} l0 -12"/><path d="M${x} ${y - 3} q-7 -2 -8 -8 q7 0 8 7"/><path d="M${x} ${y - 1} q7 -2 8 -8 q-7 0 -8 7"/>` },
  change: { gloss: 'change / time',   anchor: 'center', draw: (x, y) => `<path d="M${x} ${y - 8} a8 8 0 1 1 -7 4 a4.5 4.5 0 1 0 4 -2.5"/>` },
  many:   { gloss: 'many / plural',   anchor: 135,      draw: (x, y) => `<line x1="${x - 5}" y1="${y - 4}" x2="${x - 5}" y2="${y + 4}"/><line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}"/><line x1="${x + 5}" y1="${y - 4}" x2="${x + 5}" y2="${y + 4}"/>` },
  speak:  { gloss: 'speak / sound',   anchor: 180,      draw: (x, y) => `<path d="M${x} ${y - 7} a7 7 0 0 0 0 14"/><path d="M${x - 4} ${y - 4} a4 4 0 0 0 0 8"/>` },
  feel:   { gloss: 'heart / feel',    anchor: 110,      draw: (x, y) => `<path d="M${x} ${y + 6} C ${x - 9} ${y - 3}, ${x - 4} ${y - 9}, ${x} ${y - 4} C ${x + 4} ${y - 9}, ${x + 9} ${y - 3}, ${x} ${y + 6} Z"/>` },
  being:  { gloss: 'being / cat',     anchor: 'ears',   draw: () => { const [lx, ly] = at(115); const [rx, ry] = at(65); return `<path d="M${lx - 4} ${ly + 3} l1 -9 l6 5z"/><path d="M${rx + 4} ${ry + 3} l-1 -9 l-6 5z"/>`; } }
};

export const RADICAL_GLOSSES = Object.fromEntries(Object.entries(RADICALS).map(([k, v]) => [k, v.gloss]));

// ---------- concepts: meaning -> radical composition (the dictionary) ----------
export const CONCEPTS = {
  self: ['self'], i: ['self'], me: ['self'], my: ['self'], we: ['self', 'many'], you: ['self', 'speak'],
  water: ['water'], river: ['water', 'flow'], sea: ['water', 'big'], rain: ['water', 'light'],
  big: ['big'], small: ['small'], micro: ['small'], many: ['many'], all: ['big', 'many'], one: ['self'],
  see: ['see'], know: ['see'], study: ['see', 'self'], research: ['see', 'many'], think: ['see', 'change'],
  light: ['light'], photo: ['light', 'made'], photograph: ['light', 'made'], photography: ['light', 'made', 'many'],
  made: ['made'], build: ['made', 'self'], plastic: ['made', 'not', 'life'], microplastic: ['small', 'made', 'not', 'life'],
  place: ['place'], home: ['place', 'feel'], city: ['place', 'many'], country: ['place', 'big'], world: ['big', 'place'],
  university: ['place', 'see'], field: ['place', 'life'], map: ['place', 'see', 'small'],
  life: ['life'], forest: ['life', 'many'], plant: ['life'], cat: ['being'], animal: ['being'],
  flow: ['flow'], journey: ['flow', 'self'], change: ['change'], time: ['change'], year: ['change', 'big'],
  speak: ['speak'], talk: ['speak', 'self'], contact: ['speak', 'flow'], hello: ['speak', 'feel'],
  comment: ['speak', 'made'], note: ['speak', 'small'], journal: ['speak', 'many'],
  feel: ['feel'], love: ['feel', 'big'], like: ['feel'], good: ['feel'],
  master: ['see', 'big'], graduate: ['see', 'big', 'change'], education: ['see', 'place'],
  question: ['speak', 'change'], system: ['flow', 'many'], global: ['big'], landscape: ['place', 'big'],
  pressure: ['big', 'flow'], not: ['not'], no: ['not']
};

// English lemma -> concept key (handles a few synonyms / plurals)
const LEMMA = {
  countries: 'country', universities: 'university', systems: 'system', places: 'place',
  photographs: 'photo', photos: 'photo', notes: 'note', rivers: 'river', cats: 'cat',
  microplastics: 'microplastic', plastics: 'plastic', forests: 'forest', years: 'year',
  comments: 'comment', maps: 'map'
};

// deterministic fallback: a ring with hash-placed dots (distinct, not semantic)
function hashWord(w) {
  let h = 2166136261;
  for (let i = 0; i < w.length; i++) { h ^= w.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function fallbackMarks(w) {
  let h = hashWord(w);
  const n = 2 + (h % 3);
  let m = '';
  for (let i = 0; i < n; i++) {
    const a = (h % 360); h = Math.floor(h / 360) + 97 * (i + 1);
    const [x, y] = at(a, R - 9);
    m += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="currentColor" stroke="none"/>`;
  }
  return m;
}

function marksFor(radicals) {
  return radicals.map((id) => {
    const r = RADICALS[id];
    if (!r) return '';
    if (r.anchor === 'center') return r.draw(C, C);
    if (r.anchor === 'ring' || r.anchor === 'ears') return r.draw();
    const [x, y] = at(r.anchor);
    return r.draw(x, y);
  }).join('');
}

export function renderGlyph(radicalsOrConcept, opts = {}) {
  const radicals = Array.isArray(radicalsOrConcept) ? radicalsOrConcept : (CONCEPTS[radicalsOrConcept] || []);
  const plural = opts.plural;
  const size = opts.size || 64;
  const ring = `<circle cx="${C}" cy="${C}" r="${R}"/>`;
  const outer = plural ? `<circle cx="${C}" cy="${C}" r="${R + 5}" stroke-dasharray="2 4"/>` : '';
  const body = radicals.length ? marksFor(radicals) : (opts.fallback ? fallbackMarks(opts.fallback) : '');
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${opts.label || ''}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${ring}${outer}${body}</g></svg>`;
}

export function glyphFor(englishWord, opts = {}) {
  const raw = englishWord.toLowerCase().replace(/[^a-z]/g, '');
  let key = CONCEPTS[raw] ? raw : LEMMA[raw];
  let plural = false;
  if (!key && raw.endsWith('s') && CONCEPTS[raw.slice(0, -1)]) { key = raw.slice(0, -1); plural = true; }
  const radicals = key ? CONCEPTS[key] : [];
  return {
    word: englishWord, concept: key || null, radicals,
    svg: renderGlyph(radicals, { ...opts, plural, fallback: key ? null : raw, label: key || raw })
  };
}

// Skip pure grammatical words when drawing a phrase as logograms.
const SKIP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'is', 'are', 'with', 'for', 'as', 'at', 'by']);

export function glyphsForPhrase(text, opts = {}) {
  return (text.toLowerCase().match(/[a-z]+/g) || [])
    .filter((w) => !SKIP.has(w))
    .map((w) => glyphFor(w, opts));
}

// ---------- sentence as ONE circle (Heptapod-style) ----------
// The whole utterance is a single ring. Each content word fuses onto the ring
// at its own sector (read clockwise from the start dot); its radicals cluster
// there. A question opens a wide gap in the ring. This is holistic, not linear.
const ringPt = (cx, cy, r, a) => [cx + r * Math.cos(deg(a)), cy - r * Math.sin(deg(a))];

function clusterRadical(id, x, y, s) {
  if (id === 'big') return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(12 * s).toFixed(1)}"/>`;
  if (id === 'not') { const o = 9 * s; return `<line x1="${(x - o).toFixed(1)}" y1="${(y + o).toFixed(1)}" x2="${(x + o).toFixed(1)}" y2="${(y - o).toFixed(1)}"/>`; }
  if (id === 'being') { const e = 5 * s; return `<path d="M${(x - e).toFixed(1)} ${(y - e * 0.4).toFixed(1)} l${(e * 0.5).toFixed(1)} ${(-e * 1.4).toFixed(1)} l${(e * 1.1).toFixed(1)} ${(e).toFixed(1)}z"/><path d="M${(x + e).toFixed(1)} ${(y - e * 0.4).toFixed(1)} l${(-e * 0.5).toFixed(1)} ${(-e * 1.4).toFixed(1)} l${(-e * 1.1).toFixed(1)} ${(e).toFixed(1)}z"/>`; }
  const inner = RADICALS[id] ? RADICALS[id].draw(x, y) : '';
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s}) translate(${(-x).toFixed(2)} ${(-y).toFixed(2)})">${inner}</g>`;
}

function renderCluster(radicals, px, py, s) {
  if (!radicals.length) return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.8" fill="currentColor" stroke="none"/>`;
  const k = radicals.length;
  const o = k === 1 ? 0 : 7.5;
  return radicals.map((id, j) => {
    const a = 90 - j * (360 / k);
    const x = px + o * Math.cos(deg(a)), y = py - o * Math.sin(deg(a));
    return clusterRadical(id, x, y, s);
  }).join('');
}

export function renderSentence(text, opts = {}) {
  const size = opts.size || 220;
  const words = (String(text).toLowerCase().match(/[a-z]+/g) || []).filter((w) => !SKIP.has(w));
  const cx = 50, cy = 50, BR = 33;
  const N = Math.max(words.length, 1);
  const scale = N <= 3 ? 0.62 : N <= 6 ? 0.5 : 0.4;
  const isQ = /\?/.test(text);

  let clusters = '';
  let stems = '';
  words.forEach((w, i) => {
    const ang = 90 - (i + 0.5) * (360 / N);
    const [px, py] = ringPt(cx, cy, BR, ang);
    clusters += renderCluster(glyphFor(w).radicals, px, py, scale);
    const [ix, iy] = ringPt(cx, cy, BR - 6, ang);
    const [ox, oy] = ringPt(cx, cy, BR + 6, ang);
    stems += `<line x1="${ix.toFixed(1)}" y1="${iy.toFixed(1)}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}" stroke-width="0.8"/>`;
  });

  // ring: a near-complete circle with a gap at the top (start); wider if a question
  const gap = isQ ? 30 : 8;
  const [sx, sy] = ringPt(cx, cy, BR, 90 - gap / 2);
  const [ex, ey] = ringPt(cx, cy, BR, 90 + gap / 2);
  const ring = `<path d="M${sx.toFixed(2)} ${sy.toFixed(2)} A ${BR} ${BR} 0 1 1 ${ex.toFixed(2)} ${ey.toFixed(2)}"/>`;
  const start = `<circle cx="${cx}" cy="${(cy - BR).toFixed(1)}" r="2.6" fill="currentColor" stroke="none"/>`;

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${String(opts.label || text).replace(/"/g, '')}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ring}${stems}${start}${clusters}</g></svg>`;
}

export default { RADICALS: RADICAL_GLOSSES, CONCEPTS, renderGlyph, glyphFor, glyphsForPhrase, renderSentence };
