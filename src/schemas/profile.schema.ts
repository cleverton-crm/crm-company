import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: String, default: null })
  firstName: string | null;

  @Prop({ type: String, default: null })
  lastName: string | null;

  @Prop({ type: String, default: null })
  middleName: string | null;
}
export const ProfileSchema = SchemaFactory.createForClass(Profile);
export type ProfileModel<T extends Document> = PaginateModel<T>;
export const ProfileModel: ProfileModel<Profile> = model<Profile>('Profile', ProfileSchema) as ProfileModel<Profile>;
