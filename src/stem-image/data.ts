import { ImageSize, DataRange, ImageDataChunk, ImageSourceEvent, ImageSourceEventHandler } from './types';

export interface ImageDataSource {
  getImageSize: () => ImageSize;
  getDataRange: () => DataRange;
  getImageData: () => Float64Array;
  getPixelData: (i: number, j: number) => number;
  subscribe: (fn: ImageSourceEventHandler) => any;
  unsubscribe: (fn: ImageSourceEventHandler) => any;
}

export class BaseImageDataSource {
  data: Float64Array;
  size: ImageSize;
  range: DataRange;
  observers: ImageSourceEventHandler[];

  constructor() {
    if (new.target === BaseImageDataSource) {
      throw new TypeError("Cannot instantiate the abstract class BaseImageDataSource");
    }
    this.data = new Float64Array([0]);
    this.size = {width: 1, height: 1};
    this.range = {min: 0, max: 0};
    this.observers = [];
  }

  getImageSize() : ImageSize {
    return this.size;
  }

  getImageData() : Float64Array {
    return this.data;
  }

  getDataRange() : DataRange {
    return this.range;
  }

  getPixelData(x: number, y: number) : number {
    const { width, height } = this.size;
    x = Math.floor(x);
    y = Math.floor(y);
    const idx = y * width + x;
    const n = width * height;
    if (idx >= n) {
      return 0.0;
    }
    return this.data[idx];
  }

  subscribe(fn: ImageSourceEventHandler) {
    this.observers.push(fn);
  }

  unsubscribe(fn: ImageSourceEventHandler) {
    this.observers = this.observers.filter(observer => observer !== fn);
  }

  protected emit(event: ImageSourceEvent) {
    this.observers.forEach((observer) => {observer(event)});
  }

  protected updateRange() {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < this.data.length; ++i) {
      const value = this.data[i];
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }
    this.range = {min, max};
  }
}

export class StreamImageDataSource extends BaseImageDataSource implements ImageDataSource {
  setImageSize(size: ImageSize) {
    const {width, height} = size;
    if (width !== this.size.width || height !== this.size.height) {
      this.data = new Float64Array(width * height);
      this.size = size;
      this.emit('sizeChanged');
    }
  }

  updateImageChunk(chunk: ImageDataChunk) {
    const {indexes, values} = chunk;
    const {width, height} = this.size;
    const n = width * height;

    if (indexes.length !== values.length) {
      return;
    }

    for(let i = 0; i < indexes.length; ++i) {
      if (indexes[i] < n) {
        this.data[indexes[i]] = values[i];
      }
    }

    this.updateRange();
    this.emit('dataChanged');
  }
}
