import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class StatusDeals extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: false })
  locked: boolean;

  @Prop({ type: Boolean, default: true })
  public: boolean;

  @Prop({ type: Number, default: 1 })
  priority: number;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: String, default: null })
  color: string;

  @Prop({ type: String, default: null })
  owner: string;
}
export const StatusSchema = SchemaFactory.createForClass(StatusDeals);
