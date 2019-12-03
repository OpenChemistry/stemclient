import { ServerField } from '../utils/forms';

export interface PipelineInfo {
  name: string;
  description: string;
  displayName: string;
  parameters: {[name: string]: ServerField};
  input: PipelineIO;
  output: PipelineIO;
  aggregation: PipelineAggregation;
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
  AnnularMask = 'annular',
  MaximumDiffraction = 'maximum_diffraction'
}

export enum PipelineIO {
  Image = 'image',
  Frame = 'frame'
}

export enum PipelineAggregation {
  Sum = 'sum',
  Max = 'max',
  Min = 'min'
}
