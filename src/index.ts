import {afterDraw, beforeUpdate, beforeInit} from './plugin';
export * from './types';


const ChartjsPluginScrollBar = {
    id: 'scrollBar',
    beforeInit,
    afterDraw,
    beforeUpdate,
};


export default ChartjsPluginScrollBar;
