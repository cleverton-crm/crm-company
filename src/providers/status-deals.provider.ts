import { StatusDeals, StatusSchema } from '../schemas/status-deals.schema';
import { BaseProvider } from './base.provider';

export const StatusDealsProviderSchema = BaseProvider(StatusDeals, StatusSchema);
