import { ImageSize } from '../stem-image/types';

export enum FrameType {
  Raw = 'raw',
  Electron = 'electron'
};

export enum FieldStatus {
  Empty = 'empty',
  Fetching = 'fetching'
};

export interface ImageData {
  size: ImageSize;
  data: number[];
}

export interface IImage {
  _id: string;
  fileId: string;
  fields?: {
    [field: string]: ImageData | FieldStatus;
  },
  frames?: {
    [position: number]: ImageData;
    cumulated?: ImageData;
  },
  framesTypes?: FrameType[];
  framesSize?: ImageSize;
  created?: string;
  name?: string;
  size?: number;
}

export interface GirderFile {
  _id: string;
  created: string;
  name: string;
  size: number;
}
