import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class ParkCompany extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, default: '' })
  company: string; // id компании

  @Prop({
    type: Map,
    default: {},
  })
  store: Map<string, any>; // Объекты парка

  @Prop({ type: String, default: 'park' })
  object: string;

  @Prop({ type: String, default: '' })
  author: string;

  @Prop({ type: String, default: '' })
  owner: string;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class ParkCompanyObject {
  @Prop({ type: String, default: '' })
  name: string; // Название

  @Prop({ type: String, default: '' })
  address?: string; // Адрес

  @Prop({ type: Boolean, default: false })
  havePump?: boolean; // Наличе насоса

  @Prop({ type: String, default: null })
  distance?: string; // Дистанция по бездорожью

  @Prop({
    type: () => [ParkCompanyFuel],
    default: [],
  })
  fuels: ParkCompanyFuel[]; // Виды топлива

  @Prop({ type: Number, default: 0 })
  resultCapacity: number; // Емкость по объекту (складывается из всех видов топлива)

  @Prop({ type: Number, default: 0 })
  resultConsumption: number; // Потребление по объекту (складывается из всех видов топлива)
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class ParkCompanyFuel {
  @Prop({ type: String, default: '' })
  id: string;

  @Prop({ type: String, default: '' })
  name: string; // Тип топлива

  @Prop({ type: Number, default: 0 })
  capacity: number; // Емкость

  @Prop({ type: Number, default: 0 })
  consumption: number; // Потребление
}

export type ParkCompanyModel<T extends Document> = PaginateModel<ParkCompany>;
export const ParkCompanySchema = SchemaFactory.createForClass(ParkCompany);
export const ParkCompanyModel: ParkCompanyModel<ParkCompany> = model<ParkCompany>(
  'ParkCompany',
  ParkCompanySchema,
) as ParkCompanyModel<ParkCompany>;

@Schema({ collection: 'parkcompanyList' })
export class ParkCompanyList extends ParkCompany {}

export type ParkCompanyListModel<T extends Document> = PaginateModel<ParkCompanyList>;
export const ParkCompanyListSchema = SchemaFactory.createForClass(ParkCompanyList);
export const ParkCompanyListModel: ParkCompanyListModel<ParkCompanyList> = model<ParkCompanyList>(
  'ParkCompanyList',
  ParkCompanyListSchema,
) as ParkCompanyListModel<ParkCompanyList>;
