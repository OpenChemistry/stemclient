import girderClient from './client';
import { IImage, FrameType } from '../types';
import { ImageSize } from '../stem-image/types';

const PREFIX = 'stem_images';

export function fetchImages() : Promise<IImage[]> {
  return girderClient().get(PREFIX)
    .then(res => res.json());
}

export function fetchImage(imageId: string) : Promise<IImage> {
  return girderClient().get(`${PREFIX}/${imageId}`)
    .then(res => res.json());
}

export function fetchImageFieldNames(imageId: string) : Promise<string[]> {
  return girderClient().get(`${PREFIX}/${imageId}/names`)
    .then(res => res.json());
}

export function fetchImageFieldSize(imageId: string, fieldName: string) : Promise<ImageSize> {
  return girderClient().get(`${PREFIX}/${imageId}/${fieldName}/shape`)
    .then(res => res.json())
    .then(([height, width]: number[]) => ({height, width}));
}

export function fetchImageField(imageId: string, fieldName: string) : Promise<ReadableStream> {
  return girderClient().get(`${PREFIX}/${imageId}/${fieldName}`, {format: 'msgpack'})
    .then(res => res.body!);
}

export function fetchImageFrameTypes(imageId: string) : Promise<FrameType[]> {
  return girderClient().get(`${PREFIX}/${imageId}/frames/types`)
    .then(res => res.json());
}

export function fetchImageFrameSize(imageId: string, type: FrameType) : Promise<ImageSize> {
  return girderClient().get(`${PREFIX}/${imageId}/frames/shape`, {type})
    .then(res => res.json())
    .then(([height, width]: number[]) => ({height, width}));
}

export function fetchImageFrame(imageId: string, scanPosition: number, type: FrameType) : Promise<ReadableStream> {
  return girderClient().get(`${PREFIX}/${imageId}/frames/${scanPosition}`, {type, format: 'msgpack'})
    .then(res => res.body!);
}
