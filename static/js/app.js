import {initNavigation,initContent} from './content.js';
import {initCameras} from './cameras.js';
import {initPanorama} from './panorama.js';
import {initTwin} from './twin.js';
import {initSimulation} from './simulation.js';
import {initRoleLens} from './role-lens.js';

for(const href of ['/static/css/homepage-v2-merge.css','/static/css/role-lens.css']){
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);
}

const initializers=[initNavigation,initContent,initRoleLens,initCameras,initPanorama,initTwin,initSimulation];
for(const init of initializers){try{init();}catch(error){console.error(`[${init.name}]`,error);}}
