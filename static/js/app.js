import {initNavigation,initContent} from './content.js';
import {initCameras} from './cameras.js';
import {initPanorama} from './panorama.js';
import {initTwin} from './twin.js';
import {initSimulation} from './simulation.js';
import {initRoleLens} from './role-lens.js';
import {initHologramAnalysis} from './hologram-analysis.js';
import {initPanoramaTwin} from './panorama-twin.js';
import {initLive3DTwin} from './live-3d-twin.js';
import {initHomepageV11Merge} from './homepage-v11-merge.js';
import {initPanoramaCommandWorkspace} from './panorama-command-workspace.js';

for(const href of ['/static/css/homepage-v2-merge.css','/static/css/role-lens.css','/static/css/hologram-analysis.css','/static/css/panorama-twin.css','/static/css/live-3d-twin.css','/static/css/homepage-v11-merge.css','/static/css/panorama-command-workspace.css']){
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);
}

const initializers=[initNavigation,initContent,initHomepageV11Merge,initRoleLens,initCameras,initPanorama,initHologramAnalysis,initPanoramaTwin,initLive3DTwin,initPanoramaCommandWorkspace,initTwin,initSimulation];
for(const init of initializers){try{init();}catch(error){console.error(`[${init.name}]`,error);}}
