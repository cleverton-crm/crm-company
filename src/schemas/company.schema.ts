import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Company } from 'crm-core';

@Schema({ timestamps: true })
export class Companies extends Document implements Company.CompanySchema {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;
  @Prop({ type: String, default: null })
  name: string;
  companyId: string;
  data: Company.Requisites.CompanyUs;
  unrestricted_value: string;
  value: string;
}
export type CompanyModel<T extends Document> = PaginateModel<Companies>;
export const CompanySchema = SchemaFactory.createForClass(Companies);
export const CompanyModel: CompanyModel<Companies> = model<Companies>(
  'Companies',
  CompanySchema,
) as CompanyModel<Companies>;
