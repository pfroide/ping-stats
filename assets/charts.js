\
// Offline charts v5 (no external libs)
let DATA = null;

const state = { selected: [], scope: "tous", phase: "all", mode: "segments", metric: "pointres_total", showClub: false, compare: "" };

const METRICS_SEG = [
  ["pointres_total","Pointres total"],
  ["pointres_mean","Pointres moy"],
  ["win_rate","Tx victoire"],
  ["wins","Victoires"],
  ["losses","Défaites"],
  ["overperf","Surperf"],
  ["opp_pts_mean","Difficulté moy"],
  ["diff_sets","Diff sets"],
];

const METRICS_TL = [
  ["pointres","Pointres"],
  ["pointres_cum","Pointres cumulés"],
  ["points_est","Points estimés"],
  ["overperf_cum","Surperf cumulée"],
];

function $(id){ return document.getElementById(id); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c])); }
function clamp(x,a,b){ return Math.max(a, Math.min(b,x)); }

async function loadData(){
  const r = await fetch("./site_data.json", { cache: "no-store" });
  DATA = await r.json();
}

function playerList(){
  return Object.entries(DATA.players).map(([lic,p])=>({lic, name:p.name})).sort((a,b)=>a.name.localeCompare(b.name));
}

function addPill(lic){
  // En mode radar on force un seul joueur "A"
  if (state.mode==="radar"){
    state.selected = [lic];
    if (state.compare===lic) state.compare="";
    render();
    return;
  }
  if (state.selected.includes(lic)) return;
  state.selected.push(lic);
  if (state.selected.length>5) state.selected.shift();
  render();
}
function removePill(lic){ state.selected = state.selected.filter(x=>x!==lic); render(); }

function renderPills(){
  const el = $("gPills"); el.innerHTML="";
  for (const lic of state.selected){
    const p=DATA.players[lic];
    const d=document.createElement("div");
    d.className="pill";
    d.innerHTML=`<span>${escapeHtml(p?.name||lic)}</span><button title="Retirer">✕</button>`;
    d.querySelector("button").addEventListener("click", ()=>removePill(lic));
    el.appendChild(d);
  }
}


function renderCompareOptions(){
  const sel = $("gCompare");
  if (!sel) return;

  // activé uniquement en radar
  const isRadar = (state.mode==="radar");
  sel.disabled = !isRadar;

  // garder l'option de base
  const a = state.selected[0] || "";
  const keep = state.compare || "";
  sel.innerHTML = '<option value="">Comparer: aucun</option>';

  if (!DATA || !DATA.players) return;
  const pl = playerList().filter(p => p.lic !== a);

  for (const p of pl){
    const opt = document.createElement("option");
    opt.value = p.lic;
    opt.textContent = p.name;
    sel.appendChild(opt);
  }

  // restaurer si encore valide
  if (keep && pl.some(p=>p.lic===keep)){
    sel.value = keep;
    state.compare = keep;
    // si B actif, on désactive le club (2 séries max)
    if (isRadar){
      $("gClub").checked = false;
      $("gClub").disabled = true;
      state.showClub = false;
    }
  } else {
    sel.value = "";
    state.compare = "";
    $("gClub").disabled = false;
  }
}

function renderMetricBar(){
  const bar=$("gMetricBar"); bar.innerHTML="";
  const list = (state.mode==="timeline") ? METRICS_TL : METRICS_SEG;
  for (const [key,label] of list){
    const b=document.createElement("button");
    b.className="btn"+(state.metric===key?" active":"");
    b.textContent=label;
    b.addEventListener("click", ()=>{ state.metric=key; renderMetricBar(); draw(); });
    bar.appendChild(b);
  }
  bar.style.display = (["expected","heatmap","radar"].includes(state.mode)) ? "none":"flex";
}

function filteredSegmentsForPlayer(lic){
  const segs = DATA.players[lic]?.segments?.[state.scope] || {};
  const out=[];
  for (const [k,v] of Object.entries(segs)){
    if (state.phase!=="all" && String(v.phase)!==String(state.phase)) continue;
    out.push([k,v]);
  }
  out.sort((a,b)=> (a[1].phase-b[1].phase) || (a[1].segment_id-b[1].segment_id));
  return out;
}

function filteredTimelineForPlayer(lic){
  const arr = DATA.players[lic]?.timeline?.[state.scope] || [];
  return arr.filter(x=> (state.phase==="all" || String(x.phase)===String(state.phase)));
}

function colorFor(i){
  const base=["#4e79a7","#f28e2b","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1"];
  return base[i%base.length];
}

function drawEmpty(ctx,W,H,msg){
  ctx.save();
  ctx.fillStyle="#999"; ctx.font="14px system-ui, sans-serif"; ctx.textAlign="center";
  ctx.fillText(msg, W/2, H/2);
  ctx.restore();
}

function axes(ctx,W,H,labels,ymin,ymax){
  const padL=44, padR=10, padT=12, padB=34;
  const x0=padL, x1=W-padR, y0=padT, y1=H-padB;

  ctx.save();
  ctx.strokeStyle="rgba(128,128,128,0.25)"; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
    const y=y1-(y1-y0)*i/4;
    ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke();
  }
  ctx.fillStyle="rgba(200,200,200,0.9)"; ctx.font="12px system-ui, sans-serif";
  ctx.textAlign="right";
  for(let i=0;i<=4;i++){
    const val=ymin+(ymax-ymin)*i/4;
    const y=y1-(y1-y0)*i/4;
    ctx.fillText(val.toFixed(Math.abs(ymax-ymin)<10?2:0), x0-6, y+4);
  }
  ctx.textAlign="center";
  const n=labels.length;
  for(let i=0;i<n;i++){
    const x=x0+(x1-x0)*(n===1?0.5:i/(n-1));
    ctx.fillText(labels[i], x, H-12);
  }
  ctx.restore();
  return {x0,x1,y0,y1};
}

function segmentLabels(segPairs){ return segPairs.map(([k,v])=>`${v.phase}.${v.segment_id}`); }

function drawSegments(ctx,W,H){
  const first = filteredSegmentsForPlayer(state.selected[0]);
  const labels = segmentLabels(first);
  const series=[];
  for(let i=0;i<state.selected.length;i++){
    const lic=state.selected[i];
    const segs = filteredSegmentsForPlayer(lic);
    const map = new Map(segs.map(([k,v])=>[k,v]));
    const vals = first.map(([k,_]) => Number((map.get(k)||{})[state.metric] ?? 0));
    series.push({label: DATA.players[lic].name, vals, color: colorFor(i)});
  }
  if (state.showClub){
    const club = DATA.club?.segments?.[state.scope] || {};
    const vals = first.map(([k,_]) => Number((club[k]||{})[state.metric] ?? 0));
    series.push({label:"Club", vals, color:"#bbb"});
  }
  const all=series.flatMap(s=>s.vals);
  const ymin=Math.min(0,...all), ymax=Math.max(1,...all);
  const {x0,x1,y0,y1}=axes(ctx,W,H,labels,ymin,ymax);
  const n=labels.length;
  const isBar=["wins","losses","matches"].includes(state.metric);
  if (isBar){
    const groupW=(x1-x0)/Math.max(1,n)*0.7;
    const bw=groupW/series.length;
    for(let j=0;j<n;j++){
      for(let i=0;i<series.length;i++){
        const s=series[i]; const val=s.vals[j];
        const x=x0+(x1-x0)*(n===1?0.5:j/(n-1)) - groupW/2 + i*bw;
        const y=y1-(y1-y0)*((val-ymin)/(ymax-ymin));
        ctx.fillStyle=s.color;
        ctx.fillRect(x,y,bw*0.9,y1-y);
      }
    }
  } else {
    for(const s of series){
      ctx.strokeStyle=s.color; ctx.lineWidth=2;
      ctx.beginPath();
      for(let j=0;j<n;j++){
        const val=s.vals[j];
        const x=x0+(x1-x0)*(n===1?0.5:j/(n-1));
        const y=y1-(y1-y0)*((val-ymin)/(ymax-ymin));
        if(j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  }
  $("gLegend").innerHTML = series.map(s=>`<span style="display:inline-block;margin-right:10px;"><span style="display:inline-block;width:10px;height:10px;background:${s.color};border-radius:2px;margin-right:6px;"></span>${escapeHtml(s.label)}</span>`).join("");
}

function drawTimeline(ctx,W,H){
  const series=[]; let maxN=0; const byLic={};
  for(const lic of state.selected){
    const arr=filteredTimelineForPlayer(lic);
    byLic[lic]=arr; maxN=Math.max(maxN, arr.length);
  }
  if (maxN===0){ drawEmpty(ctx,W,H,"Aucun match"); return; }
  const labels=Array.from({length:maxN},(_,i)=>String(i+1));
  for(let i=0;i<state.selected.length;i++){
    const lic=state.selected[i]; const arr=byLic[lic];
    const vals=labels.map((_,j)=> arr[j] ? Number(arr[j][state.metric] ?? 0) : null);
    series.push({label: DATA.players[lic].name, vals, color: colorFor(i), arr});
  }
  const all=series.flatMap(s=>s.vals.filter(v=>v!=null));
  const ymin=Math.min(0,...all), ymax=Math.max(1,...all);
  axes(ctx,W,H,labels.slice(0,Math.min(12,labels.length)),ymin,ymax);
  const padL=44,padR=10,padT=12,padB=34; const x0=padL,x1=W-padR,y0=padT,y1=H-padB;
  for(const s of series){
    ctx.strokeStyle=s.color; ctx.lineWidth=2; ctx.beginPath();
    for(let j=0;j<maxN;j++){
      const val=s.vals[j]; if(val==null) continue;
      const x=x0+(x1-x0)*(maxN===1?0.5:j/(maxN-1));
      const y=y1-(y1-y0)*((val-ymin)/(ymax-ymin));
      if(j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  $("gLegend").innerHTML = series.map(s=>`<span style="display:inline-block;margin-right:10px;"><span style="display:inline-block;width:10px;height:10px;background:${s.color};border-radius:2px;margin-right:6px;"></span>${escapeHtml(s.label)}</span>`).join("");
}

function drawExpected(ctx,W,H){
  const series=[]; let maxN=0;
  for(const lic of state.selected){
    const arr=filteredTimelineForPlayer(lic);
    maxN=Math.max(maxN, arr.length);
    series.push({label: DATA.players[lic].name, vals: arr.map(x=>Number(x.overperf_cum??0)), color: colorFor(series.length)});
  }
  if (maxN===0){ drawEmpty(ctx,W,H,"Aucun match"); return; }
  const labels=Array.from({length:maxN},(_,i)=>String(i+1));
  const all=series.flatMap(s=>s.vals);
  const ymin=Math.min(0,...all), ymax=Math.max(1,...all);
  axes(ctx,W,H,labels.slice(0,Math.min(12,labels.length)),ymin,ymax);
  const padL=44,padR=10,padT=12,padB=34; const x0=padL,x1=W-padR,y0=padT,y1=H-padB;
  const yZ=y1-(y1-y0)*((0-ymin)/(ymax-ymin));
  ctx.strokeStyle="rgba(240,240,240,0.35)";
  ctx.beginPath(); ctx.moveTo(x0,yZ); ctx.lineTo(x1,yZ); ctx.stroke();
  for(const s of series){
    ctx.strokeStyle=s.color; ctx.lineWidth=2; ctx.beginPath();
    for(let j=0;j<s.vals.length;j++){
      const x=x0+(x1-x0)*(maxN===1?0.5:j/(maxN-1));
      const y=y1-(y1-y0)*((s.vals[j]-ymin)/(ymax-ymin));
      if(j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  $("gLegend").textContent="Surperformance cumulée = victoires réelles − victoires attendues (logistic sur diff points).";
}

function drawHeatmap(ctx,W,H){
  const scores=DATA.meta.top_scores||[];
  if (!scores.length){ drawEmpty(ctx,W,H,"Pas de données sets"); return; }
  const rows=state.selected.map(lic=>({name:DATA.players[lic].name,map:DATA.players[lic].heatmap||{}}));
  const padL=120,padT=22,padR=10,padB=24;
  const x0=padL,x1=W-padR,y0=padT,y1=H-padB;
  const cw=(x1-x0)/scores.length, rh=(y1-y0)/rows.length;
  let max=1;
  for(const r of rows){ for(const sc of scores){ max=Math.max(max, Number(r.map[sc]||0)); } }
  ctx.fillStyle="rgba(200,200,200,0.9)"; ctx.font="12px system-ui, sans-serif";
  ctx.textAlign="right";
  for(let i=0;i<rows.length;i++){ ctx.fillText(rows[i].name, padL-8, y0+rh*(i+0.6)); }
  ctx.textAlign="center";
  for(let j=0;j<scores.length;j++){
    const xx=x0+cw*(j+0.5);
    ctx.save(); ctx.translate(xx,y1+8); ctx.rotate(-Math.PI/4); ctx.fillText(scores[j],0,0); ctx.restore();
  }
  for(let i=0;i<rows.length;i++){
    for(let j=0;j<scores.length;j++){
      const v=Number(rows[i].map[scores[j]]||0);
      const t=v/max;
      ctx.fillStyle=`rgba(78,121,167,${0.1+0.8*t})`;
      ctx.fillRect(x0+cw*j,y0+rh*i,cw-1,rh-1);
    }
  }
  $("gLegend").textContent="Heatmap: fréquence des scores de sets (top 20).";
}

function drawRadar(ctx,W,H){
  const axes=DATA.meta.radar_axes||[];
  if (!axes.length){ drawEmpty(ctx,W,H,"Radar indisponible"); return; }
  const cx=W/2, cy=H/2, R=Math.min(W,H)/2-28;
  ctx.strokeStyle="rgba(180,180,180,0.25)";
  for(let k=1;k<=4;k++){
    const r=R*k/4;
    ctx.beginPath();
    for(let i=0;i<axes.length;i++){
      const ang=-Math.PI/2+2*Math.PI*i/axes.length;
      const x=cx+r*Math.cos(ang), y=cy+r*Math.sin(ang);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.stroke();
  }
  ctx.fillStyle="rgba(220,220,220,0.9)"; ctx.font="12px system-ui, sans-serif";
  for(let i=0;i<axes.length;i++){
    const ang=-Math.PI/2+2*Math.PI*i/axes.length;
    const x=cx+(R+10)*Math.cos(ang), y=cy+(R+10)*Math.sin(ang);
    ctx.textAlign=(Math.cos(ang)>0.2)?"left":(Math.cos(ang)<-0.2?"right":"center");
    ctx.fillText(axes[i].label,x,y);
  }
  // Séries radar: A + (B ou Club). Limite volontaire à 2 pour rester lisible sur mobile.
  const series = [];
  const licA = state.selected[0];
  if (licA && DATA.players[licA]?.radar?.norm){
    series.push({ lic: licA, label: DATA.players[licA].name, norm: DATA.players[licA].radar.norm, color: colorFor(0) });
  }

  let useClub = false;
  if (state.mode==="radar"){
    if (state.compare){
      const licB = state.compare;
      if (DATA.players[licB]?.radar?.norm){
        series.push({ lic: licB, label: DATA.players[licB].name, norm: DATA.players[licB].radar.norm, color: colorFor(1) });
      }
    } else if (state.showClub && DATA.club?.radar?.norm){
      useClub = true;
      series.push({ lic: "__club__", label: "Club", norm: DATA.club.radar.norm, color: "rgba(200,200,200,0.95)" });
    }
  }

  for (let si=0; si<series.length; si++){
    const s = series[si];
    const rad = s.norm || {};
    // couleur
    ctx.fillStyle = (s.lic==="__club__") ? "rgba(200,200,200,0.18)" : (s.color+"33");
    ctx.strokeStyle = (s.lic==="__club__") ? "rgba(200,200,200,0.95)" : s.color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for(let i=0;i<axes.length;i++){
      const key=axes[i].key;
      const t=clamp(Number(rad[key]??0.5),0,1);
      const ang=-Math.PI/2+2*Math.PI*i/axes.length;
      const x=cx+(R*t)*Math.cos(ang), y=cy+(R*t)*Math.sin(ang);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
$("gLegend").innerHTML = series.map((s,i)=>`<span style="display:inline-block;margin-right:10px;"><span style="display:inline-block;width:10px;height:10px;background:${(s.lic==="__club__")?"rgba(200,200,200,0.95)":colorFor(i)};border-radius:2px;margin-right:6px;"></span>${escapeHtml(s.label)}</span>`).join("");
}

function draw(){
  const canvas=$("gCanvas");
  const ctx=canvas.getContext("2d");
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);

  if (!DATA || state.selected.length===0){ drawEmpty(ctx,W,H,"Sélectionne 1 à 5 joueurs"); $("gLegend").textContent=""; return; }

  if (state.mode==="segments") return drawSegments(ctx,W,H);
  if (state.mode==="timeline") return drawTimeline(ctx,W,H);
  if (state.mode==="expected") return drawExpected(ctx,W,H);
  if (state.mode==="heatmap") return drawHeatmap(ctx,W,H);
  if (state.mode==="radar") return drawRadar(ctx,W,H);
}

function bindUI(){
  $("gMode").addEventListener("change", e=>{
    state.mode=e.target.value;

    // Radar: 1 joueur A + option comparaison
    if (state.mode==="radar"){
      if (state.selected.length>1) state.selected=[state.selected[0]];
      $("gClubLbl").textContent = "Club";
      $("gCompare").disabled = false;
      renderCompareOptions();
    } else {
      // hors radar: comparaison désactivée
      state.compare="";
      $("gCompare").value="";
      $("gCompare").disabled = true;
      $("gClubLbl").textContent = "Club";
    }

    renderMetricBar();
    draw();
  });

  $("gScope").addEventListener("change", e=>{ state.scope=e.target.value; draw(); });
  $("gPhase").addEventListener("change", e=>{ state.phase=e.target.value; draw(); });

  $("gClub").addEventListener("change", e=>{
    state.showClub=!!e.target.checked;
    // en radar: si comparaison joueur active, on ignore le club
    if (state.mode==="radar" && state.compare){
      state.showClub=false;
      $("gClub").checked=false;
    }
    draw();
  });

  $("gCompare").addEventListener("change", e=>{
    state.compare = (e.target.value||"");
    // si un joueur B est choisi, on désactive le club (2 séries max en radar)
    if (state.mode==="radar" && state.compare){
      state.showClub=false;
      $("gClub").checked=false;
      $("gClub").disabled=true;
    } else {
      $("gClub").disabled=false;
    }
    draw();
  });

  const search=$("gSearch");
  let timer=null;
  search.addEventListener("input", ()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>showSuggestions(search.value), 80);
  });
}


function showSuggestions(q){
  q=(q||"").trim().toLowerCase();
  const legend=$("gLegend");
  if(!q){ legend.textContent="Tape un nom puis clique une suggestion."; return; }
  const list=playerList().filter(p=>p.name.toLowerCase().includes(q)).slice(0,8);
  legend.innerHTML=list.map(p=>`<button class="btn" data-lic="${p.lic}">${escapeHtml(p.name)}</button>`).join(" ");
  legend.querySelectorAll("button").forEach(b=>b.addEventListener("click", ()=>addPill(b.dataset.lic)));
}

function render(){
  renderPills();
  renderCompareOptions();
  renderMetricBar();
  draw();
}

await loadData();
bindUI();
const pl=playerList();
state.selected=pl.slice(0,2).map(p=>p.lic);
$("gLegend").textContent="Tape un nom puis clique une suggestion.";
render();
