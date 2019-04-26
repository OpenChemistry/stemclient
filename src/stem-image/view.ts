import { ImageDataSource } from './data';
import { Vec2 } from './types';

const linearScale = (domain: Vec2, range: Vec2) : (value: number) => number => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  return (value:number) : number => {
    return r0 + (r1 - r0) * ((value - d0) / (d1 - d0));
  }
};

export class ImageView {
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  imageData: ImageData;

  constructor(private container: HTMLDivElement, private source: ImageDataSource) {
    this.image = document.createElement('img');
    this.image.style.width = '100%';
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
    const {width, height} = this.source.getImageSize();
    const {min, max} = this.source.getDataRange();
    const data = this.source.getImageData();
    const grayScale = linearScale([min, max], [0, 255]);

    for (let i = 0; i < width * height; ++i) {
      const color = grayScale(data[i]);
      this.imageData.data[i * 4] = color;
      this.imageData.data[i * 4 + 1] = color;
      this.imageData.data[i * 4 + 2] = color;
      this.imageData.data[i * 4 + 3] = 255;
    }

    this.context.putImageData(this.imageData, 0, 0);
    this.image.src = this.canvas.toDataURL();
  }
}
