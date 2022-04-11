import { Activity, ActivitySchema, ListActivity, ListActivitySchema } from '../schemas/activity.schema';
import { BaseProvider } from './base.provider';

export const ActivityProviderSchema = BaseProvider(Activity, ActivitySchema);
export const ListActivityProviderSchema = BaseProvider(ListActivity, ListActivitySchema);
