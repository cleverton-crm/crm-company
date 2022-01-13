import { Core } from 'crm-core';
import { Injectable } from '@nestjs/common';
import { DealModel, Deals } from '../schemas/deals.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

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
}
