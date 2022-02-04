import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Core } from 'crm-core';
import { DealModel, Deals } from '../schemas/deals.schema';

@Injectable()
export class LeadsService {
  private readonly leadsModel: DealModel<Deals>;

  constructor(
    @InjectConnection() private connection: Connection,
    private jwtService: JwtService,
  ) {
    this.leadsModel = this.connection.model('Deals') as DealModel<Deals>;
  }

  /**
   * Создание лида
   * @param leadData
   * @return ({Core.Response.Answer})
   */
  async createLead(leadData: Core.Deals.Schema): Promise<Core.Response.Answer> {
    let result;
    const lead = new this.leadsModel(leadData);
    try {
      await lead.save();
      result = Core.ResponseData('Лид успешно создан', lead);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
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
      await this.leadsModel.findOneAndUpdate(
        { _id: updateData.id },
        updateData.data,
      );
      result = Core.ResponseSuccess('Данные о лиде изменены');
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  async swapType(id: string) {
    let result;
    const lead = this.leadsModel.findOne({ _id: id }).exec();
    try {
      if (lead['type'] === 'lead') {
        result = Core.ResponseSuccess('Данный лид уже является сделкой');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
