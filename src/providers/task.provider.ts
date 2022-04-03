import { BaseProvider } from './base.provider';
import { ListTask, ListTaskSchema, Task, TaskSchema } from '../schemas/task.schema';

export const TaskProviderSchema = BaseProvider(Task, TaskSchema);

export const ListTaskProviderSchema = BaseProvider(ListTask, ListTaskSchema);
