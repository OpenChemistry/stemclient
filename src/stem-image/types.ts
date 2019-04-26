export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type ImageSize = {width: number, height: number};
export type DataRange = {min: number, max: number};
export type ImageDataChunk = {indexes: Uint32Array, values: Float64Array};
export type ImageSourceEvent = 'sizeChanged' | 'dataChanged';
