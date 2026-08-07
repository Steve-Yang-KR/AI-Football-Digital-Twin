export function initPanorama(){
 const roles=['LEFT','CENTER','RIGHT'];
 const canvas=document.getElementById('panoramaCanvas'),ctx=canvas.getContext('2d'),panoControls=document.getElementById('panoControls'),panoStatus=document.getElementById('panoStatus'),panoBox=document.getElementById('panoBox');
 if(!canvas||!ctx)return;

 function activeStreams(){
  return roles.map(role=>({role,video:document.getElementById('stream'+role)})).filter(({video})=>video&&video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0);
 }

 function buildControls(){
  if(!panoControls)return;
  panoControls.innerHTML=`<div class="control"><b>ADAPTIVE PANORAMA</b><div class="row"><span>1 camera</span><b>Full canvas</b></div><div class="row"><span>2 cameras</span><b>Equal 50 / 50</b></div><div class="row"><span>3 cameras</span><b>Equal thirds</b></div><div class="row"><span>Fit mode</span><b>Full frame</b></div></div>`;
 }
 buildControls();

 const reset=document.getElementById('resetPano'),save=document.getElementById('savePano'),full=document.getElementById('fullPano');
 if(reset)reset.onclick=()=>buildControls();
 if(save)save.onclick=()=>localStorage.setItem('panoramaLayoutV5','adaptive');
 if(full)full.onclick=()=>panoBox?.requestFullscreen?.();

 function drawContained(video,x,y,w,h){
  const vw=video.videoWidth,vh=video.videoHeight;
  if(!vw||!vh)return;
  const scale=Math.min(w/vw,h/vh);
  const dw=vw*scale,dh=vh*scale;
  const dx=x+(w-dw)/2,dy=y+(h-dh)/2;
  ctx.fillStyle='#020b13';ctx.fillRect(x,y,w,h);
  ctx.drawImage(video,dx,dy,dw,dh);
 }

 function label(role,x,y,w){
  ctx.fillStyle='rgba(2,11,19,.72)';ctx.fillRect(x+10,y+10,92,30);
  ctx.fillStyle='#eafcff';ctx.font='700 14px system-ui';ctx.textAlign='left';ctx.fillText(role,x+22,y+30);
  ctx.fillStyle='#22c55e';ctx.beginPath();ctx.arc(x+w-22,y+24,5,0,Math.PI*2);ctx.fill();
 }

 let frames=0,last=performance.now();
 function draw(now){
  const streams=activeStreams(),n=streams.length,W=canvas.width,H=canvas.height;
  ctx.fillStyle='#06121e';ctx.fillRect(0,0,W,H);

  if(n===0){
   ctx.fillStyle='rgba(220,245,255,.8)';ctx.font='700 20px system-ui';ctx.textAlign='center';ctx.fillText('Connect a Live Camera to start Panorama',W/2,H/2);
  }else{
   const cellW=W/n;
   streams.forEach(({role,video},i)=>{
    const x=i*cellW;
    drawContained(video,x,0,cellW,H);
    if(i>0){ctx.strokeStyle='rgba(105,220,255,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    label(role,x,0,cellW);
   });
  }

  frames++;
  if(now-last>1000){
   const fps=Math.round(frames*1000/(now-last));
   const layout=n===1?'1 camera · full':n===2?'2 cameras · equal halves':n===3?'3 cameras · equal thirds':'waiting';
   if(panoStatus)panoStatus.textContent=`${layout} · ${fps} FPS`;
   frames=0;last=now;
  }
  requestAnimationFrame(draw);
 }
 requestAnimationFrame(draw);
}
