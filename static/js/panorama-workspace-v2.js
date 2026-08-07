export function initPanoramaWorkspaceV2(){
  const page=document.getElementById('panorama');
  const twin=document.querySelector('.p2t-section');
  if(!page||!twin||document.getElementById('panoramaV2Header')) return;

  page.classList.add('panorama-v2');

  const header=document.createElement('div');
  header.id='panoramaV2Header';
  header.className='pano-v2-header';
  header.innerHTML=`
    <div>
      <small>MATCH INTELLIGENCE</small>
      <h2>Multi-Camera Panorama → Player Tracking → Digital Twin</h2>
      <p>One workspace for observing the merged field view and understanding the same player movement on the pitch model.</p>
    </div>
    <div class="pano-v2-flow" aria-label="Panorama workflow">
      <span>1–3 Cameras</span><b>→</b><span>Panorama</span><b>→</b><span>Person AI</span><b>→</b><span>Pitch Twin</span>
    </div>`;
  page.prepend(header);

  const status=document.createElement('div');
  status.className='pano-v2-status';
  status.innerHTML=`
    <div><small>CAMERAS</small><b id="panoV2Cameras">0 / 3</b></div>
    <div><small>PERSON AI</small><b id="panoV2AI">INITIALIZING</b></div>
    <div><small>TRACKED</small><b id="panoV2Tracked">0</b></div>
    <div><small>TWIN</small><b id="panoV2Twin">IDLE</b></div>`;
  header.insertAdjacentElement('afterend',status);

  // Make the AI Panorama + Pitch Twin the primary Panorama experience.
  status.insertAdjacentElement('afterend',twin);
  twin.classList.add('pano-v2-primary');

  // The original canvas remains the live source for stitching/AI, but does not compete visually.
  const source=document.getElementById('panoBox');
  const sourceCard=source?.closest('.card');
  if(sourceCard){sourceCard.classList.add('pano-v2-source-card');}

  // Keep legacy analysis/3D modules functional but visually secondary and collapsed.
  const holo=document.querySelector('.holo-section');
  if(holo) holo.classList.add('pano-v2-secondary-module');
  const live3d=document.querySelector('.live3d-section');
  if(live3d) live3d.classList.add('pano-v2-secondary-module');

  const utility=document.createElement('details');
  utility.className='pano-v2-utilities';
  utility.innerHTML='<summary>Advanced tools · source panorama, 3D view and diagnostics</summary><div class="pano-v2-utility-slot"></div>';
  twin.insertAdjacentElement('afterend',utility);
  const slot=utility.querySelector('.pano-v2-utility-slot');
  if(sourceCard) slot.appendChild(sourceCard);
  if(holo) slot.appendChild(holo);
  if(live3d) slot.appendChild(live3d);

  const sync=()=>{
    const cameraMode=document.getElementById('p2tCameraMode')?.textContent||'';
    const m=cameraMode.match(/(\d+) CAMERA/);
    const cams=m?Number(m[1]):0;
    const ai=document.getElementById('p2tTrackingState')?.textContent||'';
    const tracked=document.getElementById('p2tTracked')?.textContent||'0';
    const twinState=document.getElementById('p2tStatus')?.textContent||'TWIN IDLE';
    const c=document.getElementById('panoV2Cameras');
    const a=document.getElementById('panoV2AI');
    const t=document.getElementById('panoV2Tracked');
    const w=document.getElementById('panoV2Twin');
    if(c)c.textContent=`${cams} / 3`;
    if(a)a.textContent=ai.includes('LIVE')?'LIVE':ai.includes('READY')?'READY':ai.includes('FAILED')?'ERROR':'INITIALIZING';
    if(t)t.textContent=tracked;
    if(w)w.textContent=twinState.includes('LIVE')?'LIVE':'IDLE';
  };
  const observer=new MutationObserver(sync);
  observer.observe(twin,{subtree:true,childList:true,characterData:true});
  sync();
}
