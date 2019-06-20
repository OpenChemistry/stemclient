import { linearScale, Scale } from '@colormap/core';

import { MultiSubjectProducer } from './subject';
import { ImageDataSource } from './data';
import { Vec2, Vec4, ImageSize } from './types';

const mousePositionToImagePosition = (ev: MouseEvent, canvas: HTMLCanvasElement) : Vec2 => {
  const rect = canvas.getBoundingClientRect();
  let x = (ev.clientX - rect.left) / rect.width;
  let y = (ev.clientY - rect.top) / rect.height;
  x = Math.min(1, Math.max(0, x));
  y = Math.min(1, Math.max(0, y));
  return [x, y];
};

const positionToColor = (position: Vec2, canvas: HTMLCanvasElement) : Vec4 => {
  const context = canvas.getContext('2d')!;
  const x = Math.floor(position[0] * canvas.width);
  const y = Math.floor(position[1] * canvas.height);
  const color = context.getImageData(x, y, 1, 1).data;
  return [color[0], color[1], color[2], color[3]];
}

const constrain = (p0: Vec2, p1: Vec2, min: number, max: number) : Vec2 => {
  const sign = (m: number, n: number) : 1 | -1 => {
    return m >= n ? 1 : -1;
  }

  p1 = [p1[0], p1[1]];

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

const imageToCanvas = (imagePosition: Vec2, size: ImageSize) : Vec2 => {
  const { width, height } = size;

  const p1 : Vec2 = [
    Math.floor(imagePosition[0] * width),
    Math.floor(imagePosition[1] * height)
  ];

  return p1;
}

export const calculateDistance = (p0: number[], p1: number[]) : number => {
  if (p0.length !== p1.length) {
    return -1;
  }
  const dr = p0.map((v0, i) => v0 - p1[i]);
  return Math.sqrt(dr.reduce((d2, d) => {
    d2 += d * d;
    return d2;
  }, 0));
}

const normalize = (vec: number[], length: number = 1) : number[] => {
  const sum = vec.reduce((total, value) => {
    total += value * value;
    return total;
  }, 0);
  const scale = length / Math.sqrt(sum);
  return vec.map(val => scale * val);
}

class BaseHandle {
  constructor(protected colorId: number, protected position: Vec2 = [0, 0]) {}

  getPosition() : Vec2 {
    return this.position;
  }

  setPosition(position: Vec2) {
    this.position = position;
  }

  getColorId() : number {
    return this.colorId;
  }

  setColorId(colorId: number) {
    this.colorId = colorId;
  }

  draw(drawContext: CanvasRenderingContext2D, interactionContext: CanvasRenderingContext2D, _xScale: Scale, _yScale: Scale) {
    drawContext.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    drawContext.fillStyle = 'rgba(255, 255, 255, 0.8)';
    interactionContext.fillStyle = `rgb(${this.colorId}, ${this.colorId}, ${this.colorId})`;
  }
}

class SquareHandle extends BaseHandle {
  draw(drawContext: CanvasRenderingContext2D, interactionContext: CanvasRenderingContext2D, xScale: Scale, yScale: Scale) {
    super.draw(drawContext, interactionContext, xScale, yScale);
    const size = 8;
    const x = xScale(this.getPosition()[0]) - size / 2;
    const y = yScale(this.getPosition()[1]) - size / 2;

    drawContext.fillRect(x, y, size, size);
    drawContext.strokeRect(x, y, size, size);
    interactionContext.fillRect(x, y, size, size);
  }
}

class CircleHandle extends BaseHandle {
  draw(drawContext: CanvasRenderingContext2D, interactionContext: CanvasRenderingContext2D, xScale: Scale, yScale: Scale) {
    super.draw(drawContext, interactionContext, xScale, yScale);
    const size = 8;
    const x = xScale(this.getPosition()[0]);
    const y = yScale(this.getPosition()[1]);

    drawContext.beginPath();
    drawContext.arc(x, y, size / 2, 0, 2 * Math.PI);
    drawContext.fill();
    drawContext.stroke();

    interactionContext.beginPath();
    interactionContext.arc(x, y, size / 2, 0, 2 * Math.PI);
    interactionContext.fill();
  }
}

export class BaseSelection extends MultiSubjectProducer {

  container: HTMLDivElement;
  drawCanvas: HTMLCanvasElement;
  interactionCanvas: HTMLCanvasElement;
  drawContext: CanvasRenderingContext2D;
  interactionContext: CanvasRenderingContext2D;
  xScale: Scale = linearScale([0, 1], [0, 1]);
  yScale: Scale = linearScale([0, 1], [0, 1]);
  handles: {[colorId: number]: BaseHandle} = {};
  moving?: BaseHandle;

  constructor(private parent: HTMLDivElement, protected source: ImageDataSource) {
    super();
    this.container = document.createElement('div');
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.position = 'relative';
    this.drawCanvas = document.createElement('canvas');
    this.drawCanvas.style.width = '100%';
    this.drawCanvas.style.height = '100%';
    this.drawCanvas.style.position = 'absolute';
    this.drawContext = this.drawCanvas.getContext('2d')!;
    this.interactionCanvas = document.createElement('canvas');
    this.interactionCanvas.style.width = '100%';
    this.interactionCanvas.style.height = '100%';
    this.interactionCanvas.style.position = 'absolute';
    this.interactionCanvas.style.display = 'none';
    this.interactionContext = this.interactionCanvas.getContext('2d')!;
    this.container.appendChild(this.drawCanvas);
    this.container.appendChild(this.interactionCanvas);
    this.parent.appendChild(this.container);
    this.resize();
    this.sizeObserver = this.sizeObserver.bind(this);
    this.source.subscribe('sizeChanged', this.sizeObserver);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.drawCanvas.addEventListener('mousedown', (ev) => {
      const imagePosition = mousePositionToImagePosition(ev, this.drawCanvas);
      const color = positionToColor(imagePosition, this.interactionCanvas);
      const colorId = color[0];
      const hit = color[3] === 255;
      this.onMouseDown(imagePosition, colorId, hit);

      const onMouseUp = (ev: MouseEvent) => {
        const imagePosition = mousePositionToImagePosition(ev, this.drawCanvas);
        this.onMouseUp(imagePosition, colorId);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
      }

      const onMouseMove = (ev: MouseEvent) => {
        const imagePosition = mousePositionToImagePosition(ev, this.drawCanvas);
        this.onMouseMove(imagePosition, colorId);
      }

      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    });
  }

  removeSubscriptions() {
    this.source.unsubscribe('sizeChanged', this.sizeObserver);
  }

  sizeObserver() {
    setTimeout(() => {
      this.resize();
    }, 250);
  }

  resize() {
    const {width, height} = this.source.getImageSize();
    const {clientWidth, clientHeight} = this.container;
    this.xScale = linearScale([0, width], [0, clientWidth]);
    this.yScale = linearScale([0, height], [0, clientHeight]);
    this.drawCanvas.width = clientWidth;
    this.drawCanvas.height = clientHeight;
    this.interactionCanvas.width = clientWidth;
    this.interactionCanvas.height = clientHeight;
    this.draw();
  }

  draw() {
    this.drawContext.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    this.interactionContext.clearRect(0, 0, this.interactionCanvas.width, this.interactionCanvas.height);
  }

  drawHandles() {
    for (let handle of Object.values(this.handles)) {
      handle.draw(this.drawContext, this.interactionContext, this.xScale, this.yScale);
    }
  }

  setHandles(positions: Vec2[]) {
    const handles = Object.values(this.handles);
    if (positions.length > handles.length) {
      return;
    }
    for (let i in handles) {
      handles[i].setPosition(positions[i]);
    }
    this.draw();
  }

  onMouseDown(_position: Vec2, _colorId: number, hit: boolean) {}

  onMouseMove(_position: Vec2, _colorId: number) {}

  onMouseUp(_position: Vec2, _colorId: number) {}
}


export class SquareSelection extends BaseSelection {
  private moveHandle: BaseHandle;
  private sizeHandle: BaseHandle;

  constructor(parent: HTMLDivElement, source: ImageDataSource) {
    super(parent, source);
    this.moveHandle = new SquareHandle(0, [0, 0]);
    this.sizeHandle = new CircleHandle(1, [0, 0]);
    this.handles[0] = this.moveHandle;
    this.handles[1] = this.sizeHandle;
  }

  onMouseDown(position: Vec2, colorId: number, hit: boolean) {
    if (hit && colorId === 255) {
      this.moving = undefined;
      return;
    }

    const handle = this.handles[colorId];

    if (hit && handle) {
      this.moving = handle;
    } else {
      const {width, height} = this.source.getImageSize();
      let p0 : Vec2 = [
        Math.floor(position[0] * width),
        Math.floor(position[1] * height)
      ];

      this.moveHandle.setPosition(p0);
      this.sizeHandle.setPosition(p0);

      this.moving = this.sizeHandle;
      this.draw();
    }
  }

  onMouseMove(position: Vec2, colorId: number) {
    if (!this.moving) {
      return;
    }

    if (this.moving === this.moveHandle) { // Translating
      const {width, height} = this.source.getImageSize();
      const p0 = this.moveHandle.getPosition();
      const newP0 : Vec2 = [
        Math.round(position[0] * width),
        Math.round(position[1] * height)
      ];
      if (newP0[0] !== p0[0] || newP0[1] !== p0[1]) {
        const newP1 = [...this.sizeHandle.getPosition()] as Vec2;
        newP1[0] += newP0[0] - p0[0];
        newP1[1] += newP0[1] - p0[1];
        this.moveHandle.setPosition(newP0);
        this.sizeHandle.setPosition(newP1);
        this.draw();
      }
    } else { // Resizing
      const p0 = this.moveHandle.getPosition();
      const p1 = this.sizeHandle.getPosition();
      let newP1 = imageToCanvas(position, this.source.getImageSize());
      newP1 = constrain(p0, newP1, 0, 10);

      if (newP1[0] !== p1[0] || newP1[1] !== p1[1]) {
        this.sizeHandle.setPosition(newP1);
        this.draw();
      }
    }
  }

  onMouseUp(position: Vec2, colorId: number) {
    if (!this.moving) {
      return;
    }

    const p1 = constrain(this.moveHandle.getPosition(), this.sizeHandle.getPosition(), 1, 10);
    this.sizeHandle.setPosition(p1);
    this.draw();
    this.emit('selectionChanged', Object.values(this.handles).map(handle => handle.getPosition()));
  }

  draw() {
    super.draw();

    if (!this.handles[0] || !this.handles[1]) {
      return;
    }

    const p0 = this.handles[0].getPosition();
    const p1 = this.handles[1].getPosition();
    const x = this.xScale(Math.min(p0[0], p1[0]));
    const y = this.yScale(Math.min(p0[1], p1[1]));
    const width = this.xScale(Math.max(p0[0], p1[0])) - x;
    const height = this.yScale(Math.max(p0[1], p1[1])) - y;

    this.drawContext.strokeStyle = 'rgb(255, 0, 0)';
    this.drawContext.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.drawContext.fillRect(x, y, width, height);
    this.drawContext.strokeRect(x, y, width, height);

    this.interactionContext.fillStyle = 'rgba(255, 255, 255, 255)';
    this.interactionContext.fillRect(x, y, width, height);

    this.drawHandles();
  }

  setSelection(p0: Vec2, p1: Vec2) {
    this.handles[0].setPosition(p0);
    this.handles[1].setPosition(p1);
    this.draw();
  }
}


export class CircleSelection extends BaseSelection {
  private centerHandle: BaseHandle;
  private radiusHandle: BaseHandle;

  constructor(parent: HTMLDivElement, source: ImageDataSource) {
    super(parent, source);
    this.centerHandle = new SquareHandle(0, [0, 0]);
    this.radiusHandle = new CircleHandle(1, [0, 0]);
    this.handles[0] = this.centerHandle;
    this.handles[1] = this.radiusHandle;
  }

  onMouseDown(position: Vec2, colorId: number, hit: boolean) {
    if (hit && colorId === 255) {
      this.moving = undefined;
      return;
    }

    const handle = this.handles[colorId];

    if (hit && handle) {
      this.moving = handle;
    } else {
      const {width, height} = this.source.getImageSize();
      let center : Vec2 = [
        Math.round(position[0] * width),
        Math.round(position[1] * height)
      ];

      this.centerHandle.setPosition(center);
      this.radiusHandle.setPosition(center);

      this.moving = this.radiusHandle;
      this.draw();
    }
  }

  onMouseMove(position: Vec2, colorId: number) {
    if (!this.moving) {
      return;
    }

    const {width, height} = this.source.getImageSize();

    if (this.moving === this.centerHandle) {
      const oldCenter = this.centerHandle.getPosition();
      const newCenter : Vec2 = [
        Math.round(position[0] * width),
        Math.round(position[1] * height)
      ];
      if (newCenter[0] !== oldCenter[0] || newCenter[1] !== oldCenter[1]) {
        const radiusPosition = [...this.radiusHandle.getPosition()] as Vec2;
        radiusPosition[0] += newCenter[0] - oldCenter[0];
        radiusPosition[1] += newCenter[1] - oldCenter[1];
        this.centerHandle.setPosition(newCenter);
        this.radiusHandle.setPosition(radiusPosition);
        this.draw();
      }
    } else {
      const center = this.centerHandle.getPosition();
      let radiusPosition : Vec2 = [
        position[0] * width,
        position[1] * height
      ];
      let diff = this.centerHandle.getPosition().map((c, i) => radiusPosition[i] - c);
      const distance = Math.round(calculateDistance(center, radiusPosition));
      diff = normalize(diff, distance);
      radiusPosition = this.centerHandle.getPosition().map((c, i) => c + diff[i]) as Vec2;
      this.radiusHandle.setPosition(radiusPosition);
      this.draw();
    }
  }

  onMouseUp(position: Vec2, colorId: number) {
    if (!this.moving) {
      return;
    }
    this.emit('selectionChanged', Object.values(this.handles).map(handle => handle.getPosition()));
  }

  draw() {
    super.draw();

    if (!this.centerHandle || !this.radiusHandle) {
      return;
    }

    const center = this.centerHandle.getPosition();
    const radius = calculateDistance(center, this.radiusHandle.getPosition());

    const x = this.xScale(center[0]);
    const y = this.yScale(center[1]);
    const r = this.xScale(radius);

    this.drawContext.strokeStyle = 'rgb(255, 0, 0)';
    this.drawContext.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.drawContext.beginPath();
    this.drawContext.arc(x, y, r, 0, 2 * Math.PI);
    this.drawContext.fill();
    this.drawContext.stroke();

    this.interactionContext.fillStyle = 'rgba(255, 255, 255, 255)';
    this.interactionContext.beginPath();
    this.interactionContext.arc(x, y, r, 0, 2 * Math.PI);
    this.interactionContext.fill();

    this.drawHandles();
  }

  setSelection(p0: Vec2, p1: Vec2) {
    this.handles[0].setPosition(p0);
    this.handles[1].setPosition(p1);
    this.draw();
  }
}
