const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function canvasBlob(canvas){return new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.78));}

export function initServerAITracking(){
  const source=document.getElementById('panoramaCanvas');
  const analysis=document.getElementById('p2tAnalysis');
  const actions=document.querySelector('.p2t-actions');
  const state=document.getElementById('p2tTrackingState');
  if(!source||!analysis||!actions)return;

  const wrap=analysis.parentElement;
  if(wrap&&getComputedStyle(wrap).position==='static')wrap.style.position='relative';
  const overlay=document.createElement('canvas');
  overlay.width=analysis.width;overlay.height=analysis.height;
  Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'5'});
  wrap?.appendChild(overlay);
  const ctx=overlay.getContext('2d');

  const button=document.createElement('button');
  button.className='secondary';
  button.id='serverAIButton';
  button.textContent='Server AI: checking…';
  button.disabled=true;
  actions.prepend(button);

  let available=false,enabled=false,busy=false,stopped=false,model='';

  function clear(){ctx.clearRect(0,0,overlay.width,overlay.height);}
  function draw(detections){
    clear();
    for(const d of detections||[]){
      const b=d.bbox||{};const x=b.x*overlay.width,y=b.y*overlay.height,w=b.w*overlay.width,h=b.h*overlay.height;
      const isBall=d.label==='ball';
      ctx.strokeStyle=isBall?'#ffd54a':'#38e2ff';ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);
      const label=`${d.label||'player'} #${d.track_id??'?'} ${Math.round((d.confidence||0)*100)}%`;
      ctx.font='700 12px system-ui';const tw=ctx.measureText(label).width+12;
      ctx.fillStyle=isBall?'#7a5a00':'#063a47';ctx.fillRect(x,Math.max(0,y-22),tw,20);
      ctx.fillStyle='#fff';ctx.fillText(label,x+6,Math.max(14,y-7));
      if(d.foot){ctx.beginPath();ctx.arc(d.foot.x*overlay.width,d.foot.y*overlay.height,4,0,Math.PI*2);ctx.fillStyle='#ff4d6d';ctx.fill();}
    }
  }

  async function status(){
    try{
      const r=await fetch('/api/ai/status',{cache:'no-store'});const data=await r.json();
      available=!!data.available;model=data.model||'';
      button.disabled=!available;
      button.textContent=available?`Server YOLO · ${model}`:'Server AI unavailable';
      button.title=available?'Use Python YOLO + ByteTrack on panorama frames':(data.reason||'Install requirements-ai.txt on the AI service');
    }catch(err){button.textContent='Server AI offline';button.title=String(err);}
  }

  async function loop(){
    while(!stopped){
      if(!enabled||busy||source.width===0){await sleep(180);continue;}
      busy=true;
      try{
        const blob=await canvasBlob(source);if(!blob){await sleep(200);continue;}
        const r=await fetch('/api/ai/track',{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});
        if(!r.ok)throw new Error(`AI ${r.status}`);
        const data=await r.json();
        draw(data.detections);
        window.__serverAITracks=data.detections||[];
        window.dispatchEvent(new CustomEvent('server-ai-tracks',{detail:data}));
        if(state)state.textContent=`SERVER YOLO + BYTETRACK · ${(data.detections||[]).length} TRACKS`;
      }catch(err){
        console.error('[server AI]',err);
        enabled=false;button.classList.remove('primary');button.classList.add('secondary');button.textContent='Server AI retry';
        if(state)state.textContent='SERVER AI ERROR · BROWSER FALLBACK ACTIVE';
        clear();
      }finally{busy=false;}
      await sleep(220);
    }
  }

  button.addEventListener('click',()=>{
    if(!available)return;enabled=!enabled;
    button.classList.toggle('primary',enabled);button.classList.toggle('secondary',!enabled);
    button.textContent=enabled?'Server YOLO: ON':`Server YOLO · ${model}`;
    if(!enabled){clear();if(state)state.textContent='BROWSER PERSON TRACKING';}
  });

  status();loop();
  window.addEventListener('beforeunload',()=>{stopped=true;});
}
