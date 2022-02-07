import { Activity, ActivitySchema } from '../schemas/activity.schema';

export const ActivityProviderSchema = {
  name: Activity.name,
  useFactory: () => {
    return ActivitySchema;
  },
};
