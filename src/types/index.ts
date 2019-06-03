import { ImageSize } from '../stem-image/types';

export type FieldName = 'bright' | 'dark';
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
  }
}
