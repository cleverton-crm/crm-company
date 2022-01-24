import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import {
  Companies,
  CompanyModel,
  ListCompany,
} from 'src/schemas/company.schema';
import { Core } from 'crm-core';

@Injectable()
export class CompanyService {
  private readonly companyModel: CompanyModel<Companies>;
  private readonly listCompanyModel: Model<ListCompany>;

  constructor(@InjectConnection() private connection: Connection) {
    this.companyModel = this.connection.model(
      'Companies',
    ) as CompanyModel<Companies>;
    this.listCompanyModel = this.connection.model('ListCompany');
  }

  /**
   * Создание компании
   * @param {Core.Company.Schema} companyData - основные данные о компании
   * @return ({Core.Response.Answer})
   */
  async createCompany(
    companyData: Core.Company.Schema,
  ): Promise<Core.Response.Answer> {
    let result;
    const company = new this.companyModel(companyData);
    try {
      await company.save();
      result = Core.ResponseDataAsync('Компания успешно создана', company);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Архивация компании
   * @param {Core.Company.ArchiveData} archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveCompany(
    archiveData: Core.Company.ArchiveData,
  ): Promise<Core.Response.Answer> {
    let result;
    const company = await this.companyModel.findOne({ _id: archiveData.id });
    if (company) {
      company.active = archiveData.active;
      await company.save();
      if (!company.active) {
        result = Core.ResponseSuccess('Компания была отправлена в архив');
      } else {
        result = Core.ResponseSuccess('Компания была разархивирована');
      }
    } else {
      result = Core.ResponseError(
        'Компания с таким ID не найдена',
        HttpStatus.OK,
        'Not Found',
      );
    }
    return result;
  }

  /**
   * Список компаний
   * @return({Core.Company.Schema[]})
   */
  async listCompanies(
    pagination: Core.MongoPagination,
  ): Promise<Core.Response.RecordsData> {
    let result;
    try {
      const company = await this.companyModel.paginate({}, pagination);
      result = Core.ResponseDataRecords(
        'Список компаний',
        company.data,
        company.records,
      );
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
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
    try {
      result = Core.ResponseData(
        'Компания найдена',
        await this.listCompanyModel.findOne({ _id: id }).exec(),
      );
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Изменение данных о компании
   * @param updateData
   */
  async updateCompany(updateData: Core.Company.UpdateData) {
    let result;
    console.log(updateData);
    try {
      await this.companyModel
        .findOneAndUpdate({ _id: updateData.id }, updateData.data)
        .exec();
      result = Core.ResponseSuccess('Данные о компании изменены');
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
