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

  @Prop({ type: Date, default: new Date() })
  birthDate: Date;

  @Prop({ type: String, default: null })
  comments: string;

  @Prop({ type: Number, default: 0 })
  status: number;

  @Prop({ type: String, default: null })
  companyRole: string | Core.Leads.CompanyRole;

  @Prop({ type: String, default: null })
  corporateEmail: string;

  @Prop({ type: String, default: null })
  delivery: string;

  @Prop({ type: String, default: null })
  fullname: string;

  @Prop({ type: String, default: null })
  mobilePhone: string;

  @Prop({ type: String, default: 'lead' })
  object: 'lead';

  @Prop({ type: String, default: null })
  mobilePhone2: string;

  @Prop({ type: String, default: null })
  mobilePhone3: string;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: () => PassportData, default: {} })
  passport: PassportData;

  @Prop({ type: () => LicensesData, default: {} })
  licenses: LicensesData;

  @Prop({ type: String, default: null })
  payerType: string | Core.Company.Ownership;

  @Prop({ type: Map, default: {} })
  permissions: Map<string, any>;

  @Prop({ type: String, default: null })
  personalEmail: string;

  @Prop({ type: String, default: null })
  position: string;

  @Prop({ type: String, default: null })
  skype: string;

  @Prop({ type: String, default: null })
  source: string;

  @Prop({ type: String, default: null })
  workPhone: string;
}
export type LeadModel<T extends Document> = PaginateModel<Leads>;
export const LeadSchema = SchemaFactory.createForClass(Leads);
export const LeadModel: LeadModel<Leads> = model<Leads>(
  'Leads',
  LeadSchema,
) as LeadModel<Leads>;
