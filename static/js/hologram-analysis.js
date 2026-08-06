const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function markup(){return `<section class="holo-section" aria-label="3D hologram and AI video analysis"><div class="holo-head"><div><small>DIGITAL TWIN OBSERVATION</small><h3>3D Hologram View</h3><p>Live panorama re-projected as a depth-styled field visualization.</p></div><div class="holo-actions"><button class="secondary" id="toggleHoloSpin">Pause rotation</button><button class="primary" id="toggleVision">Start AI analysis</button></div></div><div class="holo-layout"><div class="holo-stage"><canvas id="hologramCanvas" width="1280" height="560"></canvas><div class="holo-floor"></div><span class="holo-badge" id="holoState">WAITING FOR PANORAMA</span></div><aside class="vision-panel"><div class="vision-title"><div><small>AI VIDEO ANALYSIS</small><h3>Live Observation Signals</h3></div><span id="visionState">OFF</span></div><div class="vision-metrics"><div><small>Motion level</small><b id="motionMetric">--</b></div><div><small>Active zones</small><b id="zoneMetric">--</b></div><div><small>Scene quality</small><b id="qualityMetric">--</b></div><div><small>Tracking confidence</small><b id="trackMetric">--</b></div></div><canvas id="visionMap" width="320" height="150"></canvas><div class="vision-feed" id="visionFeed"><div><b>Analysis idle</b><small>Start AI analysis after camera streams are connected.</small></div></div><p class="vision-note">Prototype browser vision: motion segmentation, zone activity and image-quality signals. It is not yet a trained player/ball recognition model.</p></aside></div></section>`}

export function initHologramAnalysis(){
 const panoBox=document.getElementById('panoBox');
 const source=document.getElementById('panoramaCanvas');
 if(!panoBox||!source)return;
 panoBox.insertAdjacentHTML('afterend',markup());
 const holo=document.getElementById('hologramCanvas'),hctx=holo.getContext('2d');
 const map=document.getElementById('visionMap'),mctx=map.getContext('2d',{willReadFrequently:true});
 const sample=document.createElement('canvas');sample.width=160;sample.height=68;const sctx=sample.getContext('2d',{willReadFrequently:true});
 let spin=true,angle=-7,analysis=false,lastAnalysis=0,previous=null,lastMotion=0;
 document.getElementById('toggleHoloSpin').onclick=e=>{spin=!spin;e.currentTarget.textContent=spin?'Pause rotation':'Resume rotation'};
 document.getElementById('toggleVision').onclick=e=>{analysis=!analysis;e.currentTarget.textContent=analysis?'Stop AI analysis':'Start AI analysis';document.getElementById('visionState').textContent=analysis?'LIVE':'OFF';document.querySelector('.vision-panel').classList.toggle('is-live',analysis)};
 function connected(){return ['LEFT','CENTER','RIGHT'].filter(r=>{const v=document.getElementById('stream'+r);return v&&v.readyState>=2&&v.videoWidth}).length}
 function drawHologram(now){
  const cams=connected();if(spin)angle=Math.sin(now/3200)*7;
  hctx.clearRect(0,0,holo.width,holo.height);
  const g=hctx.createRadialGradient(640,420,30,640,390,590);g.addColorStop(0,'rgba(0,255,220,.18)');g.addColorStop(1,'rgba(0,40,65,0)');hctx.fillStyle=g;hctx.fillRect(0,0,holo.width,holo.height);
  hctx.save();hctx.translate(640,285);hctx.transform(1,Math.sin(angle*Math.PI/180)*.05,0,.58,0,0);hctx.globalCompositeOperation='screen';
  for(let i=9;i>=0;i--){hctx.globalAlpha=.035+i*.018;hctx.filter=`hue-rotate(${165+i*2}deg) saturate(1.8) contrast(1.15)`;const inset=i*8;hctx.drawImage(source,-560+inset,-250-i*3,1120-inset*2,500)}
  hctx.filter='none';hctx.globalAlpha=.72;hctx.drawImage(source,-560,-250,1120,500);hctx.restore();
  hctx.strokeStyle='rgba(90,255,235,.25)';hctx.lineWidth=1;for(let y=80;y<515;y+=18){hctx.beginPath();hctx.moveTo(120,y);hctx.lineTo(1160,y);hctx.stroke()}
  hctx.fillStyle='rgba(105,255,235,.85)';hctx.font='700 14px system-ui';hctx.fillText(cams?`${cams} LIVE CAMERA${cams>1?'S':''} · HOLOGRAPHIC PROJECTION`:'CONNECT CAMERAS TO ACTIVATE',28,34);
  document.getElementById('holoState').textContent=cams?`${cams} CAMERA${cams>1?'S':''} LIVE`:'WAITING FOR PANORAMA';
  if(analysis&&now-lastAnalysis>240){analyze();lastAnalysis=now}
  requestAnimationFrame(drawHologram)
 }
 function analyze(){
  sctx.drawImage(source,0,0,sample.width,sample.height);const frame=sctx.getImageData(0,0,sample.width,sample.height);const data=frame.data;let brightness=0,contrastSum=0,motion=0,active=0;const cells=[];const cols=8,rows=4,cw=sample.width/cols,ch=sample.height/rows;
  for(let cy=0;cy<rows;cy++){for(let cx=0;cx<cols;cx++){let cellMotion=0,count=0;for(let y=Math.floor(cy*ch);y<Math.floor((cy+1)*ch);y+=2){for(let x=Math.floor(cx*cw);x<Math.floor((cx+1)*cw);x+=2){const i=(y*sample.width+x)*4,gray=(data[i]*.299+data[i+1]*.587+data[i+2]*.114);brightness+=gray;contrastSum+=Math.abs(data[i]-data[i+1])+Math.abs(data[i+1]-data[i+2]);if(previous)cellMotion+=Math.abs(gray-previous[(y*sample.width+x)]);count++}}const score=count?cellMotion/count:0;cells.push(score);motion+=score;if(score>13)active++}}
  const pixels=(sample.width/2)*(sample.height/2);brightness/=pixels;const quality=clamp(Math.round((brightness>35&&brightness<220?65:35)+Math.min(25,contrastSum/(pixels*8))),0,100);const motionPct=clamp(Math.round(motion/cells.length*3.2),0,100);const confidence=clamp(Math.round((connected()/3)*55+quality*.25+Math.min(20,active*2)),0,98);
  const gray=new Float32Array(sample.width*sample.height);for(let p=0;p<data.length;p+=4)gray[p/4]=data[p]*.299+data[p+1]*.587+data[p+2]*.114;previous=gray;lastMotion=motionPct;
  document.getElementById('motionMetric').textContent=`${motionPct}%`;document.getElementById('zoneMetric').textContent=`${active} / ${cells.length}`;document.getElementById('qualityMetric').textContent=`${quality}%`;document.getElementById('trackMetric').textContent=`${confidence}%`;
  mctx.clearRect(0,0,map.width,map.height);cells.forEach((v,i)=>{const x=(i%cols)*(map.width/cols),y=Math.floor(i/cols)*(map.height/rows),a=clamp(v/38,.08,.9);mctx.fillStyle=`rgba(34,211,166,${a})`;mctx.fillRect(x+2,y+2,map.width/cols-4,map.height/rows-4)});mctx.strokeStyle='rgba(255,255,255,.18)';mctx.strokeRect(.5,.5,map.width-1,map.height-1);
  const feed=document.getElementById('visionFeed');let headline='Low field activity',detail='The panorama is stable with limited movement.';if(motionPct>62){headline='High transition activity';detail='Strong motion is distributed across multiple field zones.'}else if(motionPct>28){headline='Active play detected';detail=`Movement is concentrated in ${active} observation zones.`}if(connected()<2){headline='Insufficient camera coverage';detail='Connect at least two cameras for meaningful field-wide analysis.'}feed.innerHTML=`<div><b>${headline}</b><small>${detail}</small></div><div><b>Recommended next step</b><small>${quality<55?'Improve lighting or camera alignment.':lastMotion>65?'Review transition and pressing events.':'Continue collecting evidence for the Match Twin.'}</small></div>`;
 }
 requestAnimationFrame(drawHologram)
}
