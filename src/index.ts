import {afterDraw, afterUpdate, beforeInit} from './plugin';
export * from './types';


const ChartjsPluginScrollBar = {
    id: 'scrollBar',
    beforeInit,
    afterDraw,
    afterUpdate,
};


export default ChartjsPluginScrollBar;
