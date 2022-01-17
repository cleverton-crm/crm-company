import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Core } from 'crm-core';

@Schema({ timestamps: true })
export class Deals extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, default: null })
  author: string;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Number, default: 0 })
  fuelAmount: number;

  @Prop({ type: String, default: null })
  fuelType: string;

  @Prop({ type: String, default: null })
  fullname: string;

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: String, default: null })
  ownership: string;

  @Prop({ type: Map, default: {} })
  permissions: Map<string, any>;

  @Prop({ type: String, default: null })
  source: string;

  @Prop({ type: String, default: 'deals' })
  object: string;

  @Prop({ type: String, default: null })
  status: string | Core.Deals.Status;

  @Prop({ type: Number, default: 0 })
  sum: number;

  @Prop({ type: Array, default: [] })
  tags: Array<string> | [];

  @Prop({ type: Map, default: {} })
  history: Map<string, any>;
}
export type DealModel<T extends Document> = PaginateModel<Deals>;
export const DealSchema = SchemaFactory.createForClass(Deals);
export const DealModel: DealModel<Deals> = model<Deals>(
  'Deals',
  DealSchema,
) as DealModel<Deals>;
