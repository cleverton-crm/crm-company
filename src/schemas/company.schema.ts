import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CompanyBank, CompanyRequisitesCompanyName } from './nested-company.schema';
import { Core } from 'crm-core';

@Schema({ timestamps: true })
export class Companies extends Document {
  @Prop({ type: uuidv4, default: uuidv4, description: 'Идентификатор', changelog: 'Изменение идентификатора компании' })
  _id: string;

  @Prop({ type: String, default: null, description: 'Название', changelog: 'Изменение названия компании' })
  name: string;

  @Prop({ type: Boolean, default: true, description: 'Статус архивации', changelog: 'Изменение статуса архивации' })
  active: boolean;

  @Prop({ type: Array, default: [], description: 'Клиенты', changelog: 'Изменение клиентов компании' })
  clients: Array<string>;

  @Prop({ type: String, default: null, description: 'Местоположение', changelog: 'Изменение местоположения компании' })
  companyLocation: string;

  @Prop({
    type: String,
    default: null,
    description: 'Количество сотрудников',
    changelog: 'Изменение количества сотрудников',
  })
  employeesCount: number;

  @Prop({ type: String, default: null, description: 'Фактический адрес', changelog: 'Изменение фактического адреса' })
  factLocation: string;

  @Prop({ type: String, default: null, description: 'Факс', changelog: 'Изменение факса' })
  fax: string;

  @Prop({ type: () => CompanyBank, default: {}, description: 'Банк компании', changelog: 'Изменение банка компании' })
  bank: CompanyBank;

  @Prop({ type: String, default: 'company' })
  object: 'company';

  @Prop({
    type: Map,
    default: {},
    description: 'Дополнительная информация',
    changelog: 'Изменение/добавление доп. информации',
  })
  metadata: Map<string, any>;

  @Prop({ type: String, default: null, description: 'Ответственный', changelog: 'Изменение ответственного' })
  owner: string;

  @Prop({ type: String, default: null, description: 'Тип компании', changelog: 'Изменение типа компании' })
  ownership: string | Core.Company.Ownership;

  @Prop({ type: Map, default: {}, description: 'Права доступа', changelog: 'Изменение прав доступа' })
  permissions: Map<string, any>;

  @Prop({ type: String, default: null, description: 'Телефон', changelog: 'Изменение телефона' })
  phoneNumber: string;

  @Prop({ type: Array, default: [], description: 'Телефоны', changelog: 'Изменение телефонных номеров' })
  phones: Array<string>;

  @Prop({ type: Array, default: [], description: 'Эл.почта', changelog: 'Изменение Эл.почты' })
  emails: Array<string>;

  @Prop({
    type: String,
    default: null,
    description: 'Почтовый адрес',
    changelog: 'Изменение почтового адреса компании',
  })
  postLocation: string;

  @Prop({
    type: () => CompanyRequisitesCompanyName,
    default: {},
    description: 'Реквизиты',
    changelog: 'Изменение реквизитов',
  })
  requisites: CompanyRequisitesCompanyName;

  @Prop({ type: String, default: null, description: 'Источник', changelog: 'Изменение источника' })
  source: string;

  @Prop({ type: Array, default: [], description: 'Тэги', changelog: 'Изменение тэгов' })
  tags: Array<string>;

  @Prop({ type: String, default: null, description: 'Сайт', changelog: 'Изменение адреса сайта' })
  web: string;

  @Prop({ type: String, default: null, description: 'Статус', changelog: 'Изменение статуса компании' })
  status: string;

  @Prop({ type: Map, default: {}, description: 'Партнер', changelog: 'Изменение партнера' })
  partner: Map<string, any>;

  @Prop({ type: Map, default: {}, description: 'Холдинг', changelog: 'Изменение холдинга' })
  holding: Map<string, any>;

  @Prop({
    type: String,
    default: null,
    unique: true,
    index: true,
    description: 'ИНН',
    changelog: 'Изменение ИНН компании',
  })
  inn: string;

  @Prop({ type: Map, default: {}, description: 'Парк', changelog: 'Изменение парка' })
  park: Map<string, any>;

  @Prop({ type: Map, default: null, description: 'Документы', changelog: 'Изменение документов' })
  attachments: Map<string, string>;

  @Prop({ type: Map, default: {}, description: 'Изображение', changelog: 'Изменение изображения компании' })
  avatar: Map<string, any>;
}
export type CompanyModel<T extends Document> = PaginateModel<Companies>;
export const CompanySchema = SchemaFactory.createForClass(Companies);
export const CompanyModel: CompanyModel<Companies> = model<Companies>(
  'Companies',
  CompanySchema,
) as CompanyModel<Companies>;

// View collection
@Schema({ collection: 'companyList' })
export class ListCompany extends Companies {}
export const ListCompanySchema = SchemaFactory.createForClass(ListCompany);
export type ListCompanyModel<T extends Document> = PaginateModel<ListCompany>;
export const ListCompanyModel: ListCompanyModel<ListCompany> = model<ListCompany>(
  'ListCompany',
  ListCompanySchema,
) as ListCompanyModel<ListCompany>;

// Lead Model Collection
@Schema({ timestamps: true })
export class LeadCompany extends Companies {
  @Prop({ type: uuidv4, default: null })
  original: string;
}
export const LeadCompanySchema = SchemaFactory.createForClass(LeadCompany);
export type LeadCompanyModel<T extends Document> = PaginateModel<LeadCompany>;
export const LeadCompanyModel: LeadCompanyModel<LeadCompany> = model<LeadCompany>(
  'LeadCompany',
  LeadCompanySchema,
) as LeadCompanyModel<LeadCompany>;
