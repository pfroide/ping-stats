(() => {
  const host = document.getElementById('equipe-root');
  if (!host) return;

  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }
    .wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color: #e6e9ef; padding: 4px 0; }
    .section { margin-bottom: 20px; }
    .sec-title { font-weight: 800; font-size: 14px; color: rgba(230,233,239,0.95); margin: 0 0 10px; }

    /* Sous-onglets */
    .subtabs { display: flex; gap: 5px; flex-wrap: nowrap; overflow-x: auto; margin-bottom: 14px; border-bottom: 1px solid #263043; padding-bottom: 8px; }
    .stab { padding: 6px 10px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #9aa4b2; cursor: pointer; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
    .stab.active { background: rgba(125,211,252,0.10); border-color: rgba(125,211,252,0.30); color: #7dd3fc; }
    .stab-panel { display: none; }
    .stab-panel.active { display: block; }

    /* Filtres */
    .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center; }
    .filter-label { font-size: 12px; color: #9aa4b2; font-weight: 700; }
    select, input[type=text] { padding: 9px 11px; border-radius: 11px; border: 1px solid #263043; background: rgba(255,255,255,0.04); color: #e6e9ef; outline: none; font-size: 13px; }

    /* Pills phase */
    .pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pill { padding: 6px 12px; border-radius: 99px; border: 1px solid #263043; background: rgba(255,255,255,0.04); color: #9aa4b2; cursor: pointer; font-size: 12px; font-weight: 700; }
    .pill.active { background: rgba(125,211,252,0.12); border-color: rgba(125,211,252,0.35); color: #7dd3fc; }

    /* Toggle mode graphique */
    .mode-toggle { display: flex; gap: 0; border: 1px solid #263043; border-radius: 10px; overflow: hidden; }
    .mode-btn { padding: 7px 13px; border: none; background: transparent; color: #9aa4b2; cursor: pointer; font-size: 12px; font-weight: 700; }
    .mode-btn.active { background: rgba(125,211,252,0.12); color: #7dd3fc; }

    /* Panneau joueurs */
    .player-panel { border: 1px solid #263043; border-radius: 12px; padding: 10px; background: rgba(255,255,255,0.02); margin-bottom: 8px; }
    .player-panel-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .player-panel-header input { flex: 1 1 140px; }
    .select-all-btn { padding: 7px 11px; border-radius: 9px; border: 1px solid #263043; background: rgba(255,255,255,0.06); color: #e6e9ef; cursor: pointer; font-size: 12px; white-space: nowrap; }
    .player-list { display: flex; flex-wrap: wrap; gap: 6px; max-height: 180px; overflow-y: auto; }
    .player-cb { display: flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 9px; border: 1px solid #263043; background: rgba(255,255,255,0.03); cursor: pointer; font-size: 12px; user-select: none; }
    .player-cb input[type=checkbox] { width: 14px; height: 14px; margin: 0; cursor: pointer; accent-color: #7dd3fc; }
    .player-cb .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .player-cb.checked { border-color: rgba(125,211,252,0.35); background: rgba(125,211,252,0.06); }

    /* Canvas */
    canvas { width: 100%; height: 360px; border: 1px solid #263043; border-radius: 13px; background: rgba(0,0,0,0.10); display: block; margin-bottom: 8px; transition: height 0.25s ease; }
    canvas.expanded { height: 620px; }
    .expand-btn { padding: 6px 12px; border-radius: 9px; border: 1px solid #263043; background: rgba(255,255,255,0.05); color: #9aa4b2; cursor: pointer; font-size: 12px; font-weight: 700; }
    .expand-btn:hover { background: rgba(255,255,255,0.10); color: #e6e9ef; }

    /* Légende */
    .legend { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .leg-item { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 99px; border: 1px solid #263043; background: rgba(255,255,255,0.04); font-size: 12px; }
    .leg-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

    /* Tables */
    .table-wrap { border: 1px solid #263043; border-radius: 13px; overflow: auto; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { position: sticky; top: 0; background: rgba(12,18,30,0.94); backdrop-filter: blur(4px); padding: 10px 12px; text-align: left; color: #9aa4b2; font-weight: 700; border-bottom: 1px solid #263043; cursor: pointer; user-select: none; }
    th:hover { color: #e6e9ef; }
    td { padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.03); }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .rank { font-weight: 800; color: #9aa4b2; }
    .rank.top1 { color: #fbbf24; }
    .rank.top3 { color: #94a3b8; }
    .pts { font-weight: 700; }

    /* Alertes */
    .alert-up   { color: #4ade80; font-weight: 700; }
    .alert-down { color: #f87171; font-weight: 700; }
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 99px; font-size: 11px; font-weight: 800; }
    .badge.up   { background: rgba(74,222,128,0.12); color: #4ade80; }
    .badge.down { background: rgba(248,113,113,0.12); color: #f87171; }
    .badge.neutral { background: rgba(154,164,178,0.10); color: #9aa4b2; }

    /* Rencontres équipe */
    .match-V { color: #4ade80; font-weight: 800; }
    .match-D { color: #f87171; font-weight: 800; }
    .div-label { font-size: 11px; color: #9aa4b2; }
    .info { font-size: 12px; color: #9aa4b2; margin: 6px 0 0; }
    .error { padding: 10px; border-radius: 11px; background: rgba(255,70,70,0.10); color: #ffd2d2; font-size: 13px; }

    /* Partage */
    .share-btn { padding: 6px 12px; border-radius: 9px; border: 1px solid #263043; background: rgba(255,255,255,0.05); color: #9aa4b2; cursor: pointer; font-size: 12px; font-weight: 700; }
    .share-btn:hover { background: rgba(255,255,255,0.10); color: #e6e9ef; }
    .share-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1e293b; border: 1px solid #263043; color: #e6e9ef; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; z-index: 99999; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
    .share-toast.show { opacity: 1; }
  `;
  root.appendChild(style);

  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  root.appendChild(wrap);

  // Toast partage
  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.textContent = '🔗 Lien copié !';
  document.body.appendChild(toast);
  function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ── Palette ───────────────────────────────────────────────────────────────
  const PALETTE = ['#7dd3fc','#f472b6','#86efac','#fbbf24','#c084fc','#fb923c',
    '#34d399','#f87171','#a78bfa','#38bdf8','#4ade80','#facc15',
    '#e879f9','#60a5fa','#2dd4bf','#f97316','#818cf8','#fb7185'];
  const playerColor = i => PALETTE[i % PALETTE.length];

  // ── Canvas ────────────────────────────────────────────────────────────────
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function resizeCanvas(cv) {
    const rect = cv.getBoundingClientRect();
    const w = Math.round(rect.width * dpr()), h = Math.round(rect.height * dpr());
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0);
    return { ctx, w: rect.width, h: rect.height };
  }
  const fmtPts = v => v == null ? '' : Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',');
  const fmtDelta = v => v == null ? '' : (v > 0 ? '+' : '') + fmtPts(v);

  // ── Données ───────────────────────────────────────────────────────────────
  let CLUB = null;
  async function loadClub() {
    // Multi-club : utiliser data/club_data_<slug>.json si un club est sélectionné
    let cid = null;
    try { cid = localStorage.getItem('ping_selected_club'); } catch(_) {}
    const urls = [];
    if (cid) {
      urls.push(new URL('data/club_data_' + cid + '.json', document.baseURI).toString());
      urls.push('./data/club_data_' + cid + '.json');
    }
    urls.push(new URL('data/club.json', document.baseURI).toString());
    urls.push('./data/club.json');
    for (const url of urls) {
      try { const r = await fetch(url); if (r.ok) { CLUB = await r.json(); return; } } catch(_) {}
    }
  }

  // ── État global ───────────────────────────────────────────────────────────
  let activeTab   = 'evolution';
  let phaseFilter = 'all';
  let chartMode   = 'absolu';   // 'absolu' | 'relatif'
  let searchText  = '';
  let checkedLics = new Set();
  let playerMeta  = [];
  let sortCol     = 'pts_mensuel', sortAsc = false;
  let sortColEq   = 'V', sortAscEq = false;

  // ── Lecture/écriture URL hash (partage de lien) ───────────────────────────
  function readHash() {
    try {
      const h = decodeURIComponent(location.hash.slice(1));
      if (!h) return;
      const p = new URLSearchParams(h);
      if (p.get('tab'))    activeTab   = p.get('tab');
      if (p.get('phase'))  phaseFilter = p.get('phase');
      if (p.get('mode'))   chartMode   = p.get('mode');
      if (p.get('lics'))   checkedLics = new Set(p.get('lics').split(',').filter(Boolean));
    } catch(_) {}
  }
  function writeHash() {
    const p = new URLSearchParams();
    p.set('tab',   activeTab);
    p.set('phase', phaseFilter);
    p.set('mode',  chartMode);
    if (checkedLics.size) p.set('lics', [...checkedLics].join(','));
    history.replaceState(null, '', '#' + p.toString());
  }
  readHash();

  // ── Construction UI ───────────────────────────────────────────────────────
  function buildUI() {
    const team = CLUB && CLUB.team;
    if (!team) {
      wrap.innerHTML = '<div class="error">Données Équipe indisponibles (club.json absent ou non regénéré).</div>';
      return;
    }
    const { segments, evolution, classement, equipes } = team;
    playerMeta = evolution.map((p, i) => ({ licence: p.licence, name: p.name, color: playerColor(i), idx: i }));

    wrap.innerHTML = '';

    // ── Barre sous-onglets ────────────────────────────────────────────────
    const subtabs = document.createElement('div');
    subtabs.className = 'subtabs';
    const panels = {};
    [['evolution','📈 Évolution'],['classement','🏅 Classements'],['progres','📊 Progrès'],['equipes','🏓 Équipes']].forEach(([id, lbl]) => {
      const btn = document.createElement('button');
      btn.className = 'stab' + (activeTab === id ? ' active' : '');
      btn.type = 'button'; btn.textContent = lbl;
      btn.addEventListener('click', () => {
        activeTab = id; writeHash();
        subtabs.querySelectorAll('.stab').forEach(b => b.classList.toggle('active', b === btn));
        Object.entries(panels).forEach(([k, p]) => p.classList.toggle('active', k === id));
      });
      subtabs.appendChild(btn);
      const panel = document.createElement('div');
      panel.className = 'stab-panel' + (activeTab === id ? ' active' : '');
      panels[id] = panel;
    });
    wrap.appendChild(subtabs);
    Object.values(panels).forEach(p => wrap.appendChild(p));

    buildEvolution(panels['evolution'], segments, evolution);
    buildClassement(panels['classement'], evolution, classement, segments);
    buildProgres(panels['progres'], evolution, classement);
    buildEquipes(panels['equipes'], equipes || []);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SOUS-ONGLET 1 : ÉVOLUTION
  // ══════════════════════════════════════════════════════════════════════════
  function buildEvolution(container, segments, evolution) {
    // Barre de contrôles
    const controls = document.createElement('div');
    controls.className = 'filters';

    // Pills phase
    const pillsWrap = document.createElement('div');
    pillsWrap.className = 'pills';
    [['all','Toutes'],['p1','Phase 1'],['p2','Phase 2']].forEach(([val, lbl]) => {
      const p = document.createElement('button');
      p.className = 'pill' + (phaseFilter === val ? ' active' : '');
      p.type = 'button'; p.textContent = lbl;
      p.addEventListener('click', () => {
        phaseFilter = val; writeHash();
        pillsWrap.querySelectorAll('.pill').forEach(b => b.classList.toggle('active', b === p));
        drawEvolution(evolCanvas, segments, evolution);
      });
      pillsWrap.appendChild(p);
    });
    controls.appendChild(pillsWrap);

    // Toggle absolu/relatif
    const toggle = document.createElement('div');
    toggle.className = 'mode-toggle';
    [['absolu','Absolu'],['relatif','Relatif']].forEach(([val, lbl]) => {
      const btn = document.createElement('button');
      btn.className = 'mode-btn' + (chartMode === val ? ' active' : '');
      btn.type = 'button'; btn.textContent = lbl;
      btn.addEventListener('click', () => {
        chartMode = val; writeHash();
        toggle.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b === btn));
        drawEvolution(evolCanvas, segments, evolution);
      });
      toggle.appendChild(btn);
    });
    controls.appendChild(toggle);

    // Bouton partage
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn'; shareBtn.type = 'button'; shareBtn.textContent = '🔗 Partager';
    shareBtn.addEventListener('click', () => {
      writeHash();
      navigator.clipboard.writeText(location.href).then(showToast).catch(() => showToast());
    });
    controls.appendChild(shareBtn);

    // Bouton agrandir
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn'; expandBtn.type = 'button'; expandBtn.textContent = '⤢ Agrandir';
    let isExpanded = false;
    expandBtn.addEventListener('click', () => {
      isExpanded = !isExpanded;
      evolCanvas.classList.toggle('expanded', isExpanded);
      expandBtn.textContent = isExpanded ? '⤡ Réduire' : '⤢ Agrandir';
      drawEvolution(evolCanvas, segments, evolution);
    });
    controls.appendChild(expandBtn);

    container.appendChild(controls);

    // Panneau joueurs
    const playerPanel = document.createElement('div');
    playerPanel.className = 'player-panel';
    const panelHeader = document.createElement('div');
    panelHeader.className = 'player-panel-header';
    const searchInput = document.createElement('input');
    searchInput.type = 'text'; searchInput.placeholder = 'Rechercher…'; searchInput.value = searchText;
    searchInput.addEventListener('input', e => { searchText = e.target.value; rebuildPlayerList(playerList, selAllBtn); });
    panelHeader.appendChild(searchInput);
    const selAllBtn = document.createElement('button');
    selAllBtn.className = 'select-all-btn'; selAllBtn.type = 'button';
    selAllBtn.textContent = checkedLics.size === 0 ? 'Tout cocher' : 'Tout décocher';
    selAllBtn.addEventListener('click', () => {
      const visible = getVisiblePlayers();
      const allChecked = visible.every(p => checkedLics.has(p.licence));
      if (!allChecked) visible.forEach(p => checkedLics.add(p.licence));
      else             visible.forEach(p => checkedLics.delete(p.licence));
      selAllBtn.textContent = checkedLics.size === 0 ? 'Tout cocher' : 'Tout décocher';
      rebuildPlayerList(playerList, selAllBtn);
      writeHash();
      drawEvolution(evolCanvas, segments, evolution);
      drawLegend(legendEvol);
    });
    panelHeader.appendChild(selAllBtn);
    playerPanel.appendChild(panelHeader);
    const playerList = document.createElement('div');
    playerList.className = 'player-list';
    playerPanel.appendChild(playerList);
    container.appendChild(playerPanel);

    // Canvas
    const evolCanvas = document.createElement('canvas');
    container.appendChild(evolCanvas);

    // Légende
    const legendEvol = document.createElement('div');
    legendEvol.className = 'legend';
    container.appendChild(legendEvol);

    // Mode relatif : info
    const infoEvol = document.createElement('div');
    infoEvol.className = 'info';
    infoEvol.textContent = 'Mode Relatif : progression en points par rapport au premier segment affiché.';
    container.appendChild(infoEvol);

    function getVisiblePlayers() {
      const q = searchText.toLowerCase().trim();
      return playerMeta.filter(p => !q || p.name.toLowerCase().includes(q));
    }

    function rebuildPlayerList(container, selBtn) {
      container.innerHTML = '';
      getVisiblePlayers().forEach(pm => {
        const label = document.createElement('label');
        label.className = 'player-cb' + (checkedLics.has(pm.licence) ? ' checked' : '');
        const cb = document.createElement('input'); cb.type = 'checkbox';
        cb.checked = checkedLics.has(pm.licence);
        cb.addEventListener('change', () => {
          if (cb.checked) checkedLics.add(pm.licence); else checkedLics.delete(pm.licence);
          label.className = 'player-cb' + (cb.checked ? ' checked' : '');
          selBtn.textContent = checkedLics.size === 0 ? 'Tout cocher' : 'Tout décocher';
          writeHash();
          drawEvolution(evolCanvas, segments, evolution);
          drawLegend(legendEvol);
        });
        const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = pm.color;
        label.appendChild(cb); label.appendChild(dot);
        label.appendChild(document.createTextNode(pm.name));
        container.appendChild(label);
      });
    }

    function drawLegend(container) {
      container.innerHTML = '';
      playerMeta.filter(pm => checkedLics.has(pm.licence)).forEach(pm => {
        const item = document.createElement('div'); item.className = 'leg-item';
        item.innerHTML = `<span class="leg-dot" style="background:${pm.color}"></span>${pm.name}`;
        container.appendChild(item);
      });
    }

    rebuildPlayerList(playerList, selAllBtn);
    drawEvolution(evolCanvas, segments, evolution);
    drawLegend(legendEvol);

    const ro = new ResizeObserver(() => drawEvolution(evolCanvas, segments, evolution));
    ro.observe(evolCanvas);
  }

  // ── Dessin ────────────────────────────────────────────────────────────────
  function drawEvolution(cv, segments, evolution) {
    const { ctx, w, h } = resizeCanvas(cv);
    ctx.clearRect(0, 0, w, h);

    const filteredSegs = segments.filter(s =>
      phaseFilter === 'all' ? true : phaseFilter === 'p1' ? s.phase === 1 : s.phase === 2
    );
    if (!filteredSegs.length) {
      ctx.fillStyle = '#9aa4b2'; ctx.font = '13px system-ui';
      ctx.fillText('Aucune donnée pour cette phase.', 20, h / 2); return;
    }

    // Ajouter le point "Segment en cours" (pts_actuel du dernier segment filtré)
    const lastSeg = filteredSegs[filteredSegs.length - 1];
    const lastSegOrigIdx = segments.findIndex(s => s.nom === lastSeg.nom);
    const labels = [...filteredSegs.map(s => s.nom), 'En cours'];

    // Construire les séries
    const series = [];
    evolution.forEach(p => {
      if (!checkedLics.has(p.licence)) return;
      const pm = playerMeta.find(m => m.licence === p.licence);
      if (!pm) return;
      let values = filteredSegs.map(s => {
        const origIdx = segments.findIndex(os => os.nom === s.nom);
        return origIdx >= 0 ? p.values[origIdx] : null;
      });
      const actVal = (lastSegOrigIdx >= 0 && p.pts_actuel) ? (p.pts_actuel[lastSegOrigIdx] ?? null) : null;
      values.push(actVal);

      // Mode relatif : soustraction par rapport à première valeur non nulle
      if (chartMode === 'relatif') {
        const baseVal = values.find(v => v != null);
        if (baseVal != null) values = values.map(v => v != null ? Math.round((v - baseVal) * 100) / 100 : null);
      }
      if (values.every(v => v == null)) return;
      series.push({ label: p.name, values, color: pm.color });
    });

    const n = labels.length;
    const left = 60, top = 20, right = w - 16, bottom = h - 54;
    const x = i => left + (right - left) * (n <= 1 ? 0 : i / (n - 1));

    // ymin/ymax
    const all = [];
    for (const s of series) for (const v of s.values) if (v != null) all.push(v);
    if (!all.length) {
      ctx.fillStyle = '#9aa4b2'; ctx.font = '13px system-ui';
      ctx.fillText('Sélectionnez des joueurs.', 20, h / 2); return;
    }
    let ymin = Math.min(...all), ymax = Math.max(...all);
    if (chartMode === 'relatif') { ymin = Math.min(ymin, 0); ymax = Math.max(ymax, 0); }
    const pad = Math.max((ymax - ymin) * 0.12, 20);
    ymin -= pad; ymax += pad;
    const y = v => bottom - (bottom - top) * ((v - ymin) / (ymax - ymin));

    // Grille horizontale
    ctx.font = '11px system-ui'; ctx.fillStyle = '#9aa4b2';
    const nTicks = 5;
    for (let t = 0; t <= nTicks; t++) {
      const val = ymin + (ymax - ymin) * (t / nTicks);
      const yy = y(val);
      ctx.save(); ctx.setLineDash([3,5]); ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, yy); ctx.lineTo(right, yy); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.restore();
      ctx.fillText(Math.round(val), 2, yy + 4);
    }

    // Ligne zéro en mode relatif
    if (chartMode === 'relatif') {
      const y0 = y(0);
      if (y0 >= top && y0 <= bottom) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(left, y0); ctx.lineTo(right, y0); ctx.stroke(); ctx.restore();
      }
    }

    // Colonne "En cours" surlignée
    const curIdx = n - 1;
    const halfGap = n > 1 ? (x(1) - x(0)) / 2 : 20;
    ctx.save();
    ctx.fillStyle = 'rgba(125,211,252,0.07)'; ctx.strokeStyle = 'rgba(125,211,252,0.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(x(curIdx) - halfGap, top, halfGap * 2 + 2, bottom - top);
    ctx.fill(); ctx.stroke(); ctx.restore();

    // Labels X
    labels.forEach((lbl, i) => {
      const xx = x(i);
      ctx.save(); ctx.translate(xx, bottom + 10); ctx.rotate(-0.6);
      ctx.fillStyle = i === curIdx ? 'rgba(125,211,252,0.80)' : '#9aa4b2';
      ctx.font = i === curIdx ? '700 11px system-ui' : '11px system-ui';
      ctx.fillText(lbl.length > 12 ? lbl.slice(0, 12) + '…' : lbl, 0, 0);
      ctx.restore();
    });

    // Courbes
    for (const s of series) {
      // Forward-fill
      const filled = []; let last = null;
      for (const v of s.values) { if (v != null) last = v; filled.push(last); }
      if (filled.every(v => v == null)) continue;

      ctx.strokeStyle = s.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); let started = false;
      filled.forEach((v, i) => {
        if (v == null) return;
        const xx = x(i), yy = y(v);
        if (!started) { ctx.moveTo(xx, yy); started = true; } else ctx.lineTo(xx, yy);
      });
      ctx.stroke();

      // Points + valeurs
      filled.forEach((v, i) => {
        if (v == null) return;
        const isReal = s.values[i] != null;
        const xx = x(i), yy = y(v);
        ctx.beginPath(); ctx.arc(xx, yy, 4, 0, Math.PI * 2);
        if (isReal) { ctx.fillStyle = s.color; ctx.fill(); }
        else { ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 2.5; }

        const txt = chartMode === 'relatif' ? fmtDelta(v) : fmtPts(v);
        if (!txt) return;
        ctx.font = '600 11px system-ui';
        const tw = ctx.measureText(txt).width;
        const tx = Math.max(2, Math.min(w - tw - 2, xx - tw / 2));
        const si = series.indexOf(s);
        let ty = yy - 10 - si * 13;
        if (ty < top + 12) ty = yy + 16 + si * 13;
        ctx.fillStyle = 'rgba(11,18,32,0.65)'; ctx.fillRect(tx - 2, ty - 12, tw + 4, 15);
        ctx.fillStyle = isReal ? s.color : 'rgba(154,164,178,0.7)';
        ctx.fillText(txt, tx, ty);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SOUS-ONGLET 2 : CLASSEMENT
  // ══════════════════════════════════════════════════════════════════════════
  // PDF EXPORT — chargement lazy de jsPDF + autoTable
  // ══════════════════════════════════════════════════════════════════════════
  let _jsPDFLoaded = false;
  function loadJsPDF(cb) {
    if (_jsPDFLoaded) { cb(); return; }
    function loadScript(src, next) {
      const s = document.createElement('script');
      s.src = src; s.onload = next;
      s.onerror = function() { console.error('jsPDF load error:', src); };
      document.head.appendChild(s);
    }
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function() {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js', function() {
        _jsPDFLoaded = true; cb();
      });
    });
  }

  function pdfHeader(doc, title, subtitle) {
    const W = doc.internal.pageSize.getWidth();
    // Bande de titre
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, W, 28, 'F');
    doc.setTextColor(125, 211, 252);
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 118, 129);
    doc.text(subtitle, 14, 20);
    // Date
    const now = new Date().toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'});
    doc.text(now, W - 14, 20, { align: 'right' });
    // Trait séparateur
    doc.setDrawColor(33, 38, 45);
    doc.setLineWidth(0.5);
    doc.line(0, 28, W, 28);
  }

  function pdfFooter(doc) {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(33, 38, 45);
      doc.line(0, H - 12, W, H - 12);
      doc.setFontSize(8); doc.setTextColor(110, 118, 129);
      doc.setFont('helvetica', 'normal');
      doc.text('Ping Stats • Export automatique', 14, H - 5);
      doc.text('Page ' + i + ' / ' + pages, W - 14, H - 5, { align: 'right' });
    }
  }

  function makeExportBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'margin-left:auto;padding:7px 10px;background:rgba(255,255,255,0.06);color:#e6edf3;border:1px solid rgba(255,255,255,0.18);border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;';
    btn.addEventListener('mouseenter', () => btn.style.opacity = '0.85');
    btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ══════════════════════════════════════════════════════════════════════════
  function buildClassement(container, evolution, classement, segments) {

    // pts du segment précédant le dernier (avant-dernier segment avec une valeur)
    function getPrevSegPts(row) {
      const ep = evolution.find(p => p.licence === row.licence);
      if (!ep) return null;
      // prendre l'avant-dernière valeur non nulle
      const nonNull = ep.values.map((v,i) => v != null ? {v,i} : null).filter(Boolean);
      if (nonNull.length < 2) return null;
      return nonNull[nonNull.length - 2].v;
    }

    function offPts(row, offKey) {
      if (row[offKey] != null) return row[offKey];
      const ep = evolution.find(p => p.licence === row.licence);
      if (ep) for (const v of ep.values) if (v != null) return v;
      return null;
    }

    const tableWrap = document.createElement('div');
    tableWrap.className = 'table-wrap';

    const infoClass = document.createElement('div');
    infoClass.className = 'info';
    infoClass.textContent = 'Forme = Mensuel − Segment précédent. ▲ vert ≥ +10 pts, ▼ rouge ≤ −10 pts, jaune sinon.';

    // Bouton export PDF
    const classExportRow = document.createElement('div');
    classExportRow.style.cssText = 'display:flex;align-items:center;margin-bottom:10px;';
    const classExportBtn = makeExportBtn('⬇ PDF', function() {
      loadJsPDF(function() {
        exportClassementPDF(classement, evolution);
      });
    });
    classExportRow.appendChild(classExportBtn);
    container.appendChild(classExportRow);
    container.appendChild(tableWrap);
    container.appendChild(infoClass);

    function exportClassementPDF(classement, evolution) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdfHeader(doc, 'Classements & Progrès', 'Points officiels, forme et progression depuis le début de saison');
      const rows = [...classement].sort((a, b) => (b.pts_mensuel || 0) - (a.pts_mensuel || 0));
      const tableData = rows.map(r => {
        const p1   = offPts(r, 'pts_officiel_p1');
        const p2   = offPts(r, 'pts_officiel_p2');
        const prev = getPrevSegPts(r);
        const curr = r.pts_mensuel;
        const forme   = (curr != null && prev != null) ? Math.round((curr - prev) * 100) / 100 : null;
        const progres = (p1   != null && curr != null) ? Math.round((curr - p1)   * 100) / 100 : null;
        function s(v)  { return v != null ? (Number.isInteger(v) ? v : v.toFixed(2)) : '—'; }
        function sp(v) { return v == null ? '—' : (v >= 0 ? '+' + s(v) : s(v)); }
        return [r.name || '—', s(p1), s(p2), s(prev), s(curr), sp(forme), sp(progres)];
      });
      doc.autoTable({
        startY: 34,
        head: [['Joueur', 'Off. P1', 'Off. P2', 'Seg. préc.', 'Mensuel', 'Forme', 'Progrès']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 1.6, textColor: [30, 30, 40], font: 'helvetica', overflow: 'ellipsize' },
        headStyles: { fillColor: [13, 17, 23], textColor: [125, 211, 252], fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 48 },
          1: { halign: 'right', cellWidth: 19 },
          2: { halign: 'right', cellWidth: 19 },
          3: { halign: 'right', cellWidth: 22 },
          4: { halign: 'right', cellWidth: 22 },
          5: { halign: 'right', cellWidth: 22 },
          6: { halign: 'right', cellWidth: 22 },
        },
        margin: { left: 14, right: 14 },
        didParseCell: function(data) {
          if (data.section === 'body' && (data.column.index === 5 || data.column.index === 6)) {
            const v = parseFloat(data.cell.raw);
            if (!isNaN(v)) {
              data.cell.styles.textColor = v > 0 ? [74, 222, 128] : v < 0 ? [248, 113, 113] : [155, 164, 178];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
      });
      pdfFooter(doc);
      doc.save('classements_progres.pdf');
    }
    function buildTable() {
      tableWrap.innerHTML = '';

      const rows = [...classement].sort((a, b) => {
        if (sortCol === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        const getVal = (r, col) => {
          if (col === 'pts_officiel_p1') return offPts(r, 'pts_officiel_p1') ?? -Infinity;
          if (col === 'pts_officiel_p2') return offPts(r, 'pts_officiel_p2') ?? -Infinity;
          if (col === 'pts_prev_seg')    return getPrevSegPts(r) ?? -Infinity;
          if (col === 'forme') {
            const prev = getPrevSegPts(r); const curr = r.pts_mensuel;
            return (prev != null && curr != null) ? curr - prev : -Infinity;
          }
          return r[col] ?? -Infinity;
        };
        const va = getVal(a, sortCol), vb = getVal(b, sortCol);
        return sortAsc ? va - vb : vb - va;
      });

      const table = document.createElement('table');
      const arrow = col => col === sortCol ? (sortAsc ? ' ▲' : ' ▼') : '';
      table.innerHTML = `<thead><tr>
        <th class="num" data-sort="rang">#${arrow('rang')}</th>
        <th data-sort="name">Joueur${arrow('name')}</th>
        <th class="num" data-sort="pts_officiel_p1">Officiel P1${arrow('pts_officiel_p1')}</th>
        <th class="num" data-sort="pts_officiel_p2">Officiel P2${arrow('pts_officiel_p2')}</th>
        <th class="num" data-sort="pts_prev_seg">Seg. préc.${arrow('pts_prev_seg')}</th>
        <th class="num" data-sort="pts_mensuel">Mensuel${arrow('pts_mensuel')}</th>
        <th class="num" data-sort="forme">Forme${arrow('forme')}</th>
      </tr></thead>`;
      table.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.dataset.sort;
          if (sortCol === col) sortAsc = !sortAsc; else { sortCol = col; sortAsc = col === 'name'; }
          buildTable();
        });
      });

      const tbody = document.createElement('tbody');
      rows.forEach(row => {
        const tr = document.createElement('tr');
        const rankClass = row.rang === 1 ? 'rank top1' : row.rang <= 3 ? 'rank top3' : 'rank';
        const fmt = v => v != null ? `<span class="pts">${fmtPts(v)}</span>` : '<span style="color:#9aa4b2">—</span>';

        const prev = getPrevSegPts(row);
        const curr = row.pts_mensuel;
        let formeHtml = '<span style="color:#6e7681">—</span>';
        if (prev != null && curr != null) {
          const delta = Math.round((curr - prev) * 100) / 100;
          const col   = delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : '#9aa4b2';
          const sign  = delta > 0 ? '+' : '';
          const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '▶';
          const abs   = Math.abs(delta);
          const str   = Number.isInteger(abs) ? abs : abs.toFixed(2);
          formeHtml = `<span style="background:${col}22;color:${col};border:1px solid ${col}55;border-radius:8px;padding:3px 10px;font-weight:700;font-size:13px;white-space:nowrap">${arrow} ${sign}${delta < 0 ? '-' : ''}${str}</span>`;
        }

        tr.innerHTML = `
          <td class="num"><span class="${rankClass}">${row.rang}</span></td>
          <td>${row.name}</td>
          <td class="num">${fmt(offPts(row,'pts_officiel_p1'))}</td>
          <td class="num">${fmt(offPts(row,'pts_officiel_p2'))}</td>
          <td class="num">${fmt(prev)}</td>
          <td class="num pts">${fmtPts(curr)}</td>
          <td class="num">${formeHtml}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
    }
    buildTable();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SOUS-ONGLET 3 : ÉQUIPES
  // ══════════════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  // SOUS-ONGLET : PROGRÈS (Mensuel − Officiel P1)
  // ══════════════════════════════════════════════════════════════════════════
  function buildProgres(container, evolution, classement) {
    const sortState = { col: 'progres', asc: false };

    function offP1(row) {
      if (row.pts_officiel_p1 != null) return row.pts_officiel_p1;
      const ep = evolution.find(p => p.licence === row.licence);
      if (ep) for (const v of ep.values) if (v != null) return v;
      return null;
    }

    function getProgres(row) {
      const p1 = offP1(row);
      const men = row.pts_mensuel;
      if (p1 == null || men == null) return null;
      return Math.round((men - p1) * 100) / 100;
    }

    function fmtPts(v) {
      if (v == null) return '—';
      return Number.isInteger(v) ? v : v.toFixed(2);
    }

    function fmtDiff(v) {
      if (v == null) return '<span style="color:#6e7681">—</span>';
      const col = v > 0 ? '#4ade80' : v < 0 ? '#f87171' : '#9aa4b2';
      const sign = v > 0 ? '+' : '';
      const arrow = v > 0 ? '▲' : v < 0 ? '▼' : '▶';
      const abs = Math.abs(v);
      const str = Number.isInteger(abs) ? abs : abs.toFixed(2);
      return `<span style="background:${col}22;color:${col};border:1px solid ${col}55;border-radius:8px;padding:3px 10px;font-weight:700;font-size:13px;white-space:nowrap">${arrow} ${sign}${v < 0 ? '-' : ''}${str}</span>`;
    }

    const tableWrap = document.createElement('div');
    tableWrap.className = 'table-wrap';
    container.appendChild(tableWrap);

    const info = document.createElement('div');
    info.className = 'info';
    info.textContent = 'Progrès = Mensuel − Officiel P1. Progression depuis le début de la saison.';
    container.appendChild(info);


    function arrow(col) {
      if (sortState.col !== col) return '';
      return sortState.asc ? ' ▲' : ' ▼';
    }

    function buildTable() {
      tableWrap.innerHTML = '';

      const rows = [...classement]
        .map(r => ({ ...r, _progres: getProgres(r) }))
        .sort((a, b) => {
          const col = sortState.col;
          let va = col === 'progres' ? (a._progres ?? -Infinity)
                 : col === 'pts_officiel_p1' ? (offP1(a) ?? -Infinity)
                 : col === 'pts_mensuel' ? (a.pts_mensuel ?? -Infinity)
                 : (a.name ?? '').localeCompare(b.name ?? '');
          let vb = col === 'progres' ? (b._progres ?? -Infinity)
                 : col === 'pts_officiel_p1' ? (offP1(b) ?? -Infinity)
                 : col === 'pts_mensuel' ? (b.pts_mensuel ?? -Infinity)
                 : (b.name ?? '').localeCompare(a.name ?? '');
          if (typeof va === 'string') return 0;
          return sortState.asc ? va - vb : vb - va;
        });

      const table = document.createElement('table');
      table.innerHTML = `
        <thead><tr>
          <th data-sort="name" style="text-align:left;cursor:pointer">Joueur${arrow('name')}</th>
          <th class="num" data-sort="pts_officiel_p1" style="cursor:pointer">Officiel P1${arrow('pts_officiel_p1')}</th>
          <th class="num" data-sort="pts_mensuel" style="cursor:pointer">Mensuel${arrow('pts_mensuel')}</th>
          <th class="num" data-sort="progres" style="cursor:pointer">Progrès${arrow('progres')}</th>
        </tr></thead>`;

      table.querySelector('thead').addEventListener('click', e => {
        const th = e.target.closest('th[data-sort]');
        if (!th) return;
        const col = th.dataset.sort;
        if (sortState.col === col) sortState.asc = !sortState.asc;
        else { sortState.col = col; sortState.asc = col === 'name'; }
        buildTable();
      });

      const tbody = document.createElement('tbody');
      rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:700">${row.name || '—'}</td>
          <td class="num"><span class="pts">${fmtPts(offP1(row))}</span></td>
          <td class="num"><span class="pts">${fmtPts(row.pts_mensuel)}</span></td>
          <td class="num" style="text-align:right;padding-right:10px">${fmtDiff(row._progres)}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
    }

    buildTable();
  }

  function buildEquipes(container, equipes) {
    if (!equipes.length) {
      container.innerHTML = '<div class="info">Aucune donnée équipe disponible.</div>'; return;
    }

    // Filtre phase
    let eqPhaseFilter = 'all';
    const phCtrl = document.createElement('div');
    phCtrl.className = 'filters'; phCtrl.style.marginBottom = '10px';
    const phLbl = document.createElement('span'); phLbl.className = 'filter-label'; phLbl.textContent = 'Phase :';
    phCtrl.appendChild(phLbl);
    const phPills = document.createElement('div'); phPills.className = 'pills';
    [['all','Toutes'],['p1','Phase 1'],['p2','Phase 2']].forEach(([val, lbl]) => {
      const p = document.createElement('button');
      p.className = 'pill' + (val === 'all' ? ' active' : '');
      p.type = 'button'; p.textContent = lbl;
      p.addEventListener('click', () => {
        eqPhaseFilter = val;
        phPills.querySelectorAll('.pill').forEach(b => b.classList.toggle('active', b === p));
        buildTable();
      });
      phPills.appendChild(p);
    });
    phCtrl.appendChild(phPills);
    container.appendChild(phCtrl);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'table-wrap';
    container.appendChild(tableWrap);

    // Panneau de détail (sous le tableau, affiché au clic)
    const detailPanel = document.createElement('div');
    detailPanel.style.cssText = 'margin-top:10px;';
    container.appendChild(detailPanel);

    let openEquipe = null;

    function showDetail(row) {
      if (openEquipe === row.equipe) { openEquipe = null; detailPanel.innerHTML = ''; return; }
      openEquipe = row.equipe;
      detailPanel.innerHTML = '';

      const box = document.createElement('div');
      box.style.cssText = 'border:1px solid #263043;border-radius:13px;padding:12px;background:rgba(255,255,255,0.02);';

      const title = document.createElement('div');
      title.style.cssText = 'font-weight:800;font-size:13px;margin-bottom:10px;color:#e6e9ef;';
      title.textContent = row.equipe + ' — Détail des rencontres';
      box.appendChild(title);

      const rencs = (row.rencontres || []).filter(r => {
        if (eqPhaseFilter === 'all') return true;
        if (eqPhaseFilter === 'p1')  return r.phase === 1;
        if (eqPhaseFilter === 'p2')  return r.phase === 2;
        return true;
      });

      rencs.forEach(r => {
        // En-tête de la rencontre
        const renHeader = document.createElement('div');
        renHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:10px 0 4px;';
        const resIcon = r.result === 'V' ? '<span class="match-V">✓ V</span>'
                      : r.result === 'D' ? '<span class="match-D">✗ D</span>'
                      : '<span style="color:#fbbf24;font-weight:800">= N</span>';
        renHeader.innerHTML = `
          <span style="font-size:13px;font-weight:800;color:#e6e9ef">${r.adversaire}</span>
          <span style="display:flex;align-items:center;gap:10px">
            <span style="font-size:12px;color:#9aa4b2">${r.segment}</span>
            <span style="font-size:12px;color:#9aa4b2">${r.score} matchs</span>
            ${resIcon}
          </span>`;
        box.appendChild(renHeader);

        // Matchs individuels
        if (r.matchs && r.matchs.length) {
          const matchList = document.createElement('div');
          matchList.style.cssText = 'border:1px solid #263043;border-radius:10px;overflow:hidden;margin-bottom:4px;';

          r.matchs.forEach((m, idx) => {
            const line = document.createElement('div');
            const bg = m.V
              ? 'rgba(74,222,128,0.06)'
              : 'rgba(248,113,113,0.06)';
            line.style.cssText = `display:grid;grid-template-columns:1fr auto auto;align-items:center;padding:6px 10px;gap:10px;background:${bg};font-size:12px;`;
            const typeTag = m.type === 'double'
              ? '<span style="font-size:10px;color:#c084fc;font-weight:700;background:rgba(192,132,252,0.12);padding:1px 5px;border-radius:4px">DBL</span>'
              : '';
            const vd = m.V
              ? '<span style="color:#4ade80;font-weight:700">V</span>'
              : '<span style="color:#f87171;font-weight:700">D</span>';
            const setsHtml = (m.sets && m.sets.length)
              ? `<span style="font-size:11px;color:#9aa4b2;margin-left:6px">${m.sets.map(s => {
                  const p = s.split('-');
                  const won = p.length === 2 && parseInt(p[0]) > parseInt(p[1]);
                  return `<span style="color:${won ? '#4ade80' : '#f87171'}">${s}</span>`;
                }).join('<span style="color:#4a5568"> · </span>')}</span>`
              : '';
            line.innerHTML = `
              <span style="color:#e6e9ef">${m.ja} <span style="color:#9aa4b2">vs</span> ${m.jb} ${typeTag}</span>
              <span style="font-variant-numeric:tabular-nums">${m.score}${setsHtml}</span>
              ${vd}`;
            matchList.appendChild(line);
          });
          box.appendChild(matchList);
        }
      });

      if (!rencs.length) {
        box.innerHTML += '<div style="color:#9aa4b2;font-size:13px;padding:8px 0">Aucune rencontre pour ce filtre.</div>';
      }
      detailPanel.appendChild(box);
    }

    function buildTable() {
      tableWrap.innerHTML = '';
      // Filtrer par phase
      const filtered = equipes.filter(r => {
        if (eqPhaseFilter === 'all') return true;
        if (eqPhaseFilter === 'p1')  return r.phase === 1 || r.phase == null;
        if (eqPhaseFilter === 'p2')  return r.phase === 2;
        return true;
      });

      const rows = [...filtered].sort((a, b) => {
        if (sortColEq === 'equipe') return sortAscEq ? a.equipe.localeCompare(b.equipe) : b.equipe.localeCompare(a.equipe);
        // Tri par défaut : V desc, puis N desc, puis D asc
        if (sortColEq === 'V' && !sortAscEq) {
          if (b.V !== a.V) return b.V - a.V;
          if ((b.N||0) !== (a.N||0)) return (b.N||0) - (a.N||0);
          return a.D - b.D;
        }
        const va = a[sortColEq] ?? -Infinity, vb = b[sortColEq] ?? -Infinity;
        return sortAscEq ? va - vb : vb - va;
      });

      const table = document.createElement('table');
      const arrow = col => col === sortColEq ? (sortAscEq ? ' ▲' : ' ▼') : '';
      const phBadge = ph => ph === 1 ? '<span style="font-size:10px;color:#7dd3fc;font-weight:700;margin-left:4px">P1</span>'
                          : ph === 2 ? '<span style="font-size:10px;color:#c084fc;font-weight:700;margin-left:4px">P2</span>' : '';
      table.innerHTML = `<thead><tr>
        <th data-sort="equipe">Équipe${arrow('equipe')}</th>
        <th class="num" data-sort="V" style="color:#4ade80">V${arrow('V')}</th>
        <th class="num" data-sort="N" style="color:#fbbf24">N${arrow('N')}</th>
        <th class="num" data-sort="D" style="color:#f87171">D${arrow('D')}</th>
        <th>Division</th>
      </tr></thead>`;
      table.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.dataset.sort;
          if (sortColEq === col) sortAscEq = !sortAscEq; else { sortColEq = col; sortAscEq = col === 'equipe'; }
          buildTable();
        });
      });

      const tbody = document.createElement('tbody');
      rows.forEach(row => {
        const tr = document.createElement('tr');
        const isOpen = openEquipe === row.equipe;
        tr.style.cursor = 'pointer';
        if (isOpen) tr.style.background = 'rgba(125,211,252,0.06)';
        tr.innerHTML = `
          <td><strong>${row.equipe}</strong>${phBadge(row.phase)}</td>
          <td class="num match-V">${row.V}</td>
          <td class="num" style="color:#fbbf24">${row.N ?? 0}</td>
          <td class="num match-D">${row.D}</td>
          <td class="div-label" style="font-size:11px;color:#9aa4b2;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${row.division}</td>`;
        tr.addEventListener('click', () => { showDetail(row); buildTable(); });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
    }
    buildTable();

    const infoEq = document.createElement('div');
    infoEq.className = 'info';
    infoEq.textContent = 'Cliquez sur une équipe pour afficher le détail de ses rencontres.';
    container.appendChild(infoEq);
  }

  // ── Lancement ─────────────────────────────────────────────────────────────
  loadClub().then(buildUI).catch(e => {
    wrap.innerHTML = `<div class="error">Erreur chargement : ${e && e.message ? e.message : e}</div>`;
  });

  // Permet au sélecteur de club de recharger l'Équipe quand l'utilisateur switche
  window._equipeReload = function() {
    // Reset état UI pour éviter de garder les sélections du club précédent
    checkedLics = new Set();
    searchText = '';
    loadClub().then(buildUI).catch(e => {
      wrap.innerHTML = `<div class="error">Erreur chargement : ${e && e.message ? e.message : e}</div>`;
    });
  };
})();
