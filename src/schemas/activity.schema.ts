import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Map, default: {}, description: 'Название поля' })
  changelog: Map<string, any>;

  @Prop({ type: String, required: true })
  objectId: string;

  @Prop({ type: String, default: null })
  type: string;

  @Prop({ type: String, default: 'activity' })
  object: string;

  @Prop({ type: String, default: null })
  author: string;

  @Prop({ type: String, default: null })
  oldToken: string;

  @Prop({ type: String, default: null })
  newToken: string;
}
export type ActivityModel<T extends Document> = PaginateModel<Activity>;
export const ActivitySchema = SchemaFactory.createForClass(Activity);
export const ActivityModel: ActivityModel<Activity> = model<Activity>(
  'Activity',
  ActivitySchema,
) as ActivityModel<Activity>;
