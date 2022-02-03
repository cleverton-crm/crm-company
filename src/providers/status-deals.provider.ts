import { StatusDeals, StatusSchema } from '../schemas/status-deals.schema';

export const StatusDealsProviderSchema = {
  name: StatusDeals.name,
  useFactory: () => {
    return StatusSchema;
  },
};
