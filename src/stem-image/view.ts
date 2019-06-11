import { linearScale, RGBColor, createColorMap, createOpacityMap, createColorOpacityMap} from '@colormap/core';

import { ImageDataSource } from './data';

export class ImageView {
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  imageData: ImageData;
  colors: RGBColor[] = [[0, 0, 0], [255, 255, 255]];

  constructor(private container: HTMLDivElement, private source: ImageDataSource) {
    this.image = document.createElement('img');
    this.image.style.width = '100%';
    this.setInterpolation(false);
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.container.appendChild(this.image);
    this.imageData = new ImageData(1, 1);
    this.resize();
    this.draw();
    this.sizeObserver = this.sizeObserver.bind(this);
    this.dataObserver = this.dataObserver.bind(this);
    this.source.subscribe('sizeChanged', this.sizeObserver);
    this.source.subscribe('dataChanged', this.dataObserver);
  }

  unsubscribe() {
    this.source.unsubscribe('sizeChanged', this.sizeObserver);
    this.source.unsubscribe('dataChanged', this.dataObserver);
  }

  sizeObserver() {
    this.resize();
  }

  dataObserver() {
    this.draw();
  }

  resize() {
    const {width, height} = this.source.getImageSize();
    this.canvas.width = width;
    this.canvas.height = height;
    this.imageData = new ImageData(width, height);
  }

  draw() {
    const {min, max} = this.source.getDataRange();
    const data = this.source.getImageData();
    const scale = linearScale([min, max], [0, 1]);
    const colorMap = createColorMap(this.colors, scale);
    const opacityMap = createOpacityMap([1], scale);
    const colorOpacityMap = createColorOpacityMap(colorMap, opacityMap);

    data.forEach((d, i) => {
      colorOpacityMap(d)
        .map(v => v * 255)
        .forEach((c, j) => {
          this.imageData.data[i * 4 + j] = c;
        });
    });

    this.context.putImageData(this.imageData, 0, 0);

    if (this.imageData.width * this.imageData.height <= 1) {
      this.image.src = '';
    } else {
      this.image.src = this.canvas.toDataURL();
    }
  }

  setColorMap(colors: RGBColor[]) {
    this.colors = colors;
    this.draw();
  }

  setInterpolation(enable: boolean) {
    if (enable) {
      this.image.style.setProperty('image-rendering', 'auto');
    } else {
      this.image.style.setProperty('image-rendering', '-webkit-crisp-edges');
      this.image.style.setProperty('image-rendering', '-moz-crisp-edges');
      this.image.style.setProperty('image-rendering', 'pixelated');
    }
  }
}
