function node(title,copy,tag=''){
 return `<div class="dtc-node">${tag?`<span>${tag}</span>`:''}<b>${title}</b><small>${copy}</small></div>`;
}

function overviewBlock(){
 return `<section class="dtc-platform-model">
  <div class="dtc-kicker">AI FOOTBALL PLATFORM OPERATING MODEL</div>
  <div class="dtc-title-row"><div><h3>Digital Twin is the shared intelligence core</h3><p>Capture and AI perception create the twin. Every analysis, simulation and role-specific decision reads from the same persistent football state.</p></div><span class="dtc-core-badge">ONE TWIN STATE</span></div>
  <div class="dtc-flow">
   ${node('CAPTURE','1–3 phones, professional cameras, wearables and SSOT','REALITY')}
   <div class="dtc-arrow">→</div>
   ${node('PERCEPTION','Panorama, calibration, YOLO, tracking and Re-ID','SEE')}
   <div class="dtc-arrow">→</div>
   ${node('DIGITAL TWIN CORE','Player · Ball · Team · Match state','UNDERSTAND')}
   <div class="dtc-arrow">→</div>
   ${node('INTELLIGENCE','Analytics, prediction and what-if simulation','REASON')}
   <div class="dtc-arrow">→</div>
   ${node('ACTION','AI Coach and permissioned role decisions','ACT')}
  </div>
  <div class="dtc-principles">
   <div><b>One identity</b><small>The same Player ID follows video, 2D/3D views, metrics and history.</small></div>
   <div><b>One coordinate system</b><small>Camera pixels become pitch coordinates so every module speaks the same spatial language.</small></div>
   <div><b>One timeline</b><small>Player, ball and team states evolve continuously across frames, sessions and matches.</small></div>
   <div><b>Many experiences</b><small>Coach, player, scout, club and guardian views are projections of the same trusted twin.</small></div>
  </div>
 </section>`;
}

function twinCoreBlock(){
 return `<section class="dtc-twin-core">
  <div class="dtc-kicker">PLATFORM CORE · NOT A VISUAL EFFECT</div>
  <div class="dtc-title-row"><div><h3>Football Digital Twin Core</h3><p>The Twin Core is the canonical live model of football reality. 2D pitch, 3D hologram, dashboards and AI Coach are renderers or consumers of this state.</p></div><span class="dtc-live">STATE ENGINE</span></div>
  <div class="dtc-twin-grid">
   <div class="dtc-twin-card"><span>01</span><b>Player Twin</b><small>Identity, x/y position, velocity, trajectory, skills, workload and longitudinal development.</small></div>
   <div class="dtc-twin-card"><span>02</span><b>Ball Twin</b><small>Position, velocity, possession state, trajectory, pass/shot events and confidence.</small></div>
   <div class="dtc-twin-card"><span>03</span><b>Team Twin</b><small>Formation, spacing, lines, width, length, pressing, compactness and passing structure.</small></div>
   <div class="dtc-twin-card"><span>04</span><b>Match Twin</b><small>Unified timeline joining both teams, ball, pitch zones, events and tactical state.</small></div>
  </div>
  <div class="dtc-state-line"><b>TWIN STATE BUS</b><span>Panorama ↔ 2D Pitch ↔ 3D Twin ↔ Analytics ↔ Simulation ↔ AI Coach</span></div>
  <div class="dtc-maturity">
   <div class="active"><b>1 · Observe</b><small>Detect and track reality.</small></div>
   <div class="active"><b>2 · Represent</b><small>Create persistent twin state.</small></div>
   <div><b>3 · Analyze</b><small>Movement and tactical intelligence.</small></div>
   <div><b>4 · Predict</b><small>Forecast outcomes and risks.</small></div>
   <div><b>5 · Simulate</b><small>Test what-if changes.</small></div>
   <div><b>6 · Act</b><small>Recommend the next action.</small></div>
  </div>
 </section>`;
}

function architectureBlock(){
 return `<section class="dtc-architecture-map">
  <div class="dtc-kicker">REFERENCE ARCHITECTURE</div>
  <h3>Perception feeds the Twin Core; intelligence sits above it</h3>
  <div class="dtc-arch-stack">
   <div><span>L7</span><b>Role Experiences</b><small>Player · Coach · Guardian · Club · Scout · Trader · Federation</small></div>
   <div><span>L6</span><b>Decision & AI Coach</b><small>Recommendations · next actions · permissioned workflows</small></div>
   <div><span>L5</span><b>Prediction & Simulation</b><small>What-if tactics · development · workload · opportunity scenarios</small></div>
   <div><span>L4</span><b>Football Intelligence</b><small>Movement · heatmaps · formation · possession · pressing · passing network</small></div>
   <div class="core"><span>L3</span><b>DIGITAL TWIN CORE</b><small>Player Twin · Ball Twin · Team Twin · Match Twin · shared state bus</small></div>
   <div><span>L2</span><b>AI Perception</b><small>Sync · panorama · calibration · YOLO · tracking · Re-ID · event extraction</small></div>
   <div><span>L1</span><b>Physical Football & Capture</b><small>Players · ball · pitch · 1–3 phones · cameras · wearables · metadata</small></div>
  </div>
 </section>`;
}

export function initDigitalTwinCore(){
 const overview=document.getElementById('overview');
 if(overview && !overview.querySelector('.dtc-platform-model')) overview.insertAdjacentHTML('afterbegin',overviewBlock());
 const twin=document.getElementById('twin');
 if(twin && !twin.querySelector('.dtc-twin-core')) twin.insertAdjacentHTML('afterbegin',twinCoreBlock());
 const architecture=document.getElementById('architecture');
 if(architecture && !architecture.querySelector('.dtc-architecture-map')) architecture.insertAdjacentHTML('afterbegin',architectureBlock());
 const twinNav=document.querySelector('.nav button[data-view="twin"]');
 if(twinNav) twinNav.innerHTML='⚽ Twin Core';
 const twinRegistry=twin?.querySelector('.registry');
 if(twinRegistry){
  const items=[...twinRegistry.querySelectorAll('.item')];
  for(const item of items){
   const title=item.querySelector('b')?.textContent||'';
   if(['Coach Twin','Opportunity Twin','Index Twin'].includes(title)) item.classList.add('dtc-extended-twin');
  }
 }
 const title=document.getElementById('title'),sub=document.getElementById('sub');
 if(twinNav){
  twinNav.addEventListener('click',()=>{setTimeout(()=>{if(title)title.textContent='Twin Core';if(sub)sub.textContent='The canonical Player, Ball, Team and Match state powering every AI Football Platform experience.'},0)});
 }
}
