import { Cars, CarsSchema } from '../schemas/cars.schema';

export const CarsProviderSchema = {
  name: Cars.name,
  useFactory: () => {
    return CarsSchema;
  },
};
