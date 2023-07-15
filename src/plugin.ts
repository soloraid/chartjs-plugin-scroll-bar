import { Chart } from 'chart.js';
import {PluginOptions, ScrollType} from './types';



var touchStartX = 0;
var touchStartY = 0;
const buttonSize = 16;
const scrollThick = 8;
const offsetX = 45;
const offsetY = 45;
var handlers = {
  wheel: (event: any) => {},
  touchend: (event: any) => {},
  touchstart: (event: any) => {},
  click: (event: any) => {},
}

const scrollData = (slideFromStart: boolean,min: number,max: number,dataLength: number): { min: number; max: number }  => {
    const scrollSize = max - min + 1;
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
  arrow: {x: number, y: number, offsetX: number, offsetY: number}, type: ScrollType) => {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#E8E8E8';
  ctx.strokeRect(container.x, container.y, container.width, container.height);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#666666';
  if(type === 'Horizontal') {
    ctx.moveTo(arrow.x + arrow.offsetX, arrow.y - arrow.offsetY);
    ctx.lineTo(arrow.x - arrow.offsetX, arrow.y);
    ctx.lineTo(arrow.x + arrow.offsetX, arrow.y + arrow.offsetY);
  }
  if(type === 'Vertical') {
    ctx.moveTo(arrow.x - arrow.offsetX, arrow.y - arrow.offsetY);
    ctx.lineTo(arrow.x , arrow.y + arrow.offsetY);
    ctx.lineTo(arrow.x + arrow.offsetX, arrow.y - arrow.offsetY);
  }
  ctx.stroke();
  ctx.closePath();
}  

const scrollHorizontally = (slideFromStart: boolean, chart: Chart) => {
  const { min, max } = scrollData(slideFromStart, +chart.options.scales.x.min, +chart.options.scales.x.max,
    chart.data.labels.length);
  chart.options.scales.x.min = min;
  chart.options.scales.x.max = max;
  chart.update();
}

const scrollVertically = (slideFromStart: boolean, chart: Chart) => {
  const { min, max } = scrollData(slideFromStart, +chart.options.scales.y.min, +chart.options.scales.y.max,
    chart.data.labels.length);
 chart.options.scales.y.min = min;
 chart.options.scales.y.max = max;
 chart.update();
}

const wheelHandler = (event: any, chart: Chart) => {
  console.log(chart.options.indexAxis , chart.options.scales.x.min, chart.options.scales.y.min);
  
  if (chart.options.indexAxis === 'x' && !isNaN(+chart.options.scales.x.min)) {
    event.preventDefault();
    event.stopPropagation();
    scrollHorizontally(event.deltaX !== 0 ? event.deltaX < 0 : event.deltaY < 0, chart);
  }
  if (chart.options.indexAxis === 'y' && !isNaN(+chart.options.scales.y.min)) {
    event.preventDefault();
    event.stopPropagation();
    scrollVertically(event.deltaY < 0, chart);
  }
}

const touchstartHandler = (event: any, chart: Chart) => {
  event.preventDefault();
  event.stopPropagation();
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}

const touchendHandler = (event: any, chart: Chart) => {
  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;
  event.preventDefault();
  event.stopPropagation();
  if (chart.options.indexAxis === 'x' && touchEndX !== touchStartX && !isNaN(+chart.options.scales.x.min)) {
    scrollHorizontally(touchEndX - touchStartX > 0, chart);
  }
  if (chart.options.indexAxis === 'y' && touchEndY !== touchStartY && !isNaN(+chart.options.scales.y.min)) {
    scrollVertically(touchEndY - touchStartY > 0, chart);
  }
}

const clickHandker = (event: any, chart: Chart) => {
  const {canvas} = chart;
  const rect = canvas.getBoundingClientRect();
  let isScrollToStart = false;
  let isScrollToEnd = false;
  if (chart.options.indexAxis === 'x' && !isNaN(+chart.options.scales.x.min)) {
    isScrollToStart = (
      event.offsetX >= 0 &&
      event.offsetX <= buttonSize &&
      event.offsetY >= rect.height - buttonSize - 0.5 &&
      event.offsetY <= rect.height - 0.5
    );
    isScrollToEnd = (
      event.offsetX >= buttonSize + 5 &&
      event.offsetX <= 2 * buttonSize + 5 &&
      event.offsetY >= rect.height - buttonSize - 0.5 &&
      event.offsetY <= rect.height - 0.5
    );
    if(isScrollToStart || isScrollToEnd) {
      scrollHorizontally(isScrollToStart, chart);
    }
  }
  if (chart.options.indexAxis === 'y' && !isNaN(+chart.options.scales.y.min)) {
    isScrollToStart = (
      event.offsetX >= 0 &&
      event.offsetX <= buttonSize &&
      event.offsetY >= rect.height - (2 * buttonSize) - 1 &&
      event.offsetY <= rect.height - buttonSize - 1 
    );
    
    isScrollToEnd = (
      event.offsetX >= 0 &&
      event.offsetX <= buttonSize &&
      event.offsetY >= rect.height - buttonSize - 1 &&
      event.offsetY <= rect.height - 1 
    );
    
    if(isScrollToStart || isScrollToEnd) {
      scrollVertically(isScrollToStart, chart);
    }
  }
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
    const endPoint = ((rect.height - offsetY) / dataLength) * +chart.options.scales.y.min + 1;
    const startPoint = offsetX + ((rect.width - offsetX ) / dataLength) * +chart.options.scales.x.min;
    if (pluginOptions.scrollSize < dataLength) {
      if (pluginOptions.scrollType === 'Vertical') {
        createScrollBar(ctx, {
          containerX:  0,
          containerY: 1,
          containerWidth: scrollThick,
          containerHeight: rect.height - offsetY,
          scrollX: 0,
          scrollY: endPoint,
          scrollWidth: scrollThick,
          scrollHeight: barWidth,
        });
        createScrollButton(ctx,  {x: 0, y: rect.height - buttonSize - 1, width: buttonSize, height: buttonSize},
          {x: buttonSize / 2 , y: rect.height - buttonSize / 2 - 1, offsetX: 4.5, offsetY: 2.5} , pluginOptions.scrollType);
        createScrollButton(ctx, {x: 0, y: rect.height - 2*buttonSize - 6, width: buttonSize, height: buttonSize},
          {x: buttonSize / 2, y: rect.height - 3*buttonSize / 2 - 6 , offsetX: -4.5, offsetY: -2.5}, pluginOptions.scrollType);

      } else if (pluginOptions.scrollType === 'Horizontal') {
        createScrollBar(ctx, 
          {
            containerX: offsetX,
            containerY: rect.height - scrollThick - 1,
            containerWidth: rect.width - offsetX ,
            containerHeight: scrollThick,
            scrollX: startPoint,
            scrollY: rect.height - scrollThick - 1,
            scrollWidth: barWidth,
            scrollHeight: scrollThick,
          });
        createScrollButton(ctx,  {x: 0, y: rect.height - buttonSize - 1, width: buttonSize, height: buttonSize},
          {x: buttonSize / 2 , y: rect.height - (buttonSize +1) / 2, offsetX: 2.5, offsetY: 4.5}, pluginOptions.scrollType);
        createScrollButton(ctx, {x: buttonSize + 5, y: rect.height - buttonSize - 1, width: buttonSize, height: buttonSize},
          {x: 3*buttonSize / 2 + 5, y: rect.height - (buttonSize + 1) / 2, offsetX: -2.5, offsetY: 4.5}, pluginOptions.scrollType);
      }
    }
};


export const beforeInit = (chart: Chart, args: any[], pluginOptions: PluginOptions) => {
  handlers = {
    wheel: (event: any) => wheelHandler(event, chart),
    touchstart: (event: any) => touchstartHandler(event, chart),
    touchend: (event: any) => touchendHandler(event, chart),
    click: (event: any) => clickHandker(event, chart),
  }
  chart.canvas.addEventListener('wheel', handlers.wheel,{ passive: false });
  chart.canvas.addEventListener('touchstart', handlers.touchstart,{ passive: true });
  chart.canvas.addEventListener('touchend', handlers.touchend,{ passive: true });
  chart.canvas.addEventListener('click', handlers.click,{ passive: true });
}

export const beforeUpdate = (chart: Chart, args: any[], pluginOptions: PluginOptions) => {
  handlers = {
    wheel: (event: any) => wheelHandler(event, chart),
    touchstart: (event: any) => touchstartHandler(event, chart),
    touchend: (event: any) => touchendHandler(event, chart),
    click: (event: any) => clickHandker(event, chart),
  }
}