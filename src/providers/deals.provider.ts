import { Deals, DealSchema } from '../schemas/deals.schema';
import { BaseProvider } from './base.provider';

export const DealsProviderSchema = BaseProvider(Deals, DealSchema);
