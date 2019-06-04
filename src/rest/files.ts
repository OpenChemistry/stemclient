import girderClient from './client';
import { GirderFile } from '../types';

export function fetchFile(fileId: string) : Promise<GirderFile> {
  return girderClient().get(`file/${fileId}`)
    .then(res => res.json());
}
