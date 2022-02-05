import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;
}
export const ProfileSchema = SchemaFactory.createForClass(Profile);
