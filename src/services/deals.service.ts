import { Core } from 'crm-core';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DealModel, Deals } from '../schemas/deals.schema';
import { StatusDeals } from '../schemas/status-deals.schema';
import { Profile } from '../schemas/profile.schema';

@Injectable()
export class DealsService {
  private readonly dealsModel: DealModel<Deals>;
  private readonly statusModel: Model<StatusDeals>;
  private readonly profileModel: Model<Profile>;

  constructor(@InjectConnection() private connection: Connection) {
    this.profileModel = this.connection.model('Profile') as Model<Profile>;
    this.dealsModel = this.connection.model('Deals') as DealModel<Deals>;
    this.statusModel = this.connection.model(
      'StatusDeals',
    ) as Model<StatusDeals>;
  }

  /**
   * Создание сделки
   * @return ({Core.Response.Answer})
   * @param dealData
   */
  async createDeal(dealData: {
    data: Core.Deals.Schema;
    owner: any;
  }): Promise<Core.Response.Answer> {
    let result;
    try {
      const deal = new this.dealsModel(dealData.data);
      deal.owner = dealData.owner.userID;
      deal.type = 'deal';
      deal.author = dealData.owner.userID;
      const status = await this.statusModel
        .findOne({ priority: 1, locked: true })
        .exec();
      deal.status = status;
      await deal.save();
      result = Core.ResponseSuccess('Сделка успешно создана');
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Список сделок
   * @return ({Core.Response.Answer})
   */
  async listDeals(): Promise<Core.Response.Answer> {
    let result;
    const deals = await this.dealsModel.find().exec();
    try {
      result = Core.ResponseData('Список сделок', deals);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Поиск сделки
   * @param id
   * @return ({Core.Response.Answer})
   */
  async findDeal(id: string): Promise<Core.Response.Answer> {
    let result;
    const deal = await this.dealsModel.findOne({ _id: id }).exec();
    try {
      if (deal !== null) {
        result = Core.ResponseData('Сделка найдена', deal);
      } else {
        result = Core.ResponseSuccess('Сделка с таким ID не найдена');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Архивация сделки
   * @param archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveDeal(
    archiveData: Core.Deals.ArchiveData,
  ): Promise<Core.Response.Answer> {
    let result;
    const deal = await this.dealsModel.findOne({ _id: archiveData.id }).exec();
    if (deal) {
      deal.active = archiveData.active;
      await deal.save();
      if (!deal.active) {
        result = Core.ResponseSuccess('Сделка была отправлена в архив');
      } else {
        result = Core.ResponseSuccess('Сделка была разархивирована');
      }
    } else {
      result = Core.ResponseError(
        'Сделка с таким ID не найдена',
        HttpStatus.OK,
        'Not Found',
      );
    }
    return result;
  }

  /**
   * Изменение сделки
   * @param updateData
   * @return ({Core.Response.Answer})
   */
  async updateDeal(
    updateData: Core.Deals.UpdateData,
  ): Promise<Core.Response.Answer> {
    let result;
    const deal = await this.dealsModel.findOne({ _id: updateData.id }).exec();
    try {
      if (!deal) {
        throw new BadRequestException(
          'Сделка с таким идентификатором не найдена',
        );
      }
      if (deal.final) {
        throw new BadRequestException(
          'Сделка уже завершена и не может быть изменена',
        );
      }
      if (updateData.data.object) {
        throw new BadRequestException('Смена объекта запрещена');
      }
      if (
        (updateData.data.type !== 'deal' &&
          updateData.data.type !== undefined) ||
        deal.type !== 'deal'
      ) {
        throw new BadRequestException('Нельзя менять сделку на лид');
      }
      if (
        updateData.data.status !== deal.status &&
        updateData.data.status !== undefined
      ) {
        throw new BadRequestException(
          'Для смены статуса воспользуйтесь отдельным эндпоинтом',
        );
      }
      if (
        (updateData.data.owner !== undefined &&
          updateData.data.owner !== deal.owner) ||
        (updateData.data.owner !== undefined &&
          deal.owner !== updateData.owner.userID)
      ) {
        throw new BadRequestException(
          'Для смены ответственного воспользуйтесь отдельным эндпоинтом',
        );
      }
      if (!updateData.data.active && updateData.data.active !== undefined) {
        throw new BadRequestException(
          'Для архивации сделки воспользуйтесь отдельным эндпоинтом',
        );
      }

      updateData.data.updatedAt = new Date();

      await this.dealsModel.findOneAndUpdate(
        { _id: updateData.id },
        updateData.data,
      );
      result = Core.ResponseDataAsync('Сделка успешно изменена', deal);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Смена статуса у сделки
   * @param data
   */
  async changeDealStatus(data: { id: string; sid: string; owner: any }) {
    let result;
    const deal = await this.dealsModel
      .findOne({ _id: data.id, type: 'deal' })
      .exec();
    const status = await this.statusModel.findOne({ _id: data.sid }).exec();
    try {
      if (deal) {
        if (status) {
          deal.status = status;
          await deal.save();
          result = Core.ResponseSuccess('Статус сделки успешно изменен');
        } else {
          result = Core.ResponseError(
            'Статус с таким ID не существует в базе',
            HttpStatus.BAD_REQUEST,
            'Bad Request',
          );
        }
      } else {
        result = Core.ResponseError(
          'Сделка с таким ID не существует в базе',
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
   * Смена овнера у сделки
   * @param data
   */
  async changeDealOwner(data: { id: string; oid: string; owner: any }) {
    let result;
    const deal = await this.dealsModel
      .findOne({ _id: data.id, type: 'deal' })
      .exec();
    const profile = await this.profileModel.findOne({ _id: data.oid }).exec();
    try {
      if (deal) {
        if (profile) {
          deal.owner = profile.id;
          await deal.save();
          result = Core.ResponseSuccess('Ответственный сделки успешно изменен');
        } else {
          result = Core.ResponseError(
            'Ответственный с таким ID не существует в базе',
            HttpStatus.BAD_REQUEST,
            'Bad Request',
          );
        }
      } else {
        result = Core.ResponseError(
          'Сделка с таким ID не существует в базе',
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
   * Комментарий для сделки
   * @param commentData
   */
  async commentDeal(commentData: Core.Deals.CommentData) {
    let result;
    const deal = await this.dealsModel
      .findOne({ _id: commentData.id, type: 'deal' })
      .exec();
    try {
      deal.activity.set(Date.now().toString(), {
        comments: { [commentData.userId]: commentData.comments },
      });
      await deal.save();
      result = Core.ResponseDataAsync('Комментарий успешно добавлен', deal);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
