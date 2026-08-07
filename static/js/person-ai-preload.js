const TF_JSDELIVR='https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const COCO_JSDELIVR='https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
const TF_UNPKG='https://unpkg.com/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const COCO_UNPKG='https://unpkg.com/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';

function loadWithTimeout(src, timeout=5000){
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(s=>s.src===src);
    if(existing && (existing.dataset.loaded==='1' || existing.readyState==='complete')) return resolve();
    const s=existing||document.createElement('script');
    let settled=false;
    const done=(ok,err)=>{if(settled)return;settled=true;clearTimeout(timer);if(ok){s.dataset.loaded='1';resolve();}else reject(err||new Error(`Failed to load ${src}`));};
    s.addEventListener('load',()=>done(true),{once:true});
    s.addEventListener('error',()=>done(false,new Error(`Failed to load ${src}`)),{once:true});
    const timer=setTimeout(()=>done(false,new Error(`Timed out loading ${src}`)),timeout);
    if(!existing){s.src=src;s.async=true;document.head.appendChild(s);}
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

function timeoutPromise(promise,ms,label){
  return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} timed out`)),ms))]);
}

async function preloadPersonAI(){
  let scriptsReady=false;
  try{
    if(!window.tf) await loadWithTimeout(TF_JSDELIVR);
    if(!window.cocoSsd) await loadWithTimeout(COCO_JSDELIVR);
    scriptsReady=!!(window.tf&&window.cocoSsd);
  }catch(primaryError){
    console.warn('[person-ai] primary CDN failed, trying fallback',primaryError);
    try{
      if(!window.tf) await loadWithTimeout(TF_UNPKG);
      if(!window.cocoSsd) await loadWithTimeout(COCO_UNPKG);
      scriptsReady=!!(window.tf&&window.cocoSsd);
    }catch(fallbackError){
      console.error('[person-ai] fallback CDN failed',fallbackError);
    }
  }

  if(scriptsReady && window.cocoSsd?.load && !window.cocoSsd.__timeoutWrapped){
    const originalLoad=window.cocoSsd.load.bind(window.cocoSsd);
    window.cocoSsd.load=(options)=>timeoutPromise(originalLoad(options),12000,'COCO-SSD model load');
    window.cocoSsd.__timeoutWrapped=true;
  }

  addLoadedMarker(TF_JSDELIVR);
  addLoadedMarker(COCO_JSDELIVR);
  return scriptsReady;
}

export const personAIPreloadPromise=preloadPersonAI();
window.__personAIPreloadPromise=personAIPreloadPromise;
