import { Leads, LeadSchema } from '../schemas/leads.schema';

export const LeadsProviderSchema = {
  name: Leads.name,
  useFactory: () => {
    return LeadSchema;
  },
};
