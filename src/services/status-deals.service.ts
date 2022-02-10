import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { StatusDeals } from '../schemas/status-deals.schema';
import { Core } from 'crm-core';

@Injectable()
export class StatusDealsService {
  private readonly statusModel: Model<StatusDeals>;

  constructor(@InjectConnection() private connection: Connection) {
    this.statusModel = this.connection.model('StatusDeals') as Model<StatusDeals>;
  }

  /**
   * Создание статуса
   * @param {Core.StatusDeals.Schema} statusData
   * @return ({Core.Response.Answer})
   */
  async createStatus(statusData: { data: Core.StatusDeals.Schema; owner: any }): Promise<Core.Response.Answer> {
    let result;
    statusData.data.owner = statusData.owner.userID;
    if (statusData.data.locked) {
      if (statusData.owner.roles.name === 'Admin') {
        statusData.data.locked = true;
      } else {
        statusData.data.locked = false;
      }
    } else {
      statusData.data.locked = false;
    }
    const statusLength = await this.statusModel.countDocuments();
    statusData.data.priority = statusLength;
    const status = new this.statusModel(statusData.data);
    try {
      await status.save();
      result = Core.ResponseSuccess('Статус сделки успешно создан');
    } catch (e) {
      if (e.name === 'MongoServerError') {
        result = Core.ResponseError(
          'Статус с таким названием уже существует в базе',
          HttpStatus.BAD_REQUEST,
          'Bad Request',
        );
      } else {
        result = Core.ResponseError(e.message, e.status, e.error);
      }
    }
    return result;
  }

  /**
   * Список статусов сделки
   */
  async listStatus() {
    let result;
    const status = await this.statusModel.find().sort({ priority: 1, createdAt: 1 }).exec();
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
  async archiveStatus(archiveData: Core.StatusDeals.ArchiveData): Promise<Core.Response.Answer> {
    let result;
    const status = await this.statusModel.findOne({ _id: archiveData.id }).exec();
    if (status) {
      status.active = archiveData.active;
      await status.save();
      if (!status.active) {
        result = Core.ResponseSuccess('Статус сделки был отправлен в архив');
      } else {
        result = Core.ResponseSuccess('Статус сделки был разархивирован');
      }
    } else {
      result = Core.ResponseError('Статус сделки с таким ID не найден', HttpStatus.OK, 'Not Found');
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
      const status = await this.statusModel.findOneAndUpdate({ _id: updateData.id, locked: false }, updateData.data);
      if (status) {
        result = Core.ResponseSuccess('Данные статуса сделки изменены');
      } else {
        throw new BadRequestException('Данный статус обновить нельзя');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Смена приоритета у статуса
   * @param data
   */
  async changeStatusPriority(data: { id: string; priority: number }) {
    let result;
    try {
      if (data.priority <= 1 || data.priority >= 99) {
        throw new BadRequestException('Нельзя изменять приоритет статуса ниже либо равно 1 или выше 99');
      }
      const statusId = await this.statusModel.findOne({ _id: data.id }).exec();
      if (!statusId) {
        throw new NotFoundException('Статус с таким ID не найден');
      }
      const statusPriority = await this.statusModel.findOne({ priority: data.priority }).exec();
      if (statusPriority) {
        statusPriority.priority = statusId.priority;
        statusId.priority = data.priority;
        await statusPriority.save();
      } else {
        statusId.priority = data.priority;
      }
      await statusId.save();
      result = Core.ResponseSuccess('Приоритет статуса был успешно изменен');
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
