import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CarsVehicleData {
  tractor: string;
  semitrailer: string;
}

@Schema({ timestamps: true })
export class Cars extends Document {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ type: Map, default: {}, description: 'Модель авто', changelog: 'Изменение модели авто' })
  model: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Тип ТС', changelog: 'Изменение типа ТС' })
  typeTS: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'ВИН', changelog: 'Изменение ВИН' })
  vin: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Калибровка', changelog: 'Изменение калибровки' })
  calibration: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Каркас', changelog: 'Изменение каркаса' })
  carcase: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Шасси', changelog: 'Изменение шасси' })
  chassis: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Цвет авто', changelog: 'Изменение цвета авто' })
  color: Map<string, string>;

  @Prop({ type: String, default: null, description: 'Компания', changelog: 'Изменение компании' })
  company: string;

  @Prop({ type: String, default: 'cars' })
  object: string;

  @Prop({ type: String, default: null, description: 'Ответственный', changelog: 'Изменение ответственного' })
  owner: string;

  @Prop({ type: Map, default: {}, description: 'Масса в снаряженном состоянии', changelog: 'Изменение массы' })
  curbWeight: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Модель авто', changelog: 'Изменение модели авто' })
  enginePower: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Гос номер', changelog: 'Изменение гос номера' })
  govNumber: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Год выпуска авто', changelog: 'Изменение года выпуска авто' })
  issueYear: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Максимальная масса', changelog: 'Изменение максимальной массы' })
  maxMass: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Владелец авто', changelog: 'Смена владельца авто' })
  ownerCar: Map<string, string>;

  @Prop({ type: Boolean, default: true, description: 'Статус архивации', changelog: 'Изменение статуса архивации' })
  active: boolean;

  @Prop({ type: Map, default: null, description: 'Документы', changelog: 'Изменение документов' })
  attachments: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Изображение', changelog: 'Изменение изображения транспорта' })
  avatar: Map<string, any>;
}
export type CarsModel<T extends Document> = PaginateModel<Cars>;
export const CarsSchema = SchemaFactory.createForClass(Cars);
export const CarsModel: CarsModel<Cars> = model<Cars>('Cars', CarsSchema) as CarsModel<Cars>;
