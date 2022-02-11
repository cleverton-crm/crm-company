import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { Core } from 'crm-core';
import { DealModel, Deals } from '../schemas/deals.schema';
import { StatusDeals } from '../schemas/status-deals.schema';
import { Profile } from '../schemas/profile.schema';
import { CompanyService } from './company.service';
import { Companies, CompanyModel, LeadCompany, LeadCompanyModel } from '../schemas/company.schema';
import { ClientService } from './clients.service';
import { ClientModel, Clients, LeadClientModel, LeadClients } from '../schemas/clients.schema';
import { log } from 'util';

@Injectable()
export class LeadsService {
  private readonly leadsModel: DealModel<Deals>;
  private readonly statusModel: Model<StatusDeals>;
  private readonly profileModel: Model<Profile>;
  private readonly companyModel: CompanyModel<Companies>;
  private readonly clientModel: ClientModel<Clients>;
  private readonly leadCompanyModel: LeadCompanyModel<LeadCompany>;
  private readonly leadClientModel: LeadClientModel<LeadClients>;

  constructor(
    @InjectConnection() private connection: Connection,
    private readonly companyService: CompanyService,
    private readonly clientService: ClientService,
  ) {
    this.leadsModel = this.connection.model('Deals') as DealModel<Deals>;
    this.statusModel = this.connection.model('StatusDeals') as Model<StatusDeals>;
    this.profileModel = this.connection.model('Profile') as Model<Profile>;
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
    this.clientModel = this.connection.model('Clients') as ClientModel<Clients>;
    this.leadCompanyModel = this.connection.model('LeadCompany') as LeadCompanyModel<LeadCompany>;
    this.leadClientModel = this.connection.model('LeadClients') as LeadClientModel<LeadClients>;
  }

  /**
   * Создание лида
   * @param leadData
   * @return ({Core.Response.Answer})
   */
  async createLead(leadData: { data: Core.Deals.Schema; owner: any }): Promise<Core.Response.Answer> {
    let result, oldCompany;
    let cacheCompany,
      cacheClient = {};
    let failInn = 'fail_' + Date.now();
    try {
      let companyContact = leadData.data.contacts.find((o) => o.object === 'company') as Core.Company.Schema;
      if (companyContact) {
        oldCompany = await this.leadCompanyModel.findOne({
          inn: companyContact?.requisites.data.inn || companyContact?.inn,
        });
        if (oldCompany) {
          cacheCompany = oldCompany;
        } else {
          cacheCompany = await this.leadCompanyModel.create({
            ...companyContact,
            inn: companyContact.requisites.data.inn,
          });
        }
      } else {
        cacheCompany = await this.leadCompanyModel.create({
          inn: failInn,
          requisites: {
            data: {
              inn: failInn,
            },
          },
        });
      }

      let clientContact = leadData.data.contacts.find((o) => o.object === 'client') as Core.Client.Schema;
      cacheClient = clientContact ? clientContact : {};
      let leadClient = (await this.leadClientModel.create(cacheClient)) as Core.Client.Schema;

      const lead = new this.leadsModel(leadData.data);
      lead.owner = leadData.owner.userID;
      lead.author = leadData.owner.userID;
      lead.company = cacheCompany.id;
      lead.client = leadClient.id || null;
      lead.contacts = [];
      const status = await this.statusModel.findOne({ priority: 1, locked: true }).exec();
      lead.status = status;
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
  async archiveLead(archiveData: Core.Deals.ArchiveData): Promise<Core.Response.Answer> {
    let result;
    try {
      const lead = await this.leadsModel.findOne({ _id: archiveData.id });
      if (lead) {
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        lead.active = archiveData.active;
        await lead.save();
        if (!lead.active) {
          result = Core.ResponseSuccess('Лид был отправлена в архив');
        } else {
          result = Core.ResponseSuccess('Лид был разархивирован');
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не найден', HttpStatus.OK, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
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
  async updateLead(updateData: Core.Deals.UpdateData): Promise<Core.Response.Answer> {
    let result;
    try {
      const lead = await this.leadsModel.findOne({ _id: updateData.id });
      if (!lead) {
        throw new BadRequestException('Лид с таким идентификатором не найден');
      }
      if (lead.final) {
        throw new BadRequestException('Нельзя изменять законченный лид');
      }
      if (updateData.data.object) {
        throw new BadRequestException('Смена объекта запрещена');
      }
      if ((updateData.data.type !== 'lead' && updateData.data.type !== undefined) || lead.type !== 'lead') {
        throw new BadRequestException('Нельзя менять лид на сделку');
      }
      if (updateData.data.status !== lead.status && updateData.data.status !== undefined) {
        throw new BadRequestException('Для смены статуса воспользуйтесь отдельным эндпоинтом');
      }
      if (
        (updateData.data.owner !== undefined && updateData.data.owner !== lead.owner) ||
        (updateData.data.owner !== undefined && lead.owner !== updateData.owner.userID)
      ) {
        throw new BadRequestException('Для смены ответственного воспользуйтесь отдельным эндпоинтом');
      }
      if (!updateData.data.active && updateData.data.active !== undefined) {
        throw new BadRequestException('Для архивации лида воспользуйтесь отдельным эндпоинтом');
      }

      await this.leadsModel.findOneAndUpdate({ _id: updateData.id }, updateData.data);
      result = Core.ResponseSuccess('Лид успешно изменен');
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Комментарий для лида
   * @param commentData
   */
  async commentLead(commentData: Core.Deals.CommentData) {
    let result;
    const lead = await this.leadsModel.findOne({ _id: commentData.id, type: 'lead' }).exec();
    try {
      if (lead) {
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        lead.comments.set(Date.now().toString(), {
          [commentData.userId]: commentData.comments,
        });
        await lead.save();
        result = Core.ResponseDataAsync('Комментарий успешно добавлен', lead);
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.BAD_REQUEST, 'Bad Request');
      }
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
    const lead = await this.leadsModel.findOne({ _id: data.id, type: 'lead' }).exec();
    const status = await this.statusModel.findOne({ _id: data.sid }).exec();
    try {
      if (lead) {
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        if (status) {
          lead.status = status;
          await lead.save();
          result = Core.ResponseSuccess('Статус лида успешно изменен');
        } else {
          result = Core.ResponseError('Статус с таким ID не существует в базе', HttpStatus.BAD_REQUEST, 'Bad Request');
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.BAD_REQUEST, 'Bad Request');
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
    const lead = await this.leadsModel.findOne({ _id: data.id, type: 'lead' }).exec();
    const profile = await this.profileModel.findOne({ _id: data.oid }).exec();
    try {
      if (lead) {
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
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
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.BAD_REQUEST, 'Bad Request');
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
      await this.leadsModel.findOneAndUpdate({ _id: data.id, type: 'lead' }, { active: false }).exec();
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
    let result, newCompany, newClient;
    try {
      const lead = await this.leadsModel.findOne({ _id: data.id, type: 'lead' }).exec();
      const status = await this.statusModel.findOne({ priority: 9999 }).exec();
      if (lead) {
        if (lead.status.priority === 1) {
          throw new BadRequestException('Новый лид нельзя переводить в законченную сделку');
        }
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        if (lead.contacts.length != 0) {
          let companyContact = lead.contacts.find((o) => o.object === 'company');
          let clientContact = lead.contacts.find((o) => o.object === 'client');
          if (companyContact) {
            /** FIND COMPANY */
            let innCompany = companyContact.requisites.data.inn ?? companyContact.inn;
            const company = await this.companyModel.findOne({
              inn: innCompany,
            });

            if (company) {
              lead.company = company.id;
            } else {
              newCompany = await this.companyService.createCompany({ ...companyContact, owner: lead.owner });
              lead.company = newCompany.data.id;
            }
          }
          if (clientContact) {
            const client = await this.clientModel.findOne({
              email: clientContact.email,
            });
            if (client) {
              lead.client = client.id;
            } else {
              newClient = companyContact
                ? await this.clientService.createClient({
                    ...clientContact,
                    company: lead.company,
                    owner: lead.owner,
                  })
                : await this.clientService.createClient({ ...clientContact, owner: lead.owner });
              lead.client = newClient.data.id;
            }
          }
          if (companyContact && clientContact) {
            lead.contacts = [];
          }
        }
        lead.status = status;
        lead.final = true;
        lead.tags.push(status.name);
        lead.type = 'deal';
        await this.leadsModel.findOneAndUpdate({ _id: lead.id }, lead);
        result = Core.ResponseSuccess('Лид успешно конвертирован в сделку');
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.BAD_REQUEST, 'Bad Request');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Обновление компании в лиде
   * @param updateData
   */
  async updateLeadCompany(updateData: { id: string; cid: string; data: Core.Company.Schema }) {
    let result;
    try {
      const lead = await this.leadsModel.findOne({ _id: updateData.id }).exec();
      if (lead) {
        const company = await this.leadCompanyModel.findOne({ id: updateData.cid }).exec();
        if (company && lead.company === company.id) {
          await this.leadCompanyModel.findOneAndUpdate({ id: updateData.cid }, updateData.data);
          result = Core.ResponseSuccess('Данные о компании изменены');
        } else {
          result = Core.ResponseError(
            'Компания с таким ID не существует в данном лиде',
            HttpStatus.BAD_REQUEST,
            'Bad Request',
          );
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.BAD_REQUEST, 'Bad Request');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Обновление клиента в лиде
   * @param updateData
   */
  async updateLeadClient(updateData: { id: string; cid: string; data: Core.Client.Schema }) {
    let result;
    try {
      const lead = await this.leadsModel.findOne({ _id: updateData.id }).exec();
      if (lead) {
        const client = await this.leadClientModel.findOne({ id: updateData.cid }).exec();
        if (client && lead.client === client.id) {
          await this.leadClientModel.findOneAndUpdate({ id: updateData.cid }, updateData.data);
          result = Core.ResponseSuccess('Данные о клиенте изменены');
        } else {
          result = Core.ResponseError(
            'Клиент с таким ID не существует в данном лиде',
            HttpStatus.BAD_REQUEST,
            'Bad Request',
          );
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.BAD_REQUEST, 'Bad Request');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
