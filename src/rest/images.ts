import girderClient from '@openchemistry/girder-client';
import { AxiosResponse } from 'axios';

import { IImage } from '../types';

export function fetchImages() : Promise<IImage[]> {
  return girderClient().get('stem_images')
    .then((response: AxiosResponse<IImage[]>) => response.data);
}
