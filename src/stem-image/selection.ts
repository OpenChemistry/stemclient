import { linearScale, Scale } from '@colormap/core';

import { MultiSubjectProducer } from './subject';
import { ImageDataSource } from './data';
import { Vec2, ImageSize } from './types';

const mousePositionToImagePosition = (ev: MouseEvent, canvas: HTMLCanvasElement) : Vec2 => {
  const rect = canvas.getBoundingClientRect();
  let x = (ev.clientX - rect.left) / rect.width;
  let y = (ev.clientY - rect.top) / rect.height;
  x = Math.min(1, Math.max(0, x));
  y = Math.min(1, Math.max(0, y));
  return [x, y];
};

const calculateP1 = (imagePosition: Vec2, size: ImageSize, p0: Vec2, min: number, max: number) : Vec2 => {
  const { width, height } = size;

  const p1 : Vec2 = [
    Math.floor(imagePosition[0] * width),
    Math.floor(imagePosition[1] * height)
  ];

  const sign = (m: number, n: number) : 1 | -1 => {
    return m >= n ? 1 : -1;
  }

  if (Math.abs(p1[0] - p0[0]) < min) {
    p1[0] = p0[0] + sign(p1[0], p0[0]) * min;
  }

  if (Math.abs(p1[1] - p0[1]) < min) {
    p1[1] = p0[1] + sign(p1[1], p0[1]) * min;
  }

  if (Math.abs(p1[0] - p0[0]) > max) {
    p1[0] = p0[0] + sign(p1[0], p0[0]) * max;
  }

  if (Math.abs(p1[1] - p0[1]) > max) {
    p1[1] = p0[1] + sign(p1[1], p0[1]) * max;
  }

  return p1;
}

export class SquareSelection extends MultiSubjectProducer {

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  p0: Vec2 = [0, 0];
  p1: Vec2 = [10, 20];
  xScale: Scale = linearScale([0, 1], [0, 1]);
  yScale: Scale = linearScale([0, 1], [0, 1]);

  constructor(private container: HTMLDivElement, private source: ImageDataSource) {
    super();
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.context = this.canvas.getContext('2d')!;
    this.container.appendChild(this.canvas);
    this.resize();
    this.sizeObserver = this.sizeObserver.bind(this);
    this.source.subscribe('sizeChanged', this.sizeObserver);

    let p0 : Vec2;
    let p1 : Vec2;

    this.canvas.addEventListener('mousedown', (ev) => {
      const imagePosition = mousePositionToImagePosition(ev, this.canvas);

      const {width, height} = this.source.getImageSize();

      p0 = [
        Math.floor(imagePosition[0] * width),
        Math.floor(imagePosition[1] * height)
      ];

      p1 = [p0[0], p0[1]];

      this.setSelection(p0, p1);

      const onMouseUp = (ev: MouseEvent) => {
        const imagePosition = mousePositionToImagePosition(ev, this.canvas);
        const p1 = calculateP1(imagePosition, this.source.getImageSize(), p0, 1, 9);
        this.setSelection(p0, p1);

        this.emit('selectionChanged', {p0, p1});

        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
      }

      const onMouseMove = (ev: MouseEvent) => {
        const imagePosition = mousePositionToImagePosition(ev, this.canvas);

        const newP1 = calculateP1(imagePosition, this.source.getImageSize(), p0, 1, 9);

        if (newP1[0] !== p1[0] || newP1[1] !== p1[1]) {
          this.setSelection(p0, newP1);
        }
      }

      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    });
  }

  removeSubscriptions() {
    this.source.unsubscribe('sizeChanged', this.sizeObserver);
  }

  sizeObserver() {
    this.resize();
  }

  resize() {
    const {width, height} = this.source.getImageSize();
    const {clientWidth, clientHeight} = this.container;
    this.xScale = linearScale([0, width], [0, clientWidth]);
    this.yScale = linearScale([0, height], [0, clientHeight]);
    this.canvas.width = clientWidth;
    this.canvas.height = clientWidth;
    this.draw();
  }

  draw() {
    const x = this.xScale(Math.min(this.p0[0], this.p1[0]));
    const y = this.yScale(Math.min(this.p0[1], this.p1[1]));
    const width = this.xScale(Math.max(this.p0[0], this.p1[0])) - x;
    const height = this.yScale(Math.max(this.p0[1], this.p1[1])) - y;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.strokeStyle = 'rgb(255, 0, 0)';
    this.context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.context.fillRect(x, y, width, height);
    this.context.strokeRect(x, y, width, height);
    // this.context.rect(x, y, width, height);
    // this.context.stroke();
    // this.context.fill();
  }

  setSelection(p0: Vec2, p1: Vec2) {
    this.p0 = p0;
    this.p1 = p1;
    this.draw();
  }
}