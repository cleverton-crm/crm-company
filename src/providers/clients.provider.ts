import { ClientSchema, Clients, LeadClientsSchema, LeadClients } from '../schemas/clients.schema';
import { BaseProvider } from './base.provider';

export const ClientsProviderSchema = BaseProvider(Clients, ClientSchema);

export const LeadClientsProviderSchema = BaseProvider(LeadClients, LeadClientsSchema);
