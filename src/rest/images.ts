import { decodeStream } from '@msgpack/msgpack';

import girderClient from './client';
import { IImage, ImageData } from '../types';
import { ImageSize } from '../stem-image/types';

const PREFIX = 'stem_images';

async function extractImageData(stream: ReadableStream) : Promise<ImageData> {
  const decodedData: number[][] = [];

  for await (const chunk of decodeStream(stream) as AsyncIterableIterator<number[][]>) {
    chunk.forEach(row => decodedData.push(row));
  }
  const size: ImageSize = {
    height: decodedData.length,
    width: decodedData[0].length
  }
  const data: number[] = [];
  decodedData.forEach(row => row.forEach(el => data.push(el)));
  return {size, data};
}

export function fetchImages() : Promise<IImage[]> {
  return girderClient().get(PREFIX)
    .then(res => res.json());
}

export function fetchImageField(imageId: string, fieldName: string) : Promise<ImageData> {
  return girderClient().get(`${PREFIX}/${imageId}/${fieldName}`, {format: 'msgpack'})
    .then(res => extractImageData(res.body!));
}

export function fetchImageFrame(imageId: string, scanPosition: number, type: string) : Promise<ImageData> {
  return girderClient().get(`${PREFIX}/${imageId}/frames/${scanPosition}`, {type, format: 'msgpack'})
  .then(res => extractImageData(res.body!));
}
