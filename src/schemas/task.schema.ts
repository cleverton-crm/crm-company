import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: 'timetask' })
  object: string;

  @Prop({ type: String, default: '' })
  owner: string;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: String, default: '' })
  linkType: string;

  @Prop({ type: String, default: '' })
  linkId: string;

  @Prop({ type: Date, default: null })
  startDate: Date;

  @Prop({ type: Date, default: null })
  endDate: Date;
}

export type TaskModel<T extends Document> = PaginateModel<Task>;
export const TaskSchema = SchemaFactory.createForClass(Task);
export const TaskModel: TaskModel<Task> = model<Task>('Task', TaskSchema) as TaskModel<Task>;

@Schema({ collection: 'taskList' })
export class ListTask extends Task {}

export const ListTaskSchema = SchemaFactory.createForClass(ListTask);
export type ListTaskModel<T extends Document> = PaginateModel<ListTask>;
export const ListTaskModel: ListTaskModel<ListTask> = model<ListTask>(
  'ListTask',
  ListTaskSchema,
) as ListTaskModel<ListTask>;
