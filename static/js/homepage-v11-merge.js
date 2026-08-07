function insertAfter(target,html){if(target)target.insertAdjacentHTML('afterend',html)}

const drills=[['01','Dribbling','Ball mastery, changes of direction and controlled movement.'],['02','Passing','Accuracy, rhythm and repeatable technique.'],['03','Ball Control','First touch, receiving and close control.'],['04','Speed / Movement','Footwork, acceleration and movement quality.'],['05','Shooting · Power Shot','AI-supported shooting practice completes the five-drill training core.']];

export function initHomepageV11Merge(){
 const overview=document.getElementById('overview');
 if(overview&&!document.getElementById('ssotDrillsMerge')){
  const hero=overview.querySelector('.hero');
  insertAfter(hero,`<section class="v11-card" id="ssotDrillsMerge"><div class="v11-head"><div><small>SSOT TRAINING CORE</small><h3>Five essential drills complete the player development loop.</h3><p>Daily SSOT training evidence updates the Player Digital Twin and becomes reviewable input for coaches and clubs.</p></div><button class="secondary" data-jump="twin">Open Player Twin</button></div><div class="v11-drills">${drills.map((d,i)=>`<article class="${i===4?'featured':''}"><span>${d[0]}</span><b>${d[1]}</b><small>${d[2]}</small>${i===4?'<em>NEW</em>':''}</article>`).join('')}</div></section>`);
 }

 const capture=document.getElementById('capture');
 if(capture&&!document.getElementById('captureModesV11')){
  const first=capture.firstElementChild;
  first?.insertAdjacentHTML('beforebegin',`<section class="v11-card" id="captureModesV11"><div class="v11-head"><div><small>FLEXIBLE CELL-PHONE CAPTURE</small><h3>Start with 1, 2 or 3 phones—then grow into professional inputs.</h3><p>The same Capture Session model adapts to individual drills, amateur teams and professional environments.</p></div></div><div class="v11-capture-tabs"><button class="active" data-v11tier="0">1 phone</button><button data-v11tier="1">2 phones</button><button data-v11tier="2">3 phones</button><button data-v11tier="3">Professional</button></div><div class="v11-capture-detail" id="v11CaptureDetail"></div></section>`);
  const tiers=[
   ['1 phone camera','SSOT drills, individual practice and half-field work. No synchronization is required; AI can analyze one direct stream.','1 CAM · direct analysis'],
   ['2 phone cameras','Wider coverage with fewer blind areas. Two streams are synchronized and displayed as equal full-frame views in Panorama.','2 CAM · time synchronized'],
   ['3 phone cameras','LEFT · CENTER · RIGHT synchronized capture for low-cost field-wide observation. Panorama displays all three full frames equally.','3 CAM · left · center · right'],
   ['Professional inputs','Tactical cameras, broadcast feeds, wearables and EPTS enter the same Digital Twin architecture through integrations.','PRO · integrated sources']
  ];
  const detail=document.getElementById('v11CaptureDetail');
  const tabs=[...document.querySelectorAll('[data-v11tier]')];
  function render(i){tabs.forEach((b,n)=>b.classList.toggle('active',n===i));const t=tiers[i];detail.innerHTML=`<div><b>${t[0]}</b><p>${t[1]}</p></div><span>${t[2]}</span>`}
  tabs.forEach(b=>b.onclick=()=>render(+b.dataset.v11tier));render(0);
 }

 const roles=document.getElementById('roles');
 if(roles&&!document.getElementById('roleJourneyV11')){
  insertAfter(roles.querySelector('.card'),`<section class="v11-card section-gap" id="roleJourneyV11"><div class="v11-head"><div><small>ROLE-SPECIFIC EXPERIENCE</small><h3>One shared football journey. A different workspace for every stakeholder.</h3><p>Player remains mobile-first in SSOT while coaches, guardians, clubs, scouts, traders and federations receive permissioned views of the same Digital Twin evidence.</p></div></div><div class="v11-role-flow"><span>Player</span><span>Coach</span><span>Guardian</span><span>Club</span><span>Scout</span><span>Trader</span><span>Federation</span></div></section>`);
 }

 const architecture=document.getElementById('architecture');
 if(architecture&&!document.getElementById('platformMapV11')){
  architecture.insertAdjacentHTML('beforeend',`<section class="v11-card section-gap" id="platformMapV11"><div class="v11-head"><div><small>PLATFORM MAP</small><h3>SSOT is the player experience. The web platform connects the ecosystem.</h3></div></div><div class="v11-map"><div class="roles">Player · Coach · Guardian · Scout · Club · Trader · Federation</div><div class="arrow">Role-specific experiences ↓</div><div class="surfaces"><b>SSOT Mobile</b><b>Global AI Football Web Platform</b><b>Admin & Safeguarding</b></div><div class="arrow">Shared permissioned intelligence ↓</div><div class="twins"><span>Player Twin</span><span>Coach Twin</span><span>Session Twin</span><span>Match Twin</span><span>Team Twin</span><span>Opportunity Twin</span><span>Index Twin</span></div></div></section>`);
 }
}
