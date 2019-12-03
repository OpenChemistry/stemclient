import {
  PipelineAggregation
} from './pipelines';

export type AggregationFunction = (aggregated: number, current: number) => number;

export const SumAggregation: AggregationFunction = (aggregated, current) => aggregated + current;

export const MaxAggregation: AggregationFunction = (aggregated, current) => Math.max(aggregated, current);

export const MinAggregation: AggregationFunction = (aggregated, current) => Math.min(aggregated, current);

export function getAggregationFunction(aggregation: PipelineAggregation) : AggregationFunction {
  switch (aggregation) {
    case PipelineAggregation.Max: {
      return SumAggregation;
    }
    case PipelineAggregation.Min: {
      return MinAggregation;
    }
    case PipelineAggregation.Sum:
    default: {
      return SumAggregation;
    }
  }
}
