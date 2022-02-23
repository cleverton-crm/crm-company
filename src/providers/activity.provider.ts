import { Activity, ActivitySchema } from '../schemas/activity.schema';

export const ActivityProviderSchema = {
  name: Activity.name,
  useFactory: () => {
    ActivitySchema.set('toJSON', { virtuals: true });
    ActivitySchema.set('toObject', { virtuals: true });

    return ActivitySchema;
  },
};
