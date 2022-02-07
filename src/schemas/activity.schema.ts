import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;
  @Prop({ name: String, default: null })
  fieldName: string;
  old: any;
  new: any;
  @Prop({ name: String, default: null })
  owner: string;
}
export const ActivitySchema = SchemaFactory.createForClass(Activity);
