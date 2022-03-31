import { Cars, CarsList, CarsListSchema, CarsSchema } from '../schemas/cars.schema';
import { BaseProvider } from './base.provider';

export const CarsProviderSchema = BaseProvider(Cars, CarsSchema);
export const CarsListProviderSchema = BaseProvider(CarsList, CarsListSchema);
