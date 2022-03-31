import {
  ClientSchema,
  Clients,
  LeadClientsSchema,
  LeadClients,
  ClientsList,
  ClientsListSchema,
} from '../schemas/clients.schema';
import { BaseProvider } from './base.provider';

export const ClientsProviderSchema = BaseProvider(Clients, ClientSchema);
export const ClientsListProviderSchema = BaseProvider(ClientsList, ClientsListSchema);

export const LeadClientsProviderSchema = BaseProvider(LeadClients, LeadClientsSchema);
