import { Chart } from 'chart.js';
import {PluginOptions} from './types';



var touchStartX = 0;
var touchStartY = 0;
var scrollSize = 1;
const buttonSize = 16;
const scrollThick = 8;
const offsetX = 45;
const offsetY = 45;
let trackpad = false;

const scrollData = (slideFromStart: boolean,min: number,max: number,dataLength: number, scrollSize: number): { min: number; max: number }  => {
    if (slideFromStart) {
      min = min - scrollSize;
      max = max - scrollSize;
      if (min < 0) {
        min = 0;
        max = scrollSize - 1;
      }
    } else {
      min = min + scrollSize;
      max = max + scrollSize;
      if (max >= dataLength - 1) {
        min = dataLength - scrollSize;
        max = dataLength - 1;
      }
    }

    return { min, max };
}

const createScrollBar = (ctx: CanvasRenderingContext2D, coordinates: {containerX: number, containerY: number, containerWidth: number, containerHeight: number,
   scrollX: number, scrollY: number, scrollWidth: number, scrollHeight: number}) => {
  ctx.beginPath();
  ctx.fillStyle = '#ededed';
  ctx.fillRect(coordinates.containerX, coordinates.containerY, coordinates.containerWidth, coordinates.containerHeight);
  ctx.closePath();
  ctx.beginPath();
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(coordinates.scrollX, coordinates.scrollY, coordinates.scrollWidth, coordinates.scrollHeight);
  ctx.closePath();
}

const createScrollButton = (ctx: CanvasRenderingContext2D, container:{ x: number, y: number, width: number, height: number},
  arrow: {x: number, y: number, offsetX: number, offsetY: number}) => {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#E8E8E8';
  ctx.strokeRect(container.x, container.y, container.width, container.height);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#666666';
  ctx.moveTo(arrow.x + arrow.offsetX, arrow.y - arrow.offsetY);
  ctx.lineTo(arrow.x - arrow.offsetX, arrow.y);
  ctx.lineTo(arrow.x + arrow.offsetX, arrow.y + arrow.offsetY);
  ctx.stroke();
  ctx.closePath();
}  

const scrollHorizontally = (slideFromStart: boolean, chart: Chart, scrollSize: number) => {
  const { min, max } = scrollData(slideFromStart, +chart.options.scales.x.min, +chart.options.scales.x.max,
    chart.data.labels.length, scrollSize);
  chart.options.scales.x.min = min;
  chart.options.scales.x.max = max;
  chart.update();
}

const scrollVertically = (slideFromStart: boolean, chart: Chart, scrollSize: number) => {
  const { min, max } = scrollData(slideFromStart, +chart.options.scales.y.min, +chart.options.scales.y.max,
    chart.data.labels.length, scrollSize);
 chart.options.scales.y.min = min;
 chart.options.scales.y.max = max;
 chart.update();
}

const wheelHandler = (chart: Chart) => {
  chart.canvas.addEventListener('wheel', (event: any) => {
    trackpad = chart.options.indexAxis === 'x' ? event.deltaX !== 0 : (event.deltaY !== 0 && event.shiftKey);
    if(event.shiftKey || trackpad) {
      event.preventDefault();
      event.stopPropagation();
      if (chart.options.indexAxis === 'x') {
        scrollHorizontally(trackpad ? event.deltaX < 0 : event.deltaY < 0, chart, scrollSize);
      }
      if (chart.options.indexAxis === 'y') {
        scrollVertically(event.deltaY < 0, chart, scrollSize);
      }
    }
  },{ passive: false });
}

const touchHandler = (chart: Chart) => {
  chart.canvas.addEventListener('touchstart', (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },{ passive: true });
  
  chart.canvas.addEventListener('touchend',(event: any) => {
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      event.preventDefault();
      event.stopPropagation();
      if (chart.options.indexAxis === 'x' && touchEndX !== touchStartX) {
        scrollHorizontally(touchEndX - touchStartX < 0, chart, scrollSize);
      }
      if (chart.options.indexAxis === 'y' && touchEndY !== touchStartY) {
        scrollVertically(touchEndY - touchStartY < 0, chart, scrollSize);
      }
    },{ passive: true });
}

const clickHandker = (chart: Chart) => {
  chart.canvas.addEventListener('click', (event: any) => {
    const {canvas} = chart;
    const rect = canvas.getBoundingClientRect();
    let scrollToStart = false;
    let scrollToEnd = false;
    if (chart.options.indexAxis === 'x') {
      scrollToStart = event.offsetX >= 0 &&  event.offsetX <= buttonSize &&
       event.offsetY >= rect.height - buttonSize - 0.5 && event.offsetY <= rect.height - 0.5;
      scrollToEnd = event.offsetX >= buttonSize + 5 &&  event.offsetX <= 2*buttonSize + 5 &&
       event.offsetY >= rect.height - buttonSize - 0.5 && event.offsetY <= rect.height - 0.5;
      if(scrollToStart) {
        scrollHorizontally(true, chart, scrollSize);
      }
      if(scrollToEnd) {
        scrollHorizontally(false, chart, scrollSize);
      }
    }
    if (chart.options.indexAxis === 'y') {
      // todo
      if(scrollToStart) {
        scrollVertically(true, chart, scrollSize);
      }
      if(scrollToEnd) {
        scrollVertically(false, chart, scrollSize);
      }
    }
  },{ passive: true });
}

export const afterDraw = (chart: Chart, args: any[], pluginOptions: PluginOptions) => {
    if(!pluginOptions.enable) {
      return;
    }
    if(chart.data.labels == null) {
        return;
    }
    if(pluginOptions.scrollType == null) {
        return;
    }
    const {ctx, chartArea: {top}, canvas} = chart;
    const rect = canvas.getBoundingClientRect();
    
    const dataLength = chart.data.labels.length;
    const barWidth = (pluginOptions.scrollType === 'Vertical' ?
    ((rect.height - offsetY) / dataLength) : ((rect.width - offsetX )/ dataLength)) * pluginOptions.scrollSize;
    const endPoint = top + ((rect.height - offsetY) / dataLength) * +chart.options.scales.y.min;
    const startPoint = offsetX + ((rect.width - offsetX ) / dataLength) * +chart.options.scales.x.min;
    if (pluginOptions.scrollSize < dataLength) {
      if (pluginOptions.scrollType === 'Vertical') {
        // todo
        createScrollBar(ctx, {
          containerX: 0,
          containerY: top,
          containerWidth: scrollThick,
          containerHeight: rect.height - offsetY,
          scrollX: 0,
          scrollY: endPoint,
          scrollWidth: scrollThick,
          scrollHeight: barWidth,
        });

      } else if (pluginOptions.scrollType === 'Horizontal') {
        createScrollBar(ctx, 
          {
            containerX: offsetX,
            containerY: rect.height - scrollThick - 2,
            containerWidth: rect.width - offsetX ,
            containerHeight: scrollThick,
            scrollX: startPoint,
            scrollY: rect.height - scrollThick - 2,
            scrollWidth: barWidth,
            scrollHeight: scrollThick,
          });
        createScrollButton(ctx,  {x: 0, y: rect.height - buttonSize - 0.5, width: buttonSize, height: buttonSize},
          {x: buttonSize / 2 , y: rect.height - (buttonSize + 0.5) / 2, offsetX: 2.5, offsetY: 4.5});
        createScrollButton(ctx, {x: buttonSize + 5, y: rect.height - buttonSize - 0.5, width: buttonSize, height: buttonSize},
          {x: 3*buttonSize / 2 + 5, y: rect.height - (buttonSize + 0.5) / 2, offsetX: -2.5, offsetY: 4.5});
      }
    }
};


export const beforeInit = (chart: Chart, args: any[], pluginOptions: PluginOptions) => {
  scrollSize = pluginOptions.scrollSize;
  wheelHandler(chart);
  touchHandler(chart);
  clickHandker(chart);
}

export const afterUpdate = (chart: Chart, args: any[], pluginOptions: PluginOptions) => {
  scrollSize = pluginOptions.scrollSize;
}