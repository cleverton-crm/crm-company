import { Cars, CarsSchema } from '../schemas/cars.schema';
import { BaseProvider } from './base.provider';

export const CarsProviderSchema = BaseProvider(Cars, CarsSchema);
