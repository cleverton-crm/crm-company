import { Activity, ActivitySchema } from '../schemas/activity.schema';
import { BaseProvider } from './base.provider';

export const ActivityProviderSchema = BaseProvider(Activity, ActivitySchema);
