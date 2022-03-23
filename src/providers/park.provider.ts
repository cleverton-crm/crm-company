import { BaseProvider } from './base.provider';
import { ParkCompany, ParkCompanySchema } from '../schemas/park.schema';

export const ParkCompanyProviderSchema = BaseProvider(ParkCompany, ParkCompanySchema);
