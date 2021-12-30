import mongoosePaginator = require('mongoose-paginate-v2');
import { Core } from 'crm-core';
import { ClientSchema, Clients } from '../schemas/clients.schema';

export const ClientsProviderSchema = {
  name: Clients.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };
    ClientSchema.plugin(mongoosePaginator);

    return ClientSchema;
  },
};
