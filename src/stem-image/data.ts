import {
  ImageSize, DataRange, ImageDataChunk,
  ImageSourceEvent
} from './types';
import { StreamConnection } from './connection';
import { MultiSubject, IObserver } from './subject';

export interface ImageDataSource {
  getImageSize: () => ImageSize;
  getDataRange: () => DataRange;
  getImageData: () => Float64Array;
  getPixelData: (i: number, j: number) => number;
  subscribe: (event: ImageSourceEvent, observer: IObserver) => any;
  unsubscribe: (event: ImageSourceEvent, observer: IObserver) => any;
}

export class BaseImageDataSource extends MultiSubject {
  data: Float64Array;
  size: ImageSize;
  range: DataRange;

  constructor() {
    if (new.target === BaseImageDataSource) {
      throw new TypeError("Cannot instantiate the abstract class BaseImageDataSource");
    }
    super();
    this.data = new Float64Array([0]);
    this.size = {width: 1, height: 1};
    this.range = {min: 0, max: 0};
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
  private connection: StreamConnection | null = null;
  private sizeEvent: string = "";
  private dataEvent: string = "";

  constructor() {
    super();
    this.sizeObserver = this.sizeObserver.bind(this);
    this.dataObserver = this.dataObserver.bind(this);
  }

  setConnection(connection: StreamConnection, sizeEvent: string, dataEvent: string) {
    this.resetConnection();
    this.connection = connection;
    this.sizeEvent = sizeEvent;
    this.dataEvent = dataEvent;
    this.connection.subscribe(this.sizeEvent, this.sizeObserver);
    this.connection.subscribe(this.dataEvent, this.dataObserver);
  }

  resetConnection() {
    if (this.connection) {
      this.connection.unsubscribe(this.sizeEvent, this.sizeObserver);
      this.connection.unsubscribe(this.dataEvent, this.dataObserver);
    }
    this.connection = null;
  }

  private sizeObserver(message: any) {
    let {width, height} = message;
    width = parseInt(width);
    height = parseInt(height);
    this.setImageSize({width, height});
  }

  private dataObserver(message: any) {
    let {values, indexes} = message.data;
      values = new Float64Array(values);
      indexes = new Uint32Array(indexes);
      this.updateImageChunk({indexes, values});
  }

  private setImageSize(size: ImageSize) {
    const {width, height} = size;
    if (width !== this.size.width || height !== this.size.height) {
      this.data = new Float64Array(width * height);
      this.size = size;
      this.emit('sizeChanged', null);
    }
  }

  private updateImageChunk(chunk: ImageDataChunk) {
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
    this.emit('dataChanged', null);
  }
}
