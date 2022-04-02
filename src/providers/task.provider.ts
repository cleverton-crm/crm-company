import { BaseProvider } from './base.provider';
import { Task, TaskSchema } from '../schemas/task.schema';

export const TaskProviderSchema = BaseProvider(Task, TaskSchema);
