import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class ParkCompany extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: String, default: null })
  company: string; // id компании

  @Prop({
    type: () => ParkCompanyObject,
    default: {},
  })
  objects: ParkCompanyObject[]; // Объекты парка

  @Prop({ type: Number, default: 0 })
  allCapacity: number; // Общая емкость

  @Prop({ type: Number, default: 0 })
  allConsumption: number; // Общее потребление
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class ParkCompanyObject {
  @Prop({ type: String, default: null })
  name: string; // Название

  @Prop({ type: String, default: null })
  address?: string; // Адрес

  @Prop({ type: String, default: null })
  havePump?: string; // Наличе насоса

  @Prop({ type: String, default: null })
  distance?: string; // Дистанция по бездорожью

  @Prop({
    type: () => ParkCompanyFuel,
    default: {},
  })
  fuels: ParkCompanyFuel[]; // Виды топлива

  @Prop({ type: Number, default: 0 })
  resultCapacity: number; // Емкость по объекту (складывается из всех видов топлива)

  @Prop({ type: Number, default: 0 })
  resultConsumption: number; // Потребление по объекту (складывается из всех видов топлива)
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class ParkCompanyFuel {
  @Prop({ type: String, default: null })
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
