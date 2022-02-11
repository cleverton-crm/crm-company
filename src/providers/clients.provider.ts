import mongoosePaginator = require('mongoose-paginate-v2');
import { Core } from 'crm-core';
import { ClientSchema, Clients, LeadClientsSchema, LeadClients } from '../schemas/clients.schema';
import { LeadCompanySchema } from '../schemas/company.schema';

export const ClientsProviderSchema = {
  name: Clients.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };
    ClientSchema.plugin(mongoosePaginator);

    ClientSchema.set('toJSON', { virtuals: true });
    ClientSchema.set('toObject', { virtuals: true });

    return ClientSchema;
  },
};

export const LeadClientsProviderSchema = {
  name: LeadClients.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };

    LeadClientsSchema.plugin(mongoosePaginator);

    LeadClientsSchema.set('toJSON', { virtuals: true });
    LeadClientsSchema.set('toObject', { virtuals: true });

    return LeadClientsSchema;
  },
};
