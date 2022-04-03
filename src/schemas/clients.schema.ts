import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Core } from 'crm-core';
import { v4 as uuidv4 } from 'uuid';
import { Document, model, PaginateModel } from 'mongoose';
import { LicensesData } from './deals.schema';

@Schema({ timestamps: false, _id: false, versionKey: false })
export class PassportClientData {
  @Prop({ type: Date, default: null })
  dateOfIssue: Date;
  @Prop({ type: String, default: null })
  issuedBy: string;
  @Prop({ type: String, default: null })
  number: string;
  @Prop({ type: String, default: null })
  series: string;
}

@Schema({ timestamps: true })
export class Clients extends Document implements Core.Client.Schema {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Map, default: null, description: 'Документы', changelog: 'Изменение документов' })
  attachments: Map<string, string>;

  @Prop({ type: Date, default: null, description: 'Дата рождения', changelog: 'Изменение даты рождения' })
  birthDate: Date;

  @Prop({ type: Map, default: {}, description: 'Комментарии', changelog: 'Изменение/добавление комментария' })
  comments: Map<string, string>;

  @Prop({
    type: Map,
    default: {},
    description: 'Дополнительная информация',
    changelog: 'Изменение/добавление доп. информации',
  })
  metadata: Map<string, any>;

  @Prop({ type: String, default: null, description: 'Компания', changelog: 'Изменение компании' })
  company: string;

  @Prop({ type: Date, default: null })
  createData: Date;

  @Prop({ type: String, default: null, description: 'Электронная почта', changelog: 'Изменение электронной почты' })
  email: string;

  @Prop({
    type: String,
    default: null,
    description: 'Электронная почта компании',
    changelog: 'Изменение электронной почты компании',
  })
  emailCompany: string;

  @Prop({ type: String, default: null, description: 'Имя', changelog: 'Изменение имени' })
  first: string;

  @Prop({ type: String, default: null, description: 'Фамилия', changelog: 'Изменение фамилии' })
  last: string;

  @Prop({ type: String, default: null, description: 'Отчество', changelog: 'Изменение отчества' })
  middle: string;

  @Prop({ type: String, default: 'client' })
  object: 'client';

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: String, default: null, description: 'Тип плательщика', changelog: 'Изменение типа плательщика' })
  payerType: string;

  @Prop({ type: Map, default: {}, description: 'Права доступа', changelog: 'Изменение прав доступа' })
  permissions: Map<string, any>;

  @Prop({ type: Array, default: [], description: 'Телефон', changelog: 'Изменение телефона' })
  phones: Array<string>;

  @Prop({ type: String, default: null, description: 'Роль в компании', changelog: 'Изменение роли в компании' })
  roleInCompany: string;

  @Prop({ type: Map, default: {}, description: 'Соц сети', changelog: 'Изменение соц сетей' })
  socials: Map<string, string>;

  @Prop({ type: Map, default: {} })
  voices: Map<string, string>;

  @Prop({ type: String, default: null, description: 'Рабочий телефон', changelog: 'Изменение рабочего телефона' })
  workPhone: string;

  @Prop({ type: Boolean, default: true, description: 'Статус архивации', changelog: 'Изменение статуса архивации' })
  active: boolean;

  @Prop({ type: () => LicensesData, default: {} })
  licenses: LicensesData;

  @Prop({ type: () => PassportClientData, default: {} })
  passport: PassportClientData;

  @Prop({ type: Map, default: {}, description: 'Изображение', changelog: 'Изменение изображения клиента' })
  avatar: Map<string, any>;
}
export type ClientModel<T extends Document> = PaginateModel<Clients>;
export const ClientSchema = SchemaFactory.createForClass(Clients);
export const ClientModel: ClientModel<Clients> = model<Clients>('Clients', ClientSchema) as ClientModel<Clients>;

@Schema({ timestamps: true })
export class LeadClients extends Clients {
  @Prop({ type: uuidv4, default: null })
  original: string;
}
export const LeadClientsSchema = SchemaFactory.createForClass(LeadClients);
export type LeadClientModel<T extends Document> = PaginateModel<LeadClients>;
export const LeadClientModel: LeadClientModel<LeadClients> = model<LeadClients>(
  'LeadClients',
  LeadClientsSchema,
) as LeadClientModel<LeadClients>;

@Schema({ collection: 'clientsList' })
export class ClientsList extends Clients {}

export type ClientsListModel<T extends Document> = PaginateModel<ClientsList>;
export const ClientsListSchema = SchemaFactory.createForClass(ClientsList);
export const ClientsListModel: ClientsListModel<ClientsList> = model<ClientsList>(
  'ClientsList',
  ClientsListSchema,
) as ClientsListModel<ClientsList>;
