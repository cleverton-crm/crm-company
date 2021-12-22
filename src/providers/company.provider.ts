import { Companies, CompanySchema } from 'src/schemas/company.schema';
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

    return CompanySchema;
  },
};
