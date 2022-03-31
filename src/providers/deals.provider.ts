import { Deals, DealSchema, DealsList, DealsListSchema } from '../schemas/deals.schema';
import { BaseProvider } from './base.provider';

export const DealsProviderSchema = BaseProvider(Deals, DealSchema);
export const DealsListProviderSchema = BaseProvider(DealsList, DealsListSchema);
