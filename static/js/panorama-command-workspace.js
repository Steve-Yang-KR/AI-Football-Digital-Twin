export function initPanoramaCommandWorkspace(){
 const section=document.querySelector('.p2t-section');
 const live3d=document.querySelector('.live3d-section');
 const source=document.getElementById('panoBox');
 if(!section)return;

 section.classList.add('command-workspace');
 const sourceCard=source?.closest('.card');
 if(sourceCard) sourceCard.classList.add('command-source-card');
 document.querySelector('.holo-section')?.classList.add('command-legacy-hidden');

 const head=section.querySelector('.p2t-head');
 if(head && !document.getElementById('commandStatusStrip')){
   head.insertAdjacentHTML('afterend',`<div class="command-status" id="commandStatusStrip">
     <div><i></i><span>CAMERAS</span><b id="commandCameras">0 / 3</b></div>
     <div><i></i><span>PERSON AI</span><b id="commandAI">LOADING</b></div>
     <div><i></i><span>TRACKED</span><b id="commandTracked">0</b></div>
     <div><i></i><span>DIGITAL TWIN</span><b id="commandTwin">IDLE</b></div>
   </div>`);
 }

 const twinPane=section.querySelector('.p2t-twin-pane');
 const twinTitle=twinPane?.querySelector('.p2t-pane-title');
 if(twinTitle && !document.getElementById('twinViewToggle')){
   twinTitle.insertAdjacentHTML('beforeend',`<div class="twin-view-toggle" id="twinViewToggle"><button class="active" data-twin-view="2d">2D</button><button data-twin-view="3d">3D</button></div>`);
 }

 const pitchWrap=section.querySelector('.p2t-pitch-wrap');
 if(live3d && twinPane){
   const stage=live3d.querySelector('.live3d-stage');
   const controls=live3d.querySelector('.live3d-panel');
   if(stage){stage.classList.add('command-3d-stage');stage.hidden=true;twinPane.insertBefore(stage,twinPane.querySelector('.p2t-mini-metrics'));}
   if(controls){controls.classList.add('command-3d-controls');controls.hidden=true;twinPane.appendChild(controls);}
   live3d.classList.add('command-legacy-hidden');
 }

 document.querySelectorAll('#twinViewToggle button').forEach(btn=>btn.addEventListener('click',()=>{
   const is3d=btn.dataset.twinView==='3d';
   document.querySelectorAll('#twinViewToggle button').forEach(b=>b.classList.toggle('active',b===btn));
   if(pitchWrap)pitchWrap.hidden=is3d;
   const stage=twinPane?.querySelector('.command-3d-stage');
   const controls=twinPane?.querySelector('.command-3d-controls');
   if(stage)stage.hidden=!is3d;
   if(controls)controls.hidden=!is3d;
 }));

 const bottom=section.querySelector('.p2t-bottom');
 if(bottom && !document.getElementById('commandInsights')){
   const tactical=bottom.querySelector('.p2t-tactical');
   const help=bottom.querySelector('.p2t-help');
   bottom.classList.add('command-bottom');
   bottom.insertAdjacentHTML('beforebegin',`<div class="command-insights-head" id="commandInsights"><div><b>AI INSIGHTS</b><span>Live movement and tactical summary</span></div><button class="secondary" id="commandInsightsToggle">Expand ↓</button></div>`);
   if(help)help.classList.add('command-calibration-help');
   if(tactical)tactical.classList.add('command-tactical');
   bottom.classList.add('collapsed');
   document.getElementById('commandInsightsToggle')?.addEventListener('click',e=>{
     const open=bottom.classList.toggle('expanded');bottom.classList.toggle('collapsed',!open);e.currentTarget.textContent=open?'Collapse ↑':'Expand ↓';
   });
 }
 section.querySelector('.p2t-note')?.classList.add('command-note-hidden');

 const sync=()=>{
   const cameraText=document.getElementById('p2tCameraMode')?.textContent||'';
   const camMatch=cameraText.match(/(\d+) CAMERA/);const cams=camMatch?Number(camMatch[1]):0;
   const aiText=document.getElementById('p2tTrackingState')?.textContent||'';
   const tracked=document.getElementById('p2tTracked')?.textContent||'0';
   const twin=document.getElementById('p2tStatus')?.textContent||'IDLE';
   const cc=document.getElementById('commandCameras'),ca=document.getElementById('commandAI'),ct=document.getElementById('commandTracked'),cw=document.getElementById('commandTwin');
   if(cc)cc.textContent=`${cams} / 3`;
   if(ca)ca.textContent=aiText.includes('LIVE')?'LIVE':aiText.includes('READY')?'READY':aiText.includes('FAILED')?'ERROR':'LOADING';
   if(ct)ct.textContent=tracked;
   if(cw)cw.textContent=twin.includes('LIVE')?'LIVE':'IDLE';
   document.querySelectorAll('.command-status>div').forEach((d,i)=>{const active=[cams>0,aiText.includes('READY')||aiText.includes('LIVE'),Number(tracked)>0,twin.includes('LIVE')][i];d.classList.toggle('on',active)});
 };
 new MutationObserver(sync).observe(section,{subtree:true,childList:true,characterData:true});
 window.addEventListener('panorama-twin-state',sync);
 sync();
}
