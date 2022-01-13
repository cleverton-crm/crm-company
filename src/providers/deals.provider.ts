import { Deals, DealSchema } from '../schemas/deals.schema';

export const DealsProviderSchema = {
  name: Deals.name,
  useFactory: () => {
    return DealSchema;
  },
};
