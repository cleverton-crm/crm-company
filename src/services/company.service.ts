import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
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

  constructor(
    @InjectConnection() private connection: Connection,
    private jwtService: JwtService,
  ) {
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
      result = {
        statusCode: HttpStatus.OK,
        message: 'Компания успешно создана',
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Ошибка при создании компании',
        errors: 'Bad Request',
      };
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
        result = {
          statusCode: HttpStatus.OK,
          message: 'Компания была отправлена в архив',
        };
      } else {
        result = {
          statusCode: HttpStatus.OK,
          message: 'Компания была разархивирована',
        };
      }
    } else {
      result = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Компания с таким id не найдена',
        errors: 'Not Found',
      };
    }
    return result;
  }

  /**
   * Список компаний
   * @return({Core.Company.Schema[]})
   */
  async listCompanies(): Promise<Core.Company.Schema[]> {
    let result;
    try {
      result = {
        statusCode: HttpStatus.OK,
        message: 'Company List',
        data: await this.listCompanyModel.find().exec(),
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: e.message,
        errors: e.error,
      };
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
      result = {
        statusCode: HttpStatus.OK,
        message: 'Company Found',
        data: await this.companyModel.findOne({ _id: id }).exec(),
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: e.message,
        errors: e.error,
      };
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
      result = {
        statusCode: HttpStatus.OK,
        message: 'Данные о компании изменены',
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: e.message,
        errors: e.error,
      };
    }
    return result;
  }
}
