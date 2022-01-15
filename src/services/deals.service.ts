import { Core } from 'crm-core';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DealModel, Deals } from '../schemas/deals.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { log } from 'util';

@Injectable()
export class DealsService {
  private readonly dealsModel: DealModel<Deals>;

  constructor(@InjectConnection() private connection: Connection) {
    this.dealsModel = this.connection.model('Deals') as DealModel<Deals>;
  }

  /**
   * Создание сделки
   * @param dealData
   * @return ({Core.Response.Answer})
   */
  async createDeal(dealData: Core.Deals.Schema): Promise<Core.Response.Answer> {
    let result;
    const deal = new this.dealsModel(dealData);
    try {
      await deal.save();
      result = Core.ResponseSuccess('Сделка успешно создана');
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
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
      result = Core.ResponseData('List of deals', deals);
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
      result = Core.ResponseData('Сделка найдена', deal);
    } catch (e) {
      result = Core.ResponseNotFound(
        'Сделка с таким идентификатором не найдена',
        e.status,
        e.error,
      );
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
      result = Core.ResponseNotFound(
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
    const dealOld = await this.dealsModel
      .findOne({ _id: updateData.id })
      .exec();
    const dealNew = updateData.data;
    let historyAction = {};
    try {
      historyAction = Object.assign(historyAction, {
        whoChanged: updateData.userId,
      });
      if (dealOld.owner !== dealNew.owner && dealNew.owner !== undefined) {
        historyAction = Object.assign(historyAction, {
          owner: { old: dealOld.owner, new: dealNew.owner },
        });
        dealOld.owner = dealNew.owner;
      }
      if (dealOld.name !== dealNew.name) {
        historyAction = Object.assign(historyAction, {
          name: { old: dealOld.name, new: dealNew.name },
        });
        dealOld.name = dealNew.name;
      }

      if (dealOld.fuelAmount !== dealNew.fuelAmount) {
        historyAction = Object.assign(historyAction, {
          fuelAmount: { old: dealOld.fuelAmount, new: dealNew.fuelAmount },
        });
        dealOld.fuelAmount = dealNew.fuelAmount;
      }

      if (dealOld.fuelType !== dealNew.fuelType) {
        historyAction = Object.assign(historyAction, {
          fuelType: { old: dealOld.fuelType, new: dealNew.fuelType },
        });
        dealOld.fuelType = dealNew.fuelType;
      }

      if (dealOld.ownership !== dealNew.ownership) {
        historyAction = Object.assign(historyAction, {
          ownership: { old: dealOld.ownership, new: dealNew.ownership },
        });
        dealOld.ownership = dealNew.ownership;
      }

      if (dealOld.status !== dealNew.status) {
        historyAction = Object.assign(historyAction, {
          status: { old: dealOld.status, new: dealNew.status },
        });
        dealOld.status = dealNew.status;
      }

      if (dealOld.sum !== dealNew.sum) {
        historyAction = Object.assign(historyAction, {
          sum: { old: dealOld.sum, new: dealNew.sum },
        });
        dealOld.sum = dealNew.sum;
      }

      if (dealOld.fullname !== dealNew.fullname) {
        historyAction = Object.assign(historyAction, {
          fullname: { old: dealOld.fullname, new: dealNew.fullname },
        });
        dealOld.fullname = dealNew.fullname;
      }

      if (dealOld.tags !== dealNew.tags) {
        historyAction = Object.assign(historyAction, {
          sum: { old: dealOld.tags, new: dealNew.tags },
        });
        dealOld.tags = dealNew.tags;
      }

      dealOld.history.set(Date.now().toString(), historyAction);
      await dealOld.save();
      result = Core.ResponseDataAsync('Сделка успешно изменена', dealOld);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  async commentDeal(commentData: Core.Deals.CommentData) {
    let result;
    const deal = await this.dealsModel.findOne({ _id: commentData.id }).exec();
    try {
      deal.history.set(Date.now().toString(), {
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
