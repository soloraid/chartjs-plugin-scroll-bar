import {afterDraw, afterUpdate, beforeInit} from './plugin';
export * from './types';


const chartjsPluginScrollBar = {
    id: 'scrollBar',
    beforeInit,
    afterDraw,
    afterUpdate,
};


export default chartjsPluginScrollBar;
