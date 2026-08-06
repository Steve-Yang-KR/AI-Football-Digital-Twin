const stakeholders={
player:{icon:'⚽',name:'Player',mission:'Improve my game with clear evidence and the next right action.',primaryTwin:'Player Twin',workspace:'Personal development',focus:['My latest sessions','Skill trend and AI Passport','Coach feedback','Weekly training plan'],decisions:['What should I train next?','Am I improving against my previous self?','Which evidence may be shared?'],access:'Own approved evidence, plans and opportunities',recommended:['overview','workflow','twin','scenario']},
coach:{icon:'🧑‍🏫',name:'Coach',mission:'Turn provisional AI observations into validated development decisions.',primaryTwin:'Coach + Player Twins',workspace:'Review and development',focus:['Player review queue','Evidence-linked video','Validation confidence','Assigned development plans'],decisions:['Accept, correct or reject AI output','Set the next training focus','Escalate workload or safety concerns'],access:'Consented squad data and validation tools',recommended:['roles','workflow','capture','twin','scenario','simulation']},
guardian:{icon:'👨‍👩‍👧',name:'Parent / Guardian',mission:'Protect the player while supporting a safe, visible development journey.',primaryTwin:'Player + Permission Twins',workspace:'Consent and safeguarding',focus:['Development summaries','Coach verification','Visibility controls','Opportunity approvals'],decisions:['Who can view the player?','Which evidence can be shared?','Should an opportunity request be approved?'],access:'Guardian-controlled youth profile and audit history',recommended:['overview','roles','twin','trust']},
club:{icon:'🏟️',name:'Club / Academy',mission:'Operate affordable capture, team development and academy intelligence.',primaryTwin:'Team + Match Twins',workspace:'Football operations',focus:['Capture sessions','Team tactical state','Player comparisons','Academy development'],decisions:['How should the team train?','Which players need intervention?','Which capture tier should be used?'],access:'Club-authorized teams, sessions and staff views',recommended:['capture','panorama','twin','simulation','architecture']},
scout:{icon:'🔎',name:'Scout / Agent',mission:'Discover consented talent through comparable, verified evidence.',primaryTwin:'Player + Opportunity Twins',workspace:'Talent discovery',focus:['Scoutability Index','Evidence quality','Comparable passports','Trial workflow'],decisions:['Who should enter the shortlist?','Is the evidence reliable?','What access should be requested next?'],access:'Time-limited, consented scouting evidence',recommended:['roles','twin','scenario','trust']},
trader:{icon:'📈',name:'Trader',mission:'Interpret validated development trends for transfer intelligence.',primaryTwin:'Index + Opportunity Twins',workspace:'Transfer intelligence',focus:['Index movement','Performance consistency','Valuation signals','Transfer-window watchlist'],decisions:['Is the trend sustainable?','What changed in the evidence?','Which opportunity requires review?'],access:'Approved aggregate trends, not unrestricted youth data',recommended:['twin','scenario','simulation','trust']},
federation:{icon:'🌐',name:'League / Federation',mission:'Connect grassroots development, standards and interoperable football services.',primaryTwin:'Program + Ecosystem Twins',workspace:'Governance and scale',focus:['Program outcomes','Data standards','Research validation','Regional participation'],decisions:['Which programs work?','Where are standards missing?','How should trusted data interoperate?'],access:'Aggregated, policy-governed ecosystem intelligence',recommended:['overview','workflow','trust','architecture']}
};

function lensMarkup(){return `<section class="stakeholder-lens compact" aria-label="Stakeholder role lens">
<div class="lens-bar">
<div class="lens-identity"><span class="lens-kicker">VIEWING AS</span><button class="lens-current" id="lensRoleToggle" aria-expanded="false"><span id="lensCurrent"></span><i>⌄</i></button><span class="lens-context" id="lensContext"></span></div>
<button class="lens-detail-toggle" id="lensDetailToggle" aria-expanded="false">Role details</button>
</div>
<div class="lens-tabs" id="lensTabs" hidden>${Object.entries(stakeholders).map(([id,r])=>`<button data-lens="${id}"><span>${r.icon}</span>${r.name}</button>`).join('')}</div>
<div class="lens-panel" id="lensPanel" hidden><div class="lens-summary"><small id="lensWorkspace"></small><h3 id="lensMission"></h3><p><b id="lensTwin"></b> is the primary decision object.</p></div><div><small>ROLE FOCUS</small><ul id="lensFocus"></ul></div><div><small>KEY DECISIONS</small><ul id="lensDecisions"></ul></div><div><small>PERMISSION BOUNDARY</small><p id="lensAccess"></p></div></div>
</section>`}

export function initRoleLens(){
 const top=document.querySelector('.top');
 if(!top)return;
 top.insertAdjacentHTML('afterend',lensMarkup());
 const lens=document.querySelector('.stakeholder-lens');
 const tabsWrap=document.getElementById('lensTabs');
 const panel=document.getElementById('lensPanel');
 const roleToggle=document.getElementById('lensRoleToggle');
 const detailToggle=document.getElementById('lensDetailToggle');
 const tabs=[...document.querySelectorAll('[data-lens]')];
 const nav=[...document.querySelectorAll('.nav button')];
 const heroText=document.querySelector('#overview .hero p');
 const originalHero=heroText?.textContent||'';
 function closeMenus(){tabsWrap.hidden=true;roleToggle.setAttribute('aria-expanded','false');}
 function apply(id){
  const r=stakeholders[id]||stakeholders.player;
  document.body.dataset.stakeholder=id;
  localStorage.setItem('footballStakeholder',id);
  tabs.forEach(b=>b.classList.toggle('active',b.dataset.lens===id));
  document.getElementById('lensCurrent').textContent=`${r.icon} ${r.name}`;
  document.getElementById('lensContext').textContent=`${r.workspace} · ${r.primaryTwin}`;
  document.getElementById('lensWorkspace').textContent=r.workspace.toUpperCase();
  document.getElementById('lensMission').textContent=r.mission;
  document.getElementById('lensTwin').textContent=r.primaryTwin;
  document.getElementById('lensFocus').innerHTML=r.focus.map(x=>`<li>${x}</li>`).join('');
  document.getElementById('lensDecisions').innerHTML=r.decisions.map(x=>`<li>${x}</li>`).join('');
  document.getElementById('lensAccess').textContent=r.access;
  nav.forEach(b=>b.classList.toggle('role-recommended',r.recommended.includes(b.dataset.view)));
  if(heroText)heroText.textContent=`${r.mission} ${originalHero}`;
  document.querySelectorAll('.role-card').forEach(card=>card.classList.toggle('selected-role',card.textContent.includes(r.name.split(' / ')[0])));
  closeMenus();
 }
 roleToggle.onclick=()=>{const opening=tabsWrap.hidden;tabsWrap.hidden=!opening;roleToggle.setAttribute('aria-expanded',String(opening));};
 detailToggle.onclick=()=>{const opening=panel.hidden;panel.hidden=!opening;detailToggle.setAttribute('aria-expanded',String(opening));detailToggle.textContent=opening?'Hide details':'Role details';lens.classList.toggle('expanded',opening);};
 tabs.forEach(b=>b.onclick=()=>apply(b.dataset.lens));
 document.addEventListener('click',e=>{if(!lens.contains(e.target))closeMenus();const card=e.target.closest('.role-card');if(!card)return;const text=card.textContent;const match=Object.entries(stakeholders).find(([,r])=>text.includes(r.name.split(' / ')[0]));if(match)apply(match[0]);});
 apply(localStorage.getItem('footballStakeholder')||'player');
}
