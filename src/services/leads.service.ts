import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { Core } from 'crm-core';
import { DealModel, Deals } from '../schemas/deals.schema';
import { StatusDeals } from '../schemas/status-deals.schema';
import { Profile } from '../schemas/profile.schema';

@Injectable()
export class LeadsService {
  private readonly leadsModel: DealModel<Deals>;
  private readonly statusModel: Model<StatusDeals>;
  private readonly profileModel: Model<Profile>;

  constructor(@InjectConnection() private connection: Connection) {
    this.leadsModel = this.connection.model('Deals') as DealModel<Deals>;
    this.statusModel = this.connection.model(
      'StatusDeals',
    ) as Model<StatusDeals>;
    this.profileModel = this.connection.model('Profile') as Model<Profile>;
  }

  /**
   * Создание лида
   * @param leadData
   * @return ({Core.Response.Answer})
   */
  async createLead(leadData: {
    data: Core.Deals.Schema;
    owner: any;
  }): Promise<Core.Response.Answer> {
    let result;
    try {
      const lead = new this.leadsModel(leadData);
      lead.owner = leadData.owner.userID;
      lead.author = leadData.owner.userID;
      const status = await this.statusModel
        .findOne({ priority: 1, locked: true })
        .exec();
      lead.status = status;
      leadData.data.contacts.forEach((value) => lead.contacts.push(value));
      leadData.data.tags.forEach((value) => lead.tags.push(value));
      await lead.save();
      result = Core.ResponseData('Лид успешно создан', lead);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Архивация лида
   * @param archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveLead(
    archiveData: Core.Deals.ArchiveData,
  ): Promise<Core.Response.Answer> {
    let result;
    const lead = await this.leadsModel.findOne({ _id: archiveData.id });
    if (lead) {
      lead.active = archiveData.active;
      await lead.save();
      if (!lead.active) {
        result = Core.ResponseSuccess('Лид был отправлена в архив');
      } else {
        result = Core.ResponseSuccess('Лид был разархивирован');
      }
    } else {
      result = Core.ResponseError(
        'Лид с таким ID не найден',
        HttpStatus.OK,
        'Not Found',
      );
    }
    return result;
  }

  /**
   * Список лидов
   * @return ({Core.Response.Answer})
   */
  async listLeads(): Promise<Core.Response.Answer> {
    let result;
    const leads = await this.leadsModel.find().exec();
    console.log(leads);
    try {
      result = Core.ResponseData('Список лидов', leads);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Поиск лида
   * @param id
   * @return ({Core.Response.Answer})
   */
  async findLead(id: string): Promise<Core.Response.Answer> {
    let result;
    const lead = await this.leadsModel.findOne({ _id: id }).exec();
    try {
      if (lead !== null) {
        result = Core.ResponseData('Лид найден', lead);
      } else {
        result = Core.ResponseSuccess('Лид с таким идентификатором не найден');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Изменение лида
   * @param updateData
   * @return ({Core.Response.Answer})
   */
  async updateLead(
    updateData: Core.Deals.UpdateData,
  ): Promise<Core.Response.Answer> {
    let result;
    try {
      const lead = await this.leadsModel.findOne({ _id: updateData.id });
      if (!lead) {
        throw new BadRequestException('Лид с таким идентификатором не найден');
      }
      if (updateData.data.object) {
        throw new BadRequestException('Смена объекта запрещена');
      }
      if (
        (updateData.data.type !== 'lead' &&
          updateData.data.type !== undefined) ||
        lead.type !== 'lead'
      ) {
        throw new BadRequestException('Нельзя менять лид на сделку');
      }
      if (
        updateData.data.status !== lead.status &&
        updateData.data.status !== undefined
      ) {
        throw new BadRequestException(
          'Для смены статуса воспользуйтесь отдельным эндпоинтом',
        );
      }
      if (
        (updateData.data.owner !== undefined &&
          updateData.data.owner !== lead.owner) ||
        (updateData.data.owner !== undefined &&
          lead.owner !== updateData.owner.userID)
      ) {
        throw new BadRequestException(
          'Для смены ответственного воспользуйтесь отдельным эндпоинтом',
        );
      }
      if (!updateData.data.active && updateData.data.active !== undefined) {
        throw new BadRequestException(
          'Для архивации лида воспользуйтесь отдельным эндпоинтом',
        );
      }

      updateData.data.updatedAt = new Date();

      await this.leadsModel.findOneAndUpdate(
        { _id: updateData.id },
        updateData.data,
      );
      result = Core.ResponseSuccess('Лид успешно изменен');
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Смена статуса у лида
   * @param data
   */
  async changeLeadStatus(data: { id: string; sid: string; owner: any }) {
    let result;
    const lead = await this.leadsModel
      .findOne({ _id: data.id, type: 'lead' })
      .exec();
    const status = await this.statusModel.findOne({ _id: data.sid }).exec();
    try {
      if (lead) {
        if (status) {
          lead.status = status;
          await lead.save();
          result = Core.ResponseSuccess('Статус лида успешно изменен');
        } else {
          result = Core.ResponseError(
            'Статус с таким ID не существует в базе',
            HttpStatus.BAD_REQUEST,
            'Bad Request',
          );
        }
      } else {
        result = Core.ResponseError(
          'Лид с таким ID не существует в базе',
          HttpStatus.BAD_REQUEST,
          'Bad Request',
        );
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Смена овнера у лида
   * @param data
   */
  async changeLeadOwner(data: { id: string; oid: string; owner: any }) {
    let result;
    const lead = await this.leadsModel
      .findOne({ _id: data.id, type: 'lead' })
      .exec();
    const profile = await this.profileModel.findOne({ _id: data.oid }).exec();
    try {
      if (lead) {
        if (profile) {
          lead.owner = profile.id;
          await lead.save();
          result = Core.ResponseSuccess('Ответственный лида успешно изменен');
        } else {
          result = Core.ResponseError(
            'Ответственный с таким ID не существует в базе',
            HttpStatus.BAD_REQUEST,
            'Bad Request',
          );
        }
      } else {
        result = Core.ResponseError(
          'Лид с таким ID не существует в базе',
          HttpStatus.BAD_REQUEST,
          'Bad Request',
        );
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Отмена лида
   * @param data
   */
  async failureLead(data: { id: string; owner: any }) {
    let result;
    try {
      const lead = await this.leadsModel
        .findOneAndUpdate({ _id: data.id, type: 'lead' }, { active: false })
        .exec();
      result = Core.ResponseSuccess('Лид был отменен');
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }

    return result;
  }

  /**
   * Лид переходит в завершенную сделку / Конвертируется в Сделку
   * @param data
   */
  async doneLead(data: { id: string; owner: any }) {
    let result;
    try {
    } catch (e) {}
    return result;
  }
}
