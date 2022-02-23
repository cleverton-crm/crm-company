import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Companies, CompanyModel, ListCompany } from 'src/schemas/company.schema';
import { Core } from 'crm-core';
import { ActivityService } from './activity.service';

@Injectable()
export class CompanyService {
  private readonly companyModel: CompanyModel<Companies>;
  private readonly listCompanyModel: Model<ListCompany>;

  constructor(@InjectConnection() private connection: Connection, private readonly activityService: ActivityService) {
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
    this.listCompanyModel = this.connection.model('ListCompany');
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
   * @param {Core.Company.ArchiveData} archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveCompany(archiveData: Core.Company.ArchiveData): Promise<Core.Response.Answer> {
    let result;
    const company = await this.companyModel.findOne({ _id: archiveData.id }).exec();
    const oldCompany = company.toObject();
    try {
      if (company) {
        company.active = archiveData.active;
        const newCompany = await this.companyModel.findOneAndUpdate({ _id: archiveData.id }, company, { new: true });
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
        result = Core.ResponseError('Компания с таким ID не найдена', HttpStatus.OK, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Список компаний
   * @return({Core.Company.Schema[]})
   */
  async listCompanies(pagination: Core.MongoPagination): Promise<Core.Response.RecordsData> {
    let result;
    try {
      const company = await this.companyModel.paginate({ active: true }, pagination);
      result = Core.ResponseDataRecords('Список компаний', company.data, company.records);
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
    const company = await this.listCompanyModel.findOne({ _id: id }).exec();
    try {
      if (company !== null) {
        result = Core.ResponseData('Компания найдена', company);
      } else {
        result = Core.ResponseSuccess('Компания с таким ID не найдена');
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
    const oldCompany = company.toObject();
    try {
      const newCompany = await this.companyModel
        .findOneAndUpdate(
          { _id: updateData.id },
          { ...updateData.data, inn: updateData.data.requisites.data.inn },
          { new: true },
        )
        .exec();
      await this.activityService.historyData(oldCompany, newCompany.toObject(), this.companyModel, updateData.userId);
      result = Core.ResponseSuccess('Данные о компании изменены');
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
