import { ServerField } from '../utils/forms';

export interface PipelineInfo {
  name: string;
  description: string;
  displayName: string;
  parameters: {[name: string]: ServerField};
  output: PipelineIO
}

export interface PipelineCreationData {
  id: string;
  name: string;
  pipelineId: string;
  workerId: string;
  info: PipelineInfo;
}

export interface PipelineExecutionData {
  rank: number;
  workerId: string;
  pipelineId: string;
  result: number[][];
  info: PipelineInfo;
}

export enum PipelineName {
  AnnularMask = 'annular'
}

export enum PipelineIO {
  Image = 'image',
  Frame = 'frame'
}
