import {
  Companies,
  CompanySchema,
  LeadCompany,
  LeadCompanySchema,
  ListCompany,
  ListCompanySchema,
} from 'src/schemas/company.schema';
import mongoosePaginator = require('mongoose-paginate-v2');
import { Core } from 'crm-core';

export const CompanyProviderSchema = {
  name: Companies.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };
    CompanySchema.plugin(mongoosePaginator);

    CompanySchema.set('toJSON', { virtuals: true });
    CompanySchema.set('toObject', { virtuals: true });

    return CompanySchema;
  },
};

export const ListCompanyProviderSchema = {
  name: ListCompany.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };
    ListCompanySchema.plugin(mongoosePaginator);

    ListCompanySchema.set('toJSON', { virtuals: true });
    ListCompanySchema.set('toObject', { virtuals: true });

    return ListCompanySchema;
  },
};

export const LeadCompanyProviderSchema = {
  name: LeadCompany.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };
    LeadCompanySchema.plugin(mongoosePaginator);

    LeadCompanySchema.set('toJSON', { virtuals: true });
    LeadCompanySchema.set('toObject', { virtuals: true });

    return LeadCompanySchema;
  },
};
