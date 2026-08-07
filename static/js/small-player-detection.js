// Small-player enhancement for the browser COCO-SSD MVP.
// It transparently wraps cocoSsd.load() before panorama-twin requests the model,
// then combines full-frame inference with three overlapping, upscaled panorama tiles.

function overlap(a,b){
  const [ax,ay,aw,ah]=a.bbox,[bx,by,bw,bh]=b.bbox;
  const x1=Math.max(ax,bx),y1=Math.max(ay,by),x2=Math.min(ax+aw,bx+bw),y2=Math.min(ay+ah,by+bh);
  const inter=Math.max(0,x2-x1)*Math.max(0,y2-y1);
  return inter/Math.max(1,aw*ah+bw*bh-inter);
}

function nms(items,threshold=.42){
  const sorted=[...items].sort((a,b)=>b.score-a.score),kept=[];
  while(sorted.length){
    const best=sorted.shift();kept.push(best);
    for(let i=sorted.length-1;i>=0;i--){
      if(sorted[i].class===best.class && overlap(best,sorted[i])>threshold) sorted.splice(i,1);
    }
  }
  return kept;
}

function installWrapper(){
  if(!window.cocoSsd || window.cocoSsd.__smallPlayerWrapped) return false;
  const originalLoad=window.cocoSsd.load.bind(window.cocoSsd);
  window.cocoSsd.load=async (...args)=>{
    const model=await originalLoad(...args);
    if(model.__smallPlayerWrapped) return model;
    const originalDetect=model.detect.bind(model);
    model.detect=async (input,maxNumBoxes=20,minScore=.5)=>{
      const isPanorama=input && input.id==='panoramaCanvas';
      if(!isPanorama) return originalDetect(input,maxNumBoxes,minScore);

      const W=input.width,H=input.height;
      // Keep the normal pass for nearby / large players.
      const full=await originalDetect(input,Math.max(30,maxNumBoxes),Math.min(minScore,.24));
      const all=full.filter(p=>p.class==='person' && p.score>=.24);

      // Three 42%-wide overlapping crops make distant players substantially larger
      // to the detector while retaining overlap around camera seams.
      const tileWidth=Math.round(W*.42), starts=[0,Math.round(W*.29),W-tileWidth];
      for(const sx of starts){
        const crop=document.createElement('canvas');
        crop.width=640;crop.height=Math.max(320,Math.round(640*H/tileWidth));
        crop.getContext('2d').drawImage(input,sx,0,tileWidth,H,0,0,crop.width,crop.height);
        const preds=await originalDetect(crop,30,.20);
        for(const p of preds){
          if(p.class!=='person' || p.score<.20) continue;
          const [x,y,w,h]=p.bbox;
          all.push({...p,bbox:[sx+x/crop.width*tileWidth,y/crop.height*H,w/crop.width*tileWidth,h/crop.height*H]});
        }
      }
      return nms(all).slice(0,Math.max(30,maxNumBoxes));
    };
    model.__smallPlayerWrapped=true;
    return model;
  };
  window.cocoSsd.__smallPlayerWrapped=true;
  console.info('[small-player] tiled panorama detection enabled');
  return true;
}

export function initSmallPlayerDetection(){
  if(installWrapper()) return;
  const observer=new MutationObserver(()=>{
    if(installWrapper()) observer.disconnect();
  });
  observer.observe(document.head,{childList:true,subtree:true});
  // Safety polling covers cached scripts and unusual load ordering.
  let tries=0;const timer=setInterval(()=>{
    if(installWrapper() || ++tries>200){clearInterval(timer);observer.disconnect();}
  },25);
}
