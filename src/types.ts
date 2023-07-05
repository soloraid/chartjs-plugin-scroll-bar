import {ChartType} from 'chart.js';

export type ScrollType = 'Horizontal' | 'Vertical';
export interface PluginOptions {
    enable: boolean;
    scrollSize: number;
    scrollType: ScrollType;
}

declare module 'chart.js' {
    export interface PluginOptionsByType<TType extends ChartType> {
        scrollBar?: PluginOptions;
    }
}
