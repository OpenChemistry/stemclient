import girderClient from '@openchemistry/girder-client';
import { AxiosResponse } from 'axios';
import { decode } from '@msgpack/msgpack';

import { IImage, ImageField } from '../types';
import { ImageSize } from '../stem-image/types';

const PREFIX = 'stem_images';

export function fetchImages() : Promise<IImage[]> {
  return girderClient().get(PREFIX)
    .then((response: AxiosResponse<IImage[]>) => response.data);
}

export function fetchImageField(imageId: string, fieldName: string) : Promise<ImageField> {
  return girderClient().get(`${PREFIX}/${imageId}/${fieldName}`, {responseType: 'arraybuffer', params: {format: 'msgpack'}})
    .then((response: AxiosResponse<ArrayBuffer>) => {
      const rawData = new Uint8Array(response.data);
      const decodedData = decode(rawData) as number[][];
      const size: ImageSize = {
        height: decodedData.length,
        width: decodedData[0].length
      }
      const data: number[] = [];
      decodedData.forEach(row => row.forEach(el => data.push(el)));
      return {size, data};
    })
}
