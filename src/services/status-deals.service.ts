import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { StatusDeals } from '../schemas/status-deals.schema';
import { Core } from 'crm-core';

@Injectable()
export class StatusDealsService {
  private readonly statusModel: Model<StatusDeals>;

  constructor(@InjectConnection() private connection: Connection) {
    this.statusModel = this.connection.model(
      'StatusDeals',
    ) as Model<StatusDeals>;
  }

  /**
   * Создание статуса
   * @param {Core.StatusDeals.Schema} statusData
   * @return ({Core.Response.Answer})
   */
  async createStatus(
    statusData: Core.StatusDeals.Schema,
  ): Promise<Core.Response.Answer> {
    let result;
    const status = new this.statusModel(statusData);
    try {
      await status.save();
      result = Core.ResponseSuccess('Статус сделки успешно создан');
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Список статусов сделки
   */
  async listStatus() {
    let result;
    const status = await this.statusModel.find().exec();
    try {
      result = Core.ResponseData('Список статусов сделки', status);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Поиск статуса по ID
   * @param id
   */
  async findStatus(id: string) {
    let result;
    const status = await this.statusModel.findOne({ _id: id }).exec();
    try {
      if (status !== null) {
        result = Core.ResponseData('Статус сделки найден', status);
      } else {
        result = Core.ResponseSuccess('Статус сделки с таким ID не найдена');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Архивация статуса сделки
   * @param archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveStatus(
    archiveData: Core.StatusDeals.ArchiveData,
  ): Promise<Core.Response.Answer> {
    let result;
    const status = await this.statusModel
      .findOne({ _id: archiveData.id })
      .exec();
    if (status) {
      status.active = archiveData.active;
      await status.save();
      if (!status.active) {
        result = Core.ResponseSuccess('Статус сделки был отправлен в архив');
      } else {
        result = Core.ResponseSuccess('Статус сделки был разархивирован');
      }
    } else {
      result = Core.ResponseError(
        'Статус сделки с таким ID не найден',
        HttpStatus.OK,
        'Not Found',
      );
    }
    return result;
  }

  /**
   * Изменение данных статуса сделки
   * @param updateData
   */
  async updateStatus(updateData: Core.StatusDeals.UpdateData) {
    let result;
    try {
      await this.statusModel.findOneAndUpdate(
        { _id: updateData.id },
        updateData.data,
      );
      result = Core.ResponseSuccess('Данные статуса сделки изменены');
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
