document.addEventListener('DOMContentLoaded',()=>{
  const panoSection=document.getElementById('panorama');
  if(!panoSection||document.getElementById('panoHologramSplit'))return;
  const actions=panoSection.querySelector('.actions');
  const panoBox=panoSection.querySelector('.pano');
  if(!actions||!panoBox)return;

  const style=document.createElement('style');
  style.textContent=`
    .pano-holo-note{margin-top:8px;padding:9px 11px;border:1px solid #bcd9ff;border-radius:10px;background:#eef6ff;color:#164a80;font-size:10px;line-height:1.45}
    .pano-holo-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;align-items:stretch}
    .pano-holo-panel{min-width:0;border:1px solid #dce5ec;border-radius:12px;overflow:hidden;background:#06121e}
    .pano-holo-head{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#fff;border-bottom:1px solid #dce5ec;font-size:10px;font-weight:900}
    .pano-holo-panel .pano{margin:0!important;border-radius:0;height:100%}
    .pano-holo-frame{display:block;width:100%;height:100%;min-height:420px;border:0;background:#04111b}
    @media(max-width:950px){.pano-holo-grid{grid-template-columns:1fr}.pano-holo-frame{min-height:360px}}
  `;
  document.head.appendChild(style);

  const splitButton=document.createElement('button');
  splitButton.id='panoHologramSplit';
  splitButton.className='primary';
  splitButton.type='button';
  splitButton.textContent='✨ Panorama + 3D Twin';

  const fullButton=document.createElement('button');
  fullButton.id='openHologram';
  fullButton.className='secondary';
  fullButton.type='button';
  fullButton.textContent='Open Full Hologram';
  fullButton.addEventListener('click',()=>{window.location.href='/hologram';});

  actions.append(splitButton,fullButton);

  const note=document.createElement('div');
  note.className='pano-holo-note';
  note.innerHTML='<b>Observation and Twin Comparison</b><br>Left: live panorama observation. Right: the 3D player, ball and match Digital Twin generated from the current twin-state stream.';
  actions.insertAdjacentElement('afterend',note);

  let splitGrid=null;
  let iframe=null;
  let enabled=false;

  function enableSplit(){
    if(!splitGrid){
      splitGrid=document.createElement('div');
      splitGrid.className='pano-holo-grid';

      const panoPanel=document.createElement('div');
      panoPanel.className='pano-holo-panel';
      panoPanel.innerHTML='<div class="pano-holo-head"><span>LIVE PANORAMA</span><span>OBSERVATION LAYER</span></div>';
      panoBox.parentNode.insertBefore(splitGrid,panoBox);
      panoPanel.appendChild(panoBox);

      const twinPanel=document.createElement('div');
      twinPanel.className='pano-holo-panel';
      twinPanel.innerHTML='<div class="pano-holo-head"><span>3D HOLOGRAM DIGITAL TWIN</span><span>SIMULATED LIVE</span></div>';
      iframe=document.createElement('iframe');
      iframe.className='pano-holo-frame';
      iframe.title='3D Hologram Digital Twin';
      iframe.loading='lazy';
      iframe.src='/hologram?embed=1';
      twinPanel.appendChild(iframe);

      splitGrid.append(panoPanel,twinPanel);
    }
    splitGrid.style.display='grid';
    enabled=true;
    splitButton.textContent='Hide 3D Twin';
  }

  function disableSplit(){
    if(splitGrid)splitGrid.style.display='none';
    enabled=false;
    splitButton.textContent='✨ Panorama + 3D Twin';
  }

  splitButton.addEventListener('click',()=>enabled?disableSplit():enableSplit());
});
