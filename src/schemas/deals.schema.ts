import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { StatusDeals, StatusSchema } from './status-deals.schema';

@Schema({ timestamps: false, _id: false, versionKey: false })
export class PassportData {
  @Prop({ type: Date, default: null })
  dateOfIssue: Date;
  @Prop({ type: String, default: null })
  issuedBy: string;
  @Prop({ type: String, default: null })
  passportSeriesAndNumber: string;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class LicensesData {
  @Prop({ type: String, default: null })
  adr: string;
  @Prop({ type: Array, default: [] })
  categories: string[];
  @Prop({ type: Date, default: null })
  validity: Date;
}

@Schema({ timestamps: true })
export class Deals extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Map, default: {} })
  comments: Map<string, any>;

  @Prop({ type: Map, default: {} })
  attachments: Map<string, any>;

  @Prop({ type: String, default: null })
  author: string;

  @Prop({ type: String, default: null, ref: 'Clients' })
  client: string;

  @Prop({ type: String, default: null })
  company: string;

  @Prop({ type: Date, default: null })
  createdAt: Date;

  @Prop({ type: String, default: null })
  currency: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: Date, default: null })
  endDate: Date;

  @Prop({ type: Map, default: {} })
  information: Map<string, any>;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: String, default: 'task' })
  object: string;

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: Map, default: {} })
  permissions: Map<string, any>;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: String, default: null })
  fuelType: string;

  @Prop({ type: Number, default: null })
  amountFuel: number;

  @Prop({ type: String, default: null })
  source: string;

  @Prop({ type: Date, default: null })
  startDate: Date;

  @Prop({ type: StatusSchema, default: {} })
  status?: StatusDeals;

  @Prop({ type: Boolean, default: false })
  final: boolean;

  @Prop({ type: Array, default: [] })
  tags: Array<string>;

  @Prop({ type: String, default: 'lead' })
  type: string;

  @Prop({ type: Date, default: null })
  updatedAt: Date;

  @Prop({ type: Array, default: [] })
  contacts: Array<any>;
}
export type DealModel<T extends Document> = PaginateModel<Deals>;
export const DealSchema = SchemaFactory.createForClass(Deals);
export const DealModel: DealModel<Deals> = model<Deals>(
  'Deals',
  DealSchema,
) as DealModel<Deals>;
