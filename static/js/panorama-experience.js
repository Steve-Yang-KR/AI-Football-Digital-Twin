import {personAIPreloadPromise} from './person-ai-preload.js';
import {initPanoramaTwin} from './panorama-twin.js';
import {initLive3DTwin} from './live-3d-twin.js';
import {initPanoramaCommandWorkspace} from './panorama-command-workspace.js';

export function initPanoramaExperience(){
  const status=document.getElementById('systemState');
  personAIPreloadPromise
    .catch(()=>false)
    .then(()=>{
      try{initPanoramaTwin();}catch(error){console.error('[initPanoramaTwin]',error);}
      try{initLive3DTwin();}catch(error){console.error('[initLive3DTwin]',error);}
      try{initPanoramaCommandWorkspace();}catch(error){console.error('[initPanoramaCommandWorkspace]',error);}
    })
    .catch(error=>{
      console.error('[panorama experience]',error);
      const loading=document.getElementById('p2tTrackingState');
      if(loading)loading.textContent='AI INITIALIZATION FAILED';
      const button=document.getElementById('p2tStart');
      if(button){button.disabled=true;button.textContent='Person AI unavailable';}
    });

  // The rest of the application must never wait for the AI model/CDN.
  if(status && status.textContent.includes('LOADING')) status.textContent='PROTOTYPE LIVE';
}
