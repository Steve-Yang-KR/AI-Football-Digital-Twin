const TF_JSDELIVR='https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const COCO_JSDELIVR='https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
const TF_UNPKG='https://unpkg.com/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const COCO_UNPKG='https://unpkg.com/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';

function loadWithTimeout(src, timeout=9000){
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(s=>s.src===src);
    if(existing && (existing.dataset.loaded==='1' || existing.readyState==='complete')) return resolve();
    const s=existing||document.createElement('script');
    let settled=false;
    const done=(ok,err)=>{if(settled)return;settled=true;clearTimeout(timer);if(ok){s.dataset.loaded='1';resolve();}else reject(err||new Error(`Failed to load ${src}`));};
    s.addEventListener('load',()=>done(true),{once:true});
    s.addEventListener('error',()=>done(false,new Error(`Failed to load ${src}`)),{once:true});
    const timer=setTimeout(()=>done(false,new Error(`Timed out loading ${src}`)),timeout);
    if(!existing){s.src=src;s.async=false;document.head.appendChild(s);}
  });
}

function addLoadedMarker(src){
  if([...document.scripts].some(s=>s.src===src && s.dataset.loaded==='1')) return;
  const marker=document.createElement('script');
  marker.type='application/json';
  marker.src=src;
  marker.dataset.loaded='1';
  document.head.appendChild(marker);
}

async function preloadPersonAI(){
  try{
    if(!window.tf) await loadWithTimeout(TF_JSDELIVR);
    if(!window.cocoSsd) await loadWithTimeout(COCO_JSDELIVR);
    return true;
  }catch(primaryError){
    console.warn('[person-ai] primary CDN failed, trying fallback',primaryError);
    try{
      if(!window.tf) await loadWithTimeout(TF_UNPKG);
      if(!window.cocoSsd) await loadWithTimeout(COCO_UNPKG);
      if(window.tf && window.cocoSsd){
        addLoadedMarker(TF_JSDELIVR);
        addLoadedMarker(COCO_JSDELIVR);
        return true;
      }
    }catch(fallbackError){
      console.error('[person-ai] fallback CDN failed',fallbackError);
    }
  }
  addLoadedMarker(TF_JSDELIVR);
  addLoadedMarker(COCO_JSDELIVR);
  return false;
}

window.__personAIPreloadReady=await preloadPersonAI();
export const personAIPreloadReady=window.__personAIPreloadReady;
