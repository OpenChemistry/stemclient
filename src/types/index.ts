import { ImageSize } from '../stem-image/types';

export type FieldName = 'bright' | 'dark';
export interface ImageField {
  size: ImageSize;
  data: number[];
}

export interface IImage {
  _id: string;
  fileId: string;
  fields?: {
    [field: string]: ImageField;
  }
}
