import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Companies, CompanyModel, ListCompany, ListCompanyModel } from 'src/schemas/company.schema';
import { Core } from 'crm-core';
import { ActivityService } from './activity.service';
import { Cars, CarsModel } from '../schemas/cars.schema';
import { ClientModel, Clients } from '../schemas/clients.schema';
import { DealModel, Deals } from '../schemas/deals.schema';
import { DataParserHelper } from '../helpers/data-parser.helper';
import { Profile, ProfileModel } from '../schemas/profile.schema';
import Collection from '@discordjs/collection';
import * as fs from 'fs';

@Injectable()
export class CompanyService {
  private readonly companyModel: CompanyModel<Companies>;
  private readonly listCompanyModel: ListCompanyModel<ListCompany>;
  private readonly carsModel: CarsModel<Cars>;
  private readonly clientModel: ClientModel<Clients>;
  private readonly dealsModel: DealModel<Deals>;
  private readonly profileModel: ProfileModel<Profile>;

  constructor(
    @InjectConnection() private connection: Connection,
    private readonly activityService: ActivityService,
    private dataParser: DataParserHelper,
  ) {
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
    this.listCompanyModel = this.connection.model('ListCompany') as ListCompanyModel<ListCompany>;
    this.carsModel = this.connection.model('Cars') as CarsModel<Cars>;
    this.clientModel = this.connection.model('Clients') as ClientModel<Clients>;
    this.dealsModel = this.connection.model('Deals') as DealModel<Deals>;
    this.profileModel = this.connection.model('Profile') as ProfileModel<Profile>;

    // console.log(this.dataParser.fetchCompanyData('562200148698').then((t) => console.log(t)));
  }

  async convertCompany() {
    await this.dataParser.insertClient(this.companyModel, this.clientModel);

    return Core.ResponseDataAsync('Эта функция не работает', '');
  }

  /**
   * Создание компании
   * @param {Core.Company.Schema} companyData - основные данные о компании
   * @return ({Core.Response.Answer})
   */
  async createCompany(companyData: Core.Company.Schema): Promise<Core.Response.Data> {
    let result;
    const company = new this.companyModel(companyData);
    company.inn = companyData.requisites.data.inn;
    try {
      await company.save();
      result = Core.ResponseDataAsync('Компания успешно создана', company);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Архивация компании
   * @param {Core.Company.ArchiveData} archiveData - Статус архивации
   * @return ({Core.Response.Answer})
   */
  async archiveCompany(archiveData: Core.Company.ArchiveData): Promise<Core.Response.Answer> {
    let result;
    const company = await this.companyModel.findOne({ _id: archiveData.id }).exec();
    try {
      if (company) {
        const oldCompany = company.toObject();
        company.active = archiveData.active;
        const newCompany = await this.companyModel.findOneAndUpdate({ _id: archiveData.id }, company, { new: true });
        await this.carsModel.updateMany({ company: archiveData.id }, { $set: { active: archiveData.active } });
        await this.clientModel.updateMany({ company: archiveData.id }, { $set: { active: archiveData.active } });
        await this.dealsModel.updateMany({ company: archiveData.id }, { $set: { active: archiveData.active } });
        await this.activityService.historyData(
          oldCompany,
          newCompany.toObject(),
          this.companyModel,
          archiveData.userId,
        );
        if (!company.active) {
          result = Core.ResponseSuccess('Компания была отправлена в архив');
        } else {
          result = Core.ResponseSuccess('Компания была разархивирована');
        }
      } else {
        result = Core.ResponseError('Компания с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Список компаний
   * @return({Core.Company.Schema[]})
   */
  async listCompanies(data: {
    searchFilter: string;
    pagination: Core.MongoPagination;
    req: any;
    createdAt: string;
    updatedAt: string;
    inn: string;
    name: string;
    bank: string;
    email: string;
    active: boolean;
  }): Promise<Core.Response.RecordsData> {
    let result;
    let filter = {};
    if (data.searchFilter) {
      filter = Object.assign(filter, {
        $or: [
          { name: { $regex: data.searchFilter, $options: 'i' } },
          { inn: { $regex: data.searchFilter, $options: 'i' } },
          // { 'requisites.data.emails': { $regex: data.searchFilter, $options: 'i' } },
          { emails: { $regex: data.searchFilter, $options: 'i' } },
          { 'bank.bank': { $regex: data.searchFilter, $options: 'i' } },
        ],
      });
    }
    filter = data.active ? Object.assign(filter, { active: data.active }) : filter;
    if (!data.searchFilter) {
      filter = data.inn ? Object.assign(filter, { inn: { $regex: data.inn, $options: 'i' } }) : filter;
      filter = data.name ? Object.assign(filter, { name: { $regex: data.name, $options: 'i' } }) : filter;
      filter = data.bank ? Object.assign(filter, { 'bank.bank': { $regex: data.bank, $options: 'i' } }) : filter;
      filter = data.email ? Object.assign(filter, { emails: { $regex: data.email, $options: 'i' } }) : filter;
    }
    filter = data.createdAt ? Object.assign(filter, { createdAt: { $gte: data.createdAt, $lte: new Date() } }) : filter;
    filter = data.updatedAt ? Object.assign(filter, { updatedAt: { $gte: data.updatedAt, $lte: new Date() } }) : filter;
    try {
      const company = await this.listCompanyModel.paginate(filter, data.pagination);
      result = Core.ResponseDataRecords('Список компаний', company.data, company.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск компании по ID
   * @param {String} id
   * @return({Core.Company.Schema[]})
   */
  async findCompany(id: string): Promise<Core.Company.Schema> {
    let result;
    const company = await this.listCompanyModel.findOne({ _id: id }).exec();
    try {
      if (company !== null) {
        result = Core.ResponseData('Компания найдена', company);
      } else {
        result = Core.ResponseError('Компания с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Изменение данных о компании
   * @param updateData
   */
  async updateCompany(updateData: Core.Company.UpdateData): Promise<Core.Response.Answer> {
    let result;
    const company = await this.companyModel.findOne({ _id: updateData.id }).exec();
    let oldCompany;
    try {
      if (company) {
        oldCompany = company.toObject();
        const newCompany = await this.companyModel
          .findOneAndUpdate({ _id: updateData.id }, { ...updateData.data }, { new: true })
          .exec();
        await this.activityService.historyData(oldCompany, newCompany.toObject(), this.companyModel, updateData.userId);
        result = Core.ResponseSuccess('Данные о компании изменены');
      } else {
        result = Core.ResponseError('Компания с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск существующих компаний по ИНН
   * @param inn
   * @return({Core.Response.Answer})
   */
  async checkoutCompany(inn: string): Promise<Core.Response.Answer> {
    let result;
    const company = await this.companyModel.findOne({ inn: inn }).exec();
    try {
      if (company) {
        if (!company.active) {
          result = Core.ResponseDataAsync(
            {
              text: 'Компания с таким ИНН находится в архиве и ее можно восстановить',
              status: 'inactive',
            },
            company.id,
          );
        } else {
          result = Core.ResponseSuccess({
            text: 'Компания с таким ИНН уже существует',
            status: 'active',
          });
        }
      } else {
        result = Core.ResponseSuccess({ text: 'Компания не найдена', status: 'notfound' }, HttpStatus.NO_CONTENT);
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
