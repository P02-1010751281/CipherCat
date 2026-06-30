export * from './convert';
export * from './measurement';
export * from './number';

import { CONVERT_BLOCK_TYPES, type ConvertBlockType } from './convert';
import { MEASUREMENT_BLOCK_TYPES, type MeasurementBlockType } from './measurement';
import { NUMBER_BLOCK_TYPES, type NumberBlockType } from './number';

export const DATA_BLOCK_TYPES = [
  ...CONVERT_BLOCK_TYPES,
  ...MEASUREMENT_BLOCK_TYPES,
  ...NUMBER_BLOCK_TYPES,
] as const;

export type DataBlockType = ConvertBlockType | MeasurementBlockType | NumberBlockType;
