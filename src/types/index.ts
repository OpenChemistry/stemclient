import { ImageSize } from '../stem-image/types';

export type FieldName = 'bright' | 'dark';
export type FrameType = 'raw' | 'electron';
export interface ImageData {
  size: ImageSize;
  data: number[];
}

export interface IImage {
  _id: string;
  fileId: string;
  fields?: {
    [field: string]: ImageData;
  },
  frames?: {
    [position: number]: ImageData;
    cumulated?: ImageData;
  },
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
