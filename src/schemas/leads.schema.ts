import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { Core } from 'crm-core';
import { v4 as uuidv4 } from 'uuid';

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
export class Leads extends Document implements Core.Leads.Schema {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Map, default: {} })
  activity: Map<string, any>;

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
  source: string;

  @Prop({ type: Date, default: null })
  startDate: Date;

  @Prop({ type: String, default: null })
  status: string;

  @Prop({ type: Array, default: [] })
  tags: Array<string>;

  @Prop({ type: String, default: 'leads' })
  type: string;

  @Prop({ type: Date, default: null })
  updatedAt: Date;

  @Prop({ type: Array, default: [] })
  contacts: Array<any>;
}
export type LeadModel<T extends Document> = PaginateModel<Leads>;
export const LeadSchema = SchemaFactory.createForClass(Leads);
export const LeadModel: LeadModel<Leads> = model<Leads>(
  'Leads',
  LeadSchema,
) as LeadModel<Leads>;
