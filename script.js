/* ======================================================
   Phorpi — script.js
   i18n + hizmet inline expand + paketler + accordion
   + marquee + scroll reveal
   ====================================================== */

(function () {
  'use strict';

  const state = { lang: 'tr', filter: 'all', expanded: null, selected: '01', faq: 0, dict: {} };

  // ---- i18n ----
  async function loadDict(lang) {
    try {
      const res = await fetch('i18n/' + lang + '.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      console.warn('i18n yükleme başarısız:', lang);
      return {};
    }
  }

  function get(obj, path) {
    return path.split('.').reduce((a, k) => (a && a[k] != null) ? a[k] : null, obj);
  }

  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      const val = get(state.dict, key);
      if (val == null) return;
      if (attr) el.setAttribute(attr, val);
      else el.innerHTML = val;
    });
    render();
    // Reveal'ları re-observe et — yeni render sonrası
    observeReveals();
  }

  async function setLang(lang) {
    state.lang = lang;
    localStorage.setItem('phorpi.lang', lang);
    state.dict = await loadDict(lang);
    applyI18n();
  }

  // ---- Render helpers ----
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  // ---- Servis illüstrasyonları ----
  // Her SVG 200x120, currentColor = ink, turuncu vurgu #E0621F
  const ILLUS = {
    '01': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 100 H180"/>
      <rect x="34" y="72" width="18" height="28"/>
      <rect x="62" y="58" width="18" height="42"/>
      <rect x="90" y="42" width="18" height="58"/>
      <rect x="118" y="28" width="18" height="72"/>
      <path d="M150 52 l14 -9 14 9 v22 l-14 9 -14 -9 z" stroke="#E0621F"/>
      <path d="M150 52 l14 9 14 -9 M164 61 v22" stroke="#E0621F"/>
    </svg>`,
    '02': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M40 18 h72 l20 20 v62 H40 z"/>
      <path d="M112 18 v20 h20"/>
      <path d="M55 55 h48 M55 70 h48 M55 85 h30"/>
      <circle cx="150" cy="88" r="16" stroke="#E0621F"/>
      <path d="M142 88 l6 6 12 -12" stroke="#E0621F"/>
      <path d="M138 100 l-4 12 8 -4 8 4 -4 -12" stroke="#E0621F"/>
    </svg>`,
    '03': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M28 100 H172"/>
      <path d="M50 100 V62 h28 v38"/>
      <path d="M90 100 V38 h36 v62"/>
      <path d="M138 100 V70 h26 v30"/>
      <rect x="58" y="72" width="5" height="5"/>
      <rect x="68" y="72" width="5" height="5"/>
      <rect x="58" y="84" width="5" height="5"/>
      <rect x="68" y="84" width="5" height="5"/>
      <rect x="99" y="50" width="6" height="8"/>
      <rect x="111" y="50" width="6" height="8"/>
      <rect x="99" y="70" width="6" height="8"/>
      <rect x="111" y="70" width="6" height="8"/>
      <rect x="144" y="80" width="5" height="5"/>
      <rect x="153" y="80" width="5" height="5"/>
      <circle cx="108" cy="22" r="7" fill="#E0621F" stroke="none"/>
      <path d="M108 29 v9" stroke="#E0621F"/>
    </svg>`,
    '04': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M100 18 l42 12 v26 c0 26 -19 44 -42 55 c-23 -11 -42 -29 -42 -55 v-26 z"/>
      <circle cx="100" cy="62" r="15" stroke="#E0621F"/>
      <path d="M95 70 v-16 h7 c4 0 6 3 6 5 s-2 5 -6 5 h-7 M103 64 l7 8" stroke="#E0621F"/>
    </svg>`,
    '05': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="34" y="20" width="132" height="82"/>
      <path d="M34 42 h132 M34 62 h132 M34 82 h132 M94 20 v82 M124 20 v82"/>
      <path d="M100 68 l5 5 12 -12" stroke="#E0621F"/>
      <path d="M100 88 l5 5 12 -12" stroke="#E0621F"/>
      <path d="M60 30 h20 M60 50 h16 M60 70 h20 M60 90 h14"/>
    </svg>`,
    '06': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="26" y="46" width="92" height="52"/>
      <path d="M38 46 v52 M58 46 v52 M78 46 v52 M98 46 v52"/>
      <circle cx="46" cy="106" r="5"/>
      <circle cx="102" cy="106" r="5"/>
      <path d="M122 72 h48" stroke="#E0621F" stroke-dasharray="4 4"/>
      <path d="M164 66 l8 6 -8 6" stroke="#E0621F"/>
      <path d="M126 34 c8 -6 18 -6 26 0" stroke="#E0621F"/>
    </svg>`,
    '07': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M60 28 l40 -12 40 12 v56 l-40 12 -40 -12 z"/>
      <path d="M60 28 l40 12 40 -12 M100 40 v56"/>
      <rect x="72" y="52" width="56" height="22" stroke="#E0621F"/>
      <path d="M76 56 v14 M80 56 v14 M84 56 v14 M90 56 v14 M96 56 v14 M100 56 v14 M106 56 v14 M112 56 v14 M118 56 v14 M124 56 v14" stroke="#E0621F"/>
    </svg>`,
    '08': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="30" y="18" width="42" height="32"/>
      <rect x="80" y="18" width="42" height="32"/>
      <rect x="130" y="18" width="42" height="32"/>
      <rect x="30" y="68" width="42" height="32"/>
      <rect x="80" y="68" width="42" height="32" stroke="#E0621F"/>
      <rect x="130" y="68" width="42" height="32"/>
      <path d="M38 30 h26 M38 38 h18"/>
      <path d="M88 30 h26 M88 38 h20" stroke="#E0621F"/>
      <path d="M138 30 h26 M138 38 h18"/>
      <path d="M38 80 h26 M38 88 h18"/>
      <path d="M138 80 h26 M138 88 h20"/>
      <circle cx="115" cy="88" r="5" fill="#E0621F" stroke="none"/>
    </svg>`,
    '09': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="30" y="22" width="72" height="52"/>
      <rect x="52" y="42" width="72" height="52"/>
      <circle cx="72" cy="52" r="6"/>
      <path d="M148 42 h30 v46 h-30 z"/>
      <path d="M156 52 v26 15 -8 z" fill="#E0621F" stroke="#E0621F"/>
      <path d="M156 52 l0 26 15 -13 z" fill="#E0621F" stroke="#E0621F"/>
    </svg>`,
    '10': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="120" cy="62" r="36"/>
      <circle cx="120" cy="62" r="24"/>
      <circle cx="120" cy="62" r="12"/>
      <circle cx="120" cy="62" r="3" fill="#E0621F" stroke="#E0621F"/>
      <path d="M32 20 l82 44" stroke="#E0621F"/>
      <path d="M32 20 v14 M32 20 h14" stroke="#E0621F"/>
      <path d="M110 74 l-4 12 12 -4" stroke="#E0621F"/>
    </svg>`,
    '11': `<svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M24 102 H176"/>
      <path d="M36 42 h128 l-16 -20 h-96 z"/>
      <path d="M36 42 v10 h128 v-10"/>
      <path d="M52 52 v42 M78 52 v42 M104 52 v42 M130 52 v42 M154 52 v42"/>
      <path d="M42 94 h124"/>
      <path d="M88 66 h28 M92 62 v10 h4 v-10 M102 62 v10 h4 v-10 M112 62 v10 h4 v-10" stroke="#E0621F"/>
    </svg>`,
  };

  // Hero dashboard mockup — B template hissi
  const HERO_ILLUS = `
    <div class="dashboard">
      <div class="dashboard-top">
        <div class="dashboard-dots"><span></span><span></span><span></span></div>
        <span class="dashboard-url mono">phorpi.dashboard · atlas-cosmetics</span>
      </div>
      <div class="dashboard-label mono">GLOBAL REVENUE / 30D</div>
      <div class="dashboard-metric">$284,592</div>
      <span class="dashboard-change mono">↑ +32.4% önceki dönem</span>
      <div class="dashboard-chart">
        <svg viewBox="0 0 400 130" style="width:100%;height:130px" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dashGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stop-color="#10B981" stop-opacity="0.45"/>
              <stop offset="1" stop-color="#10B981" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <g stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none">
            <line x1="0" y1="30" x2="400" y2="30"/>
            <line x1="0" y1="65" x2="400" y2="65"/>
            <line x1="0" y1="100" x2="400" y2="100"/>
          </g>
          <path d="M0 105 Q40 90 80 82 T160 60 T240 42 T320 26 L400 14" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M0 105 Q40 90 80 82 T160 60 T240 42 T320 26 L400 14 L400 130 L0 130 Z" fill="url(#dashGrad)"/>
          <circle cx="320" cy="26" r="4" fill="#10B981" stroke="#0F172A" stroke-width="2"/>
        </svg>
      </div>
      <div class="dashboard-tiles">
        <div class="dashboard-tile"><div class="dashboard-tile-label">AMAZON</div><div class="dashboard-tile-value">$164k</div></div>
        <div class="dashboard-tile"><div class="dashboard-tile-label">ETSY</div><div class="dashboard-tile-value">$72k</div></div>
        <div class="dashboard-tile"><div class="dashboard-tile-label">EBAY</div><div class="dashboard-tile-value">$48k</div></div>
      </div>
    </div>`;

  function services() {
    return get(state.dict, 'services') || [];
  }

  function renderStats() {
    const list = get(state.dict, 'stats') || [];
    const node = $('#statsList');
    if (!node) return;
    node.innerHTML = '';
    list.forEach(s => {
      node.appendChild(el('li', 'reveal', `<span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span>`));
    });
  }

  function renderHeroVisual() {
    const box = $('#heroVisual');
    if (box) box.innerHTML = HERO_ILLUS;
  }

  function renderMarquee() {
    const list = get(state.dict, 'marquee') || [];
    const label = get(state.dict, 'ui.marquee_label') || '';
    const track = $('#marqueeTrack');
    const lbl = $('#marqueeLabel');
    if (lbl) lbl.textContent = label;
    if (!track) return;
    // Sonsuz akış için iki set art arda
    const items = list.concat(list).map(m => `<span class="marquee-item">${m}</span><span class="marquee-dot" aria-hidden="true">✦</span>`).join('');
    track.innerHTML = items;
  }

  function renderFeatured() {
    const box = $('#featuredService');
    if (!box) return;
    const s = services().find(x => x.no === '01');
    if (!s || state.filter !== 'all') { box.innerHTML = ''; return; }
    const featured = get(state.dict, 'featured') || {};
    box.innerHTML = `
      <article class="fs reveal">
        <div class="fs-copy">
          <div class="fs-eyebrow mono">${featured.eyebrow || 'Öne çıkan hizmet'}</div>
          <div class="fs-no mono">${s.no}</div>
          <h3 class="fs-title">${s.title}</h3>
          <p class="fs-lede">${s.short}</p>
          <div class="fs-meta">
            <span class="fs-tag">${s.tag}</span>
            <span class="fs-price">${s.price}</span>
          </div>
          ${s.price_note ? `<div class="fs-price-note">${s.price_note}</div>` : ''}
          <a href="#hizmetler-liste" class="fs-cta" data-toggle="01">
            <span>${featured.cta || 'Bu hizmetin detayına bak'}</span>
            <span class="fs-cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="fs-visual" aria-hidden="true">${ILLUS['01']}</div>
      </article>
    `;
  }

  function renderVitrin() {
    const wrap = $('#vitrinGrid');
    if (!wrap) return;
    const slots = get(state.dict, 'vitrin.slots') || [];
    wrap.innerHTML = '';
    slots.forEach((slot, i) => {
      const item = el('figure', 'vitrin-slot reveal' + (slot.featured ? ' is-featured' : ''));
      item.style.setProperty('--slot-aspect', slot.aspect || '4/3');
      item.innerHTML = `
        <div class="vitrin-frame">
          <div class="vitrin-frame-bg" aria-hidden="true">
            <svg viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="vgd${i}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.25"/></pattern></defs>
              <rect width="400" height="300" fill="url(#vgd${i})"/>
            </svg>
          </div>
          <div class="vitrin-placeholder-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="4" width="32" height="32"/><path d="M4 28 L14 18 L22 26 L28 20 L36 28"/><circle cx="27" cy="12" r="3" fill="currentColor"/></svg>
          </div>
          <span class="vitrin-index mono">${String(i + 1).padStart(2, '0')} / ${String(slots.length).padStart(2, '0')}</span>
        </div>
        <figcaption class="vitrin-caption">
          <span class="vitrin-label">${slot.label}</span>
          <span class="vitrin-hint">${slot.hint}</span>
        </figcaption>
      `;
      wrap.appendChild(item);
    });
  }

  // Kompakt servis ikonları (22x22, currentColor)
  const ICONS = {
    '01': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 19 h16 M6 15 v-5 M10 15 v-8 M14 15 v-10 M18 15 v-3"/></svg>`,
    '02': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3 h9 l4 4 v13 H6 z M15 3 v4 h4"/><path d="M9 12 h7 M9 15 h4"/></svg>`,
    '03': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19 h14 M6 8 l5 -4 5 4 v10 H6 z M11 4 v10"/></svg>`,
    '04': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 l7 3 v5 c0 5 -3 8 -7 9 c-4 -1 -7 -4 -7 -9 v-5 z M8 11 l3 3 4 -5"/></svg>`,
    '05': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="16" height="16"/><path d="M3 9 h16 M9 3 v16"/></svg>`,
    '06': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="8" width="12" height="10"/><path d="M3 8 v10 M7 8 v10"/><path d="M16 13 h3 M18 11 l2 2 -2 2"/></svg>`,
    '07': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 l7 3 v10 l-7 3 -7 -3 v-10 z M4 6 l7 3 7 -3 M11 9 v10"/></svg>`,
    '08': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="12" y="3" width="7" height="7"/><rect x="3" y="12" width="7" height="7"/><rect x="12" y="12" width="7" height="7"/></svg>`,
    '09': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="10" height="8"/><rect x="9" y="9" width="10" height="8"/></svg>`,
    '10': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="4.5"/><circle cx="11" cy="11" r="1.5" fill="currentColor"/></svg>`,
    '11': `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 19 h16 M5 8 h12 l-2 -3 h-8 z M5 8 v10 M17 8 v10 M8 8 v10 M11 8 v10 M14 8 v10"/></svg>`,
  };

  function renderServices() {
    const wrap = $('#servicesCards');
    if (!wrap) return;
    wrap.innerHTML = '';
    const all = services();
    const list = all.filter(s => state.filter === 'all' || s.kind === state.filter);
    const dictUi = get(state.dict, 'ui') || {};
    list.forEach(s => {
      const card = el('article', 'soc reveal');
      card.setAttribute('data-no', s.no);
      const process = (s.process || []).map(x => `<li>${x}</li>`).join('');
      const deliver = (s.deliver || []).map(x => `<li>${x}</li>`).join('');
      card.innerHTML = `
        <div class="soc-top">
          <div class="soc-icon" aria-hidden="true">${ICONS[s.no] || ''}</div>
          <div class="soc-meta">
            <span class="soc-no mono">/${s.no}</span>
            <span class="soc-tag">${s.tag}</span>
          </div>
        </div>
        <h3 class="soc-title">${s.title}</h3>
        <p class="soc-short">${s.short}</p>
        <div class="soc-price-block">
          <div class="soc-price-wrap">
            <span class="soc-price">${s.price}</span>
            ${s.price_note ? `<span class="soc-price-note">${s.price_note}</span>` : ''}
          </div>
          <a href="#iletisim" class="btn btn-primary btn-sm">${dictUi.teklif_al || 'Teklif Al'} <span class="btn-arrow" aria-hidden="true">→</span></a>
        </div>
        <div class="soc-cols">
          <div class="soc-col">
            <div class="soc-h">${dictUi.surec || 'Süreç'}</div>
            <ol class="soc-list">${process}</ol>
          </div>
          <div class="soc-col">
            <div class="soc-h">${dictUi.teslim || 'Teslim edilenler'}</div>
            <ul class="soc-list check">${deliver}</ul>
          </div>
        </div>
        <div class="soc-excluded">
          <div class="soc-h">${dictUi.dahil_degil || 'Fiyata dahil olmayanlar'}</div>
          <p>${s.excluded}</p>
        </div>
        <div class="soc-foot">
          <span class="soc-duration"><span class="mono">${dictUi.sure || 'Tahmini süre'}</span> ${s.duration}</span>
        </div>
      `;
      wrap.appendChild(card);
    });
  }

  function _unusedOldRenderServices() {
    const grid = $('#servicesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const all = services();
    const list = all.filter(s => state.filter === 'all' || s.kind === state.filter);
    const dictUi = get(state.dict, 'ui') || {};
    list.forEach(s => {
      const row = el('article', 'service-row reveal');
      row.setAttribute('data-no', s.no);
      const isOpen = state.expanded === s.no;
      if (isOpen) row.classList.add('is-open');

      const process = (s.process || []).map(x => `<li>${x}</li>`).join('');
      const deliver = (s.deliver || []).map(x => `<li>${x}</li>`).join('');

      row.innerHTML = `
        <button type="button" class="service-card" aria-expanded="${isOpen ? 'true' : 'false'}" data-toggle="${s.no}">
          <div class="service-head">
            <div class="service-icon" aria-hidden="true">${ICONS[s.no] || ''}</div>
            <span class="service-no mono">/${s.no}</span>
          </div>
          <h3 class="service-title">${s.title}</h3>
          <p class="service-short">${s.short}</p>
          <div class="service-foot">
            <div class="service-price-wrap">
              <span class="service-price">${s.price}</span>
              ${s.price_note ? `<span class="service-price-note">${s.price_note}</span>` : ''}
            </div>
            <span class="service-more">
              <span class="service-more-arrow" aria-hidden="true">${isOpen ? '−' : '→'}</span>
            </span>
          </div>
        </button>
        <div class="service-expand" ${isOpen ? '' : 'hidden'}>
          <div class="expand-inner">
            <div class="expand-cols">
              <div class="expand-col">
                <div class="expand-h">${dictUi.surec || 'Süreç'}</div>
                <ol class="expand-list">${process}</ol>
              </div>
              <div class="expand-col">
                <div class="expand-h">${dictUi.teslim || 'Teslim edilenler'}</div>
                <ul class="expand-list check">${deliver}</ul>
              </div>
            </div>
            <div class="expand-excluded">
              <div class="expand-h">${dictUi.dahil_degil || 'Fiyata dahil olmayanlar'}</div>
              <p>${s.excluded}</p>
            </div>
            <div class="expand-foot">
              <div class="expand-duration"><span class="mono">${dictUi.sure || 'Tahmini süre'}</span> ${s.duration}</div>
              <a href="#iletisim" class="btn btn-primary btn-sm" data-collapse>${dictUi.teklif_al || 'Teklif Al'}</a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(row);
    });
  }

  function toggleService(no) {
    state.expanded = state.expanded === no ? null : no;
    renderServices();
    observeReveals();
    // Aynı satıra scroll — sadece açılırken (header yüksekliğini hesaba kat)
    if (state.expanded === no) {
      const row = document.querySelector('.service-row[data-no="' + no + '"]');
      if (row) {
        const headerH = document.querySelector('.site-header')?.offsetHeight || 68;
        const y = row.getBoundingClientRect().top + window.scrollY - headerH - 24;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }

  // Paket tier işaretleri — 3 kademe için minimal geometrik SVG
  const PKG_MARKS = {
    '01': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="14" cy="34" r="4" fill="currentColor"/>
      <path d="M18 30 L34 14 M34 14 h-8 M34 14 v8"/>
    </svg>`,
    '02': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="8" y="26" width="8" height="14"/>
      <rect x="20" y="18" width="8" height="22"/>
      <rect x="32" y="10" width="8" height="30" fill="currentColor" fill-opacity="0.15"/>
    </svg>`,
    '03': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="6" y="6" width="14" height="14"/>
      <rect x="28" y="6" width="14" height="14"/>
      <rect x="6" y="28" width="14" height="14"/>
      <rect x="28" y="28" width="14" height="14" fill="currentColor" fill-opacity="0.15"/>
      <path d="M20 13 h8 M13 20 v8 M35 20 v8 M20 35 h8"/>
    </svg>`,
  };

  function renderPackages() {
    const list = get(state.dict, 'packages') || [];
    const wrap = $('#packagesList');
    if (!wrap) return;
    wrap.innerHTML = '';
    list.forEach(p => {
      const card = el('article', 'package reveal' + (p.popular ? ' is-popular' : ''));
      card.innerHTML = `
        <div class="package-top">
          <div class="package-mark" aria-hidden="true">${PKG_MARKS[p.no] || ''}</div>
          <div class="package-meta">
            <span class="package-no">${p.no}</span>
            ${p.popular ? `<span class="package-badge">${get(state.dict, 'ui.populer') || 'En çok tercih edilen'}</span>` : ''}
          </div>
        </div>
        <h3 class="package-name">${p.name}</h3>
        <p class="package-tagline">${p.tagline}</p>
        <div class="package-price">
          <span class="package-amount">${p.price}</span>
          <span class="package-period">${p.period}</span>
        </div>
        <ul class="package-items">${(p.items || []).map(it => `<li>${it}</li>`).join('')}</ul>
        <a href="#iletisim" class="package-cta">${get(state.dict, 'ui.teklif_al') || 'Teklif Al'} <span class="package-cta-arrow" aria-hidden="true">→</span></a>
      `;
      wrap.appendChild(card);
    });
  }

  function renderComparison() {
    const groups = get(state.dict, 'comparison') || [];
    const pkgs = get(state.dict, 'packages') || [];
    const node = $('#comparisonTable');
    if (!node) return;
    node.innerHTML = '';

    const scroll = el('div', 'comparison-scroll');
    const inner = el('div', 'comparison-inner');
    const head = el('div', 'comparison-head');
    head.innerHTML = `
      <div></div>
      <div>${pkgs[0]?.name || 'Başlangıç'}</div>
      <div class="hi">${pkgs[1]?.name || 'Büyüme'}</div>
      <div>${pkgs[2]?.name || 'Kurumsal'}</div>`;
    inner.appendChild(head);

    groups.forEach(g => {
      const lbl = el('div', 'comparison-group-label');
      lbl.innerHTML = `<div>${g.name}</div><div></div><div></div><div></div>`;
      inner.appendChild(lbl);
      (g.rows || []).forEach(r => {
        const row = el('div', 'comparison-row');
        row.innerHTML = `
          <div>${r.label}</div>
          <div>${r.a}</div>
          <div class="hi">${r.b}</div>
          <div>${r.c}</div>`;
        inner.appendChild(row);
      });
    });

    scroll.appendChild(inner);
    node.appendChild(scroll);
  }

  function renderSteps() {
    const list = get(state.dict, 'steps') || [];
    const ol = $('#stepsList');
    if (!ol) return;
    ol.innerHTML = '';
    list.forEach(s => {
      ol.appendChild(el('li', 'reveal', `
        <div class="step-no">${s.no}</div>
        <h3 class="step-title">${s.title}</h3>
        <p class="step-text">${s.text}</p>
        <div class="step-time">${s.time}</div>
      `));
    });
  }

  function renderReasons() {
    const list = get(state.dict, 'reasons') || [];
    const wrap = $('#reasonsList');
    if (!wrap) return;
    wrap.innerHTML = '';
    list.forEach(r => {
      wrap.appendChild(el('div', 'reveal', `<h3>${r.title}</h3><p>${r.text}</p>`));
    });
  }

  function renderFaq() {
    const list = get(state.dict, 'faqs') || [];
    const wrap = $('#faqList');
    if (!wrap) return;
    wrap.innerHTML = '';
    list.forEach((f, i) => {
      const item = el('div', 'faq reveal' + (state.faq === i ? ' is-open' : ''));
      item.innerHTML = `
        <button type="button" class="faq-q" aria-expanded="${state.faq === i}">
          <h3>${f.q}</h3>
          <div class="faq-sign">${state.faq === i ? '−' : '+'}</div>
        </button>
        <div class="faq-a">${f.a}</div>`;
      item.querySelector('.faq-q').addEventListener('click', () => {
        state.faq = state.faq === i ? null : i;
        renderFaq();
        observeReveals();
      });
      wrap.appendChild(item);
    });
  }

  function renderChannels() {
    const list = get(state.dict, 'channels') || [];
    const wrap = $('#channelsList');
    if (!wrap) return;
    wrap.innerHTML = '';
    list.forEach(c => {
      wrap.appendChild(el('div', 'channel', `
        <div class="channel-label">${c.label}</div>
        <div class="channel-value">${c.value}</div>
      `));
    });
    const note = get(state.dict, 'iletisim.note');
    if (note) wrap.appendChild(el('p', 'iletisim-side-note', note));
  }

  function renderMarkets() {
    const list = get(state.dict, 'markets') || [];
    const wrap = $('#marketChips');
    if (!wrap) return;
    wrap.innerHTML = '';
    list.forEach((m) => {
      const l = el('label', 'chip');
      l.innerHTML = `<input type="checkbox" name="pazar" value="${m}"><span>${m}</span>`;
      wrap.appendChild(l);
    });
  }

  function render() {
    renderHeroVisual();
    renderMarquee();
    renderStats();
    renderServices();
    renderPackages();
    renderComparison();
    renderSteps();
    renderReasons();
    renderVitrin();
    renderFaq();
    renderChannels();
    renderMarkets();
  }

  // ---- Scroll reveal ----
  let io = null;
  function observeReveals() {
    const targets = document.querySelectorAll('.reveal:not(.is-in), .hero-visual:not(.is-in)');
    // Fallback: IO yoksa veya viewport 0x0 (test / headless) → hepsini göster
    if (!('IntersectionObserver' in window) || window.innerHeight === 0) {
      targets.forEach(n => n.classList.add('is-in'));
      return;
    }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    targets.forEach(n => io.observe(n));
    // Güvenlik ağı — 3 sn sonra hâlâ görünmemişse zorla göster
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.is-in), .hero-visual:not(.is-in)').forEach(n => n.classList.add('is-in'));
    }, 3000);
  }

  // ---- Events ----
  function bindStatic() {
    // Filtre
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        state.filter = chip.getAttribute('data-filter');
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('is-active', c === chip));
        renderServices();
        observeReveals();
      });
    });

    // Legacy toggle desteği (mevcut bir yerde varsa çalışsın)
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-toggle]');
      if (toggle) {
        e.preventDefault();
        if (typeof toggleService === 'function') toggleService(toggle.getAttribute('data-toggle'));
        return;
      }
    });

    // Anchor scroll — header offset'i düzeltmek için native davranışı geç
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.site-header')?.offsetHeight || 68;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH - 24;
      window.scrollTo({ top: y, behavior: 'smooth' });
      if (history.pushState) history.pushState(null, '', href);
    }, true);

    // Dil
    $('#langSelect').addEventListener('change', e => setLang(e.target.value));

    // Mobil menü
    const toggle = $('#menuToggle');
    const nav = $('#siteNav');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));

    // Form
    $('#quoteForm').addEventListener('submit', e => {
      e.preventDefault();
      alert(get(state.dict, 'form.gonderildi') || 'Talebiniz alındı. En kısa sürede dönüş yapacağız.');
    });

    // Header scroll durumu
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  // ---- Init ----
  function initLang() {
    const url = new URLSearchParams(location.search).get('lang');
    const stored = localStorage.getItem('phorpi.lang');
    const lang = (url === 'en' || url === 'tr') ? url : (stored || 'tr');
    $('#langSelect').value = lang;
    return lang;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    bindStatic();
    await setLang(initLang());
  });
})();
