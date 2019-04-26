import { ImageDataSource } from './data';
import { Vec2, Vec3 } from './types';

const linearScale = (domain: Vec2, range: Vec2) : (value: number) => number => {
  let [d0, d1] = domain;
  const [r0, r1] = range;
  if (Math.abs(d0 - d1) < Number.EPSILON) {
    d1 = d0 + 1;
  }
  return (value:number) : number => {
    return r0 + (r1 - r0) * ((value - d0) / (d1 - d0));
  }
};

function valueToColor(value: number, colorMap: Vec3[]) : Vec3 {
  let indexFloat = (colorMap.length - 1) * value;
  if (indexFloat <= 0) {
    return colorMap[0];
  } else if (indexFloat >= colorMap.length - 1) {
    return colorMap[colorMap.length - 1];
  }

  let index = Math.floor(indexFloat);
  let delta = indexFloat - index;

  let color : Vec3 = [
    (1 - delta) * colorMap[index][0] + delta * colorMap[index + 1][0],
    (1 - delta) * colorMap[index][1] + delta * colorMap[index + 1][1],
    (1 - delta) * colorMap[index][2] + delta * colorMap[index + 1][2],
  ]
  return color;
}

export class ImageView {
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  imageData: ImageData;
  colorMap: Vec3[] = [[0, 0, 0], [255, 255, 255]];

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
    const scale = linearScale([min, max], [0, 1]);

    for (let i = 0; i < width * height; ++i) {
      const value = scale(data[i]);
      const color = valueToColor(value, this.colorMap)
      this.imageData.data[i * 4] = color[0] * 255;
      this.imageData.data[i * 4 + 1] = color[1] * 255;
      this.imageData.data[i * 4 + 2] = color[2] * 255;
      this.imageData.data[i * 4 + 3] = 255;
    }

    this.context.putImageData(this.imageData, 0, 0);
    this.image.src = this.canvas.toDataURL();
  }

  setColorMap(colorMap: Vec3[]) {
    this.colorMap = colorMap;
    this.draw();
  }
}
