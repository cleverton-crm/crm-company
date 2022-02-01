import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { LeadModel, Leads } from '../schemas/leads.schema';
import { Core } from 'crm-core';

@Injectable()
export class LeadsService {
  private readonly leadsModel: LeadModel<Leads>;

  constructor(
    @InjectConnection() private connection: Connection,
    private jwtService: JwtService,
  ) {
    this.leadsModel = this.connection.model('Leads') as LeadModel<Leads>;
  }

  /**
   * Создание лида
   * @param leadData
   * @return ({Core.Response.Answer})
   */
  async createLead(leadData: Core.Leads.Schema): Promise<Core.Response.Answer> {
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
    archiveData: Core.Leads.ArchiveData,
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
    updateData: Core.Leads.UpdateData,
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
}
