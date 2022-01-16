import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Core } from 'crm-core';
import { v4 as uuidv4 } from 'uuid';
import { Document, model, PaginateModel } from 'mongoose';
import { LicensesData } from './leads.schema';

@Schema({ timestamps: false, _id: false, versionKey: false })
export class PassportClientData {
  @Prop({ type: Date, default: null })
  dateOfIssue: Date;
  @Prop({ type: String, default: null })
  issuedBy: string;
  @Prop({ type: String, default: null })
  passportSeries: string;
  @Prop({ type: String, default: null })
  passportNumber: string;
}

@Schema({ timestamps: true })
export class Clients extends Document implements Core.Client.Schema {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Map, default: null })
  attachments: Map<string, string>;

  @Prop({ type: Date, default: null })
  birthDate: Date;

  @Prop({ type: Map, default: {} })
  comments: Map<string, string>;

  @Prop({ type: String, default: null })
  company: string;

  @Prop({ type: Date, default: null })
  createData: Date;

  @Prop({ type: String, default: null })
  email: string;

  @Prop({ type: String, default: null })
  emailCompany: string;

  @Prop({ type: String, default: null })
  first: string;

  @Prop({ type: String, default: null })
  last: string;

  @Prop({ type: String, default: null })
  middle: string;

  @Prop({ type: String, default: 'client' })
  object: 'client';

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: String, default: null })
  payerType: string;

  @Prop({ type: Map, default: {} })
  permissions: Map<string, any>;

  @Prop({ type: Array, default: [] })
  phones: Array<string>;

  @Prop({ type: String, default: null })
  roleInCompany: string;

  @Prop({ type: Map, default: {} })
  socials: Map<string, string>;

  @Prop({ type: Map, default: {} })
  voices: Map<string, string>;

  @Prop({ type: String, default: null })
  workPhone: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: () => LicensesData, default: {} })
  licenses: LicensesData;

  @Prop({ type: () => PassportClientData, default: {} })
  passport: PassportClientData;
}
export type ClientModel<T extends Document> = PaginateModel<Clients>;
export const ClientSchema = SchemaFactory.createForClass(Clients);
export const ClientModel: ClientModel<Clients> = model<Clients>(
  'Clients',
  ClientSchema,
) as ClientModel<Clients>;
