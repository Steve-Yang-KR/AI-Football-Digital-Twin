import {initNavigation,initContent} from './content.js';
import {initCameras} from './cameras.js';
import {initPanorama} from './panorama.js';
import {initTwin} from './twin.js';
import {initSimulation} from './simulation.js';

const mergedStyle=document.createElement('link');
mergedStyle.rel='stylesheet';
mergedStyle.href='/static/css/homepage-v2-merge.css';
document.head.appendChild(mergedStyle);

const initializers=[initNavigation,initContent,initCameras,initPanorama,initTwin,initSimulation];
for(const init of initializers){try{init();}catch(error){console.error(`[${init.name}]`,error);}}
