import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Core } from 'crm-core';
import {
  CompanyBank,
  CompanyRequisitesCompanyName,
} from './nested-company.schema';

@Schema({ timestamps: true })
export class Companies extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Array, default: [] })
  clients: Array<string>;

  @Prop({ type: String, default: null })
  companyLocation: string;

  @Prop({ type: String, default: null })
  employeesCount: number;

  @Prop({ type: String, default: null })
  factLocation: string;

  @Prop({ type: String, default: null })
  fax: string;

  @Prop({ type: () => CompanyBank, default: {} })
  bank: CompanyBank;

  @Prop({ type: String, default: 'company' })
  object: 'company';

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: String, default: null })
  ownership: string | Core.Company.Ownership;

  @Prop({ type: String, default: null })
  permissions: string;

  @Prop({ type: String, default: null })
  phoneNumber: string;

  @Prop({ type: Array, default: [] })
  phones: Array<string>;

  @Prop({ type: String, default: null })
  postLocation: string;

  @Prop({ type: () => CompanyRequisitesCompanyName, default: {} })
  requisites: CompanyRequisitesCompanyName;

  @Prop({ type: String, default: null })
  source: string;

  @Prop({ type: Array, default: [] })
  tags: Array<string>;

  @Prop({ type: String, default: null })
  web: string;
}
export type CompanyModel<T extends Document> = PaginateModel<Companies>;
export const CompanySchema = SchemaFactory.createForClass(Companies);
export const CompanyModel: CompanyModel<Companies> = model<Companies>(
  'Companies',
  CompanySchema,
) as CompanyModel<Companies>;

@Schema({ collection: 'companyList' })
export class ListCompany extends Companies {}
export const ListCompanySchema = SchemaFactory.createForClass(ListCompany);
