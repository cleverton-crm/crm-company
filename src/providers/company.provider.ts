import {
  Companies,
  CompanySchema,
  LeadCompany,
  LeadCompanySchema,
  ListCompany,
  ListCompanySchema,
} from 'src/schemas/company.schema';
import { BaseProvider } from './base.provider';

export const CompanyProviderSchema = BaseProvider(Companies, CompanySchema);

export const ListCompanyProviderSchema = BaseProvider(ListCompany, ListCompanySchema);

export const LeadCompanyProviderSchema = BaseProvider(LeadCompany, LeadCompanySchema);
