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

  @Prop({
    type: Boolean,
    default: true,
    description: 'Статус архивации',
    changelog: 'Смена статуса архивации',
  })
  active: boolean;

  @Prop({ type: Map, default: {}, description: 'Комментарий', changelog: 'Изменение комментариев' })
  comments: Map<string, any>;

  @Prop({ type: Map, default: {}, description: 'Документы', changelog: 'Изменение документов' })
  attachments: Map<string, any>;

  @Prop({ type: String, default: null })
  author: string;

  @Prop({ type: String, default: null, ref: 'Clients', description: 'Клиент', changelog: 'Изменение клиента' })
  client: string;

  @Prop({ type: String, default: null, description: 'Компания', changelog: 'Изменение компании' })
  company: string;

  @Prop({ type: String, default: null, description: 'Валюта', changelog: 'Изменение валюты' })
  currency: string;

  @Prop({ type: String, default: null, description: 'Описание', changelog: 'Изменение описания лида/сделки' })
  description: string;

  @Prop({
    type: Date,
    default: null,
    description: 'Дата окончания',
    changelog: 'Дата завершения сделки',
  })
  endDate: Date;

  @Prop({ type: Map, default: {} })
  information: Map<string, any>;

  @Prop({
    type: String,
    default: null,
    description: 'Название лида/сделки',
    changelog: 'Изменение названия сделки/лида',
  })
  name: string;

  @Prop({ type: String, default: 'task' })
  object: string;

  @Prop({ type: String, default: null, description: 'Ответственный', changelog: 'Смена ответственного' })
  owner: string;

  @Prop({ type: Map, default: {}, description: 'Права доступа', changelog: 'Изменение прав доступа' })
  permissions: Map<string, any>;

  @Prop({ type: Number, default: 0, description: 'Стоимость', changelog: 'Изменение стоимости' })
  price: number;

  @Prop({ type: String, default: null, description: 'Тип топлива', changelog: 'Изменение статуса сделки/лида' })
  fuelType: string;

  @Prop({ type: Number, default: null, description: 'Количество топлива', changelog: 'Изменение количества топлива' })
  amountFuel: number;

  @Prop({ type: String, default: null, description: 'Источник', changelog: 'Изменение источника' })
  source: string;

  @Prop({ type: Date, default: null, description: 'Дата начала', changelog: 'Изменение даты начала' })
  startDate: Date;

  @Prop({ type: StatusSchema, default: {}, description: 'Статус', changelog: 'Изменение статуса сделки/лида' })
  status?: StatusDeals;

  @Prop({
    type: Boolean,
    default: false,
    description: 'Завершенная сделка',
    changelog: 'Изменение сделки на завершенную',
  })
  final: boolean;

  @Prop({ type: Array, default: [], description: 'Тэги', changelog: 'Изменение тэгов' })
  tags: Array<string>;

  @Prop({ type: String, default: 'lead' })
  type: string;

  @Prop({ type: Array, default: [] })
  contacts: Array<any>;

  @Prop({ type: Map, default: {}, description: 'Изображение', changelog: 'Изменение изображения сделки/лида' })
  avatar: Map<string, any>;
}
export type DealModel<T extends Document> = PaginateModel<Deals>;
export const DealSchema = SchemaFactory.createForClass(Deals);
export const DealModel: DealModel<Deals> = model<Deals>('Deals', DealSchema) as DealModel<Deals>;

@Schema({ collection: 'dealsList' })
export class DealsList extends Deals {}

export type DealsListModel<T extends Document> = PaginateModel<DealsList>;
export const DealsListSchema = SchemaFactory.createForClass(DealsList);
export const DealsListModel: DealsListModel<DealsList> = model<DealsList>(
  'DealsList',
  DealsListSchema,
) as DealsListModel<DealsList>;
