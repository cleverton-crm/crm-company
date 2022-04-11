import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { Core } from 'crm-core';
import { DealModel, Deals, DealsList, DealsListModel } from '../schemas/deals.schema';
import { StatusDeals } from '../schemas/status-deals.schema';
import { Profile } from '../schemas/profile.schema';
import { CompanyService } from './company.service';
import { Companies, CompanyModel, LeadCompany, LeadCompanyModel } from '../schemas/company.schema';
import { ClientService } from './clients.service';
import { ClientModel, Clients, LeadClientModel, LeadClients } from '../schemas/clients.schema';
import { ActivityService } from './activity.service';

@Injectable()
export class LeadsService {
  private readonly leadsModel: DealModel<Deals>;
  private readonly leadsListModel: DealsListModel<DealsList>;
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
    private readonly activityService: ActivityService,
  ) {
    this.leadsModel = this.connection.model('Deals') as DealModel<Deals>;
    this.leadsListModel = this.connection.model('DealsList') as DealsListModel<DealsList>;
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
            owner: leadData.owner.userID,
            inn: companyContact.requisites.data.inn,
          });
        }
      } else {
        cacheCompany = await this.leadCompanyModel.create({
          inn: failInn,
          owner: leadData.owner.userID,
          requisites: {
            data: {
              inn: failInn,
            },
          },
        });
      }

      let clientContact = leadData.data.contacts.find((o) => o.object === 'client') as Core.Client.Schema;
      cacheClient = clientContact ? clientContact : {};
      let leadClient = (await this.leadClientModel.create({
        cacheClient,
        owner: leadData.owner.userID,
      })) as Core.Client.Schema;

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
  async archiveLead(archiveData: { id: string; req: any; active: boolean }): Promise<Core.Response.Answer> {
    let result;
    const filter = archiveData.req?.filterQuery;
    try {
      const lead = await this.leadsModel.findOne({ _id: archiveData.id, filter });
      if (lead) {
        const oldLead = lead.toObject();
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        lead.active = archiveData.active;
        const newLead = await this.leadsModel.findOneAndUpdate({ _id: lead.id }, lead, { new: true }).exec();
        await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, archiveData.req.userID);
        if (!lead.active) {
          result = Core.ResponseSuccess('Лид был отправлен в архив');
        } else {
          result = Core.ResponseSuccess('Лид был разархивирован');
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не найден', HttpStatus.NOT_FOUND, 'Not Found');
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
  async listLeads(data: any): Promise<Core.Response.RecordsData> {
    let result;
    const {
      pagination,
      searchFilter,
      req,
      active,
      status,
      fuelType,
      source,
      createdAt,
      updatedAt,
      startDate,
      endDate,
    } = data;
    let filter = {};
    filter = Object.assign(filter, req.filterQuery);
    filter = searchFilter ? Object.assign(filter, { name: { $regex: searchFilter, $options: 'i' } }) : filter;
    filter = status ? Object.assign(filter, { 'status._id': status }) : filter;
    filter = fuelType ? Object.assign(filter, { fuelType: { $regex: fuelType, $options: 'i' } }) : filter;
    filter = source ? Object.assign(filter, { source: { $regex: source, $options: 'i' } }) : filter;
    filter = createdAt ? Object.assign(filter, { createdAt: { $gte: createdAt, $lte: new Date() } }) : filter;
    filter = updatedAt ? Object.assign(filter, { createdAt: { $gte: updatedAt, $lte: new Date() } }) : filter;
    filter = startDate ? Object.assign(filter, { startDate: { $gte: startDate, $lte: new Date() } }) : filter;
    filter = endDate ? Object.assign(filter, { endDate: { $gte: endDate, $lte: new Date() } }) : filter;
    try {
      const leads = await this.leadsListModel.paginate({ active, type: 'lead', ...filter }, pagination);
      result = Core.ResponseDataRecords('Список лидов', leads.data, leads.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск лида
   * @return ({Core.Response.Answer})
   * @param data
   */
  async findLead(data: { id: string; req: any }): Promise<Core.Response.Answer> {
    let result;
    const filter = data.req?.filterQuery;
    const lead = await this.leadsModel.findOne({ _id: data.id, filter }).exec();
    try {
      if (lead !== null) {
        result = Core.ResponseData('Лид найден', lead);
      } else {
        result = Core.ResponseError('Лид с таким идентификатором не найден', HttpStatus.NOT_FOUND, 'Not Found');
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
    let result, oldLead;
    const filter = updateData.owner?.filterQuery;
    try {
      const lead = await this.leadsModel.findOne({ _id: updateData.id, filter }).exec();
      if (!lead) {
        throw new NotFoundException('Лид с таким идентификатором не найден');
      } else {
        oldLead = lead.toObject();
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
      if (updateData.data.client) {
        throw new BadRequestException('Изменение клиента запрещено');
      }

      const newLead = await this.leadsModel.findOneAndUpdate({ _id: updateData.id }, updateData.data, { new: true });
      await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, updateData.owner.userID);
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
  async commentLead(commentData: { id: string; req: any; comments: string }) {
    let result;
    const filter = commentData.req?.filterQuery;
    const lead = await this.leadsModel.findOne({ _id: commentData.id, type: 'lead', filter }).exec();
    try {
      if (lead) {
        const oldLead = lead.toObject();
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        lead.comments.set(Date.now().toString(), {
          [commentData.req.userID]: commentData.comments,
        });
        const newLead = await this.leadsModel.findOneAndUpdate({ _id: commentData.id }, lead, { new: true });
        await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, commentData.req.userID);
        result = Core.ResponseDataAsync('Комментарий успешно добавлен', lead);
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Смена статуса у лида
   * @param data
   */
  async changeLeadStatus(data: { id: string; sid: string; owner: any }) {
    let result;
    const filter = data.owner?.filterQuery;
    const lead = await this.leadsModel.findOne({ _id: data.id, type: 'lead', filter }).exec();
    const status = await this.statusModel.findOne({ _id: data.sid }).exec();
    try {
      if (lead) {
        const oldLead = lead.toObject();
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        if (status) {
          lead.status = status;
          const newLead = await this.leadsModel.findOneAndUpdate({ _id: data.id }, lead, { new: true });
          await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, data.owner.userId);
          result = Core.ResponseSuccess('Статус лида успешно изменен');
        } else {
          result = Core.ResponseError('Статус с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
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
    const filter = data.owner?.filterQuery;
    const lead = await this.leadsModel.findOne({ _id: data.id, type: 'lead', filter }).exec();
    const profile = await this.profileModel.findOne({ _id: data.oid }).exec();
    try {
      if (lead) {
        const oldLead = lead.toObject();
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        if (profile) {
          lead.owner = profile.id;
          const newLead = await this.leadsModel.findOneAndUpdate({ _id: data.id }, lead, { new: true });
          await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, data.owner.userID);
          result = Core.ResponseSuccess('Ответственный лида успешно изменен');
        } else {
          result = Core.ResponseError(
            'Ответственный с таким ID не существует в базе',
            HttpStatus.NOT_FOUND,
            'Not Found',
          );
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
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
    const filter = data.owner?.filterQuery;
    const lead = await this.leadsModel.findOne({ _id: data.id, type: 'lead', filter }).exec();
    try {
      if (lead) {
        const oldLead = lead.toObject();
        const newLead = await this.leadsModel
          .findOneAndUpdate({ _id: data.id, type: 'lead' }, { active: false })
          .exec();
        await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, data.owner.userID);
        result = Core.ResponseSuccess('Лид был отменен');
      }
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
    const filter = data.owner?.filterQuery;
    try {
      const lead = await this.leadsModel.findOne({ _id: data.id, type: 'lead', filter }).exec();
      const status = await this.statusModel.findOne({ priority: 9999 }).exec();
      if (lead) {
        const oldLead = lead.toObject();
        if (lead.status.priority === 1) {
          throw new BadRequestException('Новый лид нельзя переводить в законченную сделку');
        }
        if (lead.final) {
          throw new BadRequestException('Нельзя изменять законченный лид');
        }
        let companyContact = await this.leadCompanyModel.findOne({ _id: lead.company }).exec();
        let clientContact = await this.leadClientModel.findOne({ _id: lead.client }).exec();
        if (companyContact) {
          /** FIND COMPANY */
          let innCompany = companyContact.requisites.data.inn ?? companyContact.inn;
          const company = await this.companyModel.findOne({
            inn: innCompany,
          });
          if (company) {
            lead.company = company._id;
          } else {
            let companyData = companyContact.toObject();
            delete companyData._id;
            newCompany = new this.companyModel(companyData);
            await newCompany.save();
            lead.company = newCompany._id;
          }
        } else {
          throw new BadRequestException('В лиде отсутствует юридическое/физическое лицо. Невозможно завершить лид');
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
        lead.status = status;
        lead.final = true;
        lead.tags.push(status.name);
        lead.type = 'deal';
        const newLead = await this.leadsModel.findOneAndUpdate({ _id: lead.id }, lead, { new: true });
        await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, data.owner.userID);
        result = Core.ResponseSuccess('Лид успешно конвертирован в сделку');
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Обновление компании в лиде
   * @param updateData
   */
  async updateLeadCompany(updateData: { id: string; cid: string; data: any; req: any }) {
    let result;
    const filter = updateData.req?.filterQuery;
    try {
      const lead = await this.leadsModel.findOne({ _id: updateData.id, type: 'lead', filter }).exec();
      if (lead) {
        const oldLead = lead.toObject();
        const company = await this.leadCompanyModel.findOne({ _id: updateData.cid }).exec();
        if (company && lead.company === company.id) {
          const newLead = await this.leadCompanyModel.findOneAndUpdate({ _id: updateData.cid }, updateData.data, {
            multi: true,
          });
          await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, updateData.req.userID);
          result = Core.ResponseSuccess('Данные о компании изменены');
        } else {
          result = Core.ResponseError(
            'Компания с таким ID не существует в данном лиде',
            HttpStatus.NOT_FOUND,
            'Not Found',
          );
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
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
  async updateLeadClient(updateData: { id: string; cid: string; data: Core.Client.Schema; owner: any }) {
    let result;
    const filter = updateData.owner?.filterQuery;
    try {
      const lead = await this.leadsModel.findOne({ _id: updateData.id, type: 'lead', filter }).exec();
      if (lead) {
        const oldLead = lead.toObject();
        const client = await this.leadClientModel.findOne({ _id: updateData.cid }).exec();
        if (client && lead.client === client.id) {
          const newLead = await this.leadClientModel.findOneAndUpdate({ _id: updateData.cid }, updateData.data);
          await this.activityService.historyData(oldLead, newLead.toObject(), this.leadsModel, updateData.owner.userID);
          result = Core.ResponseSuccess('Данные о клиенте изменены');
        } else {
          result = Core.ResponseError(
            'Клиент с таким ID не существует в данном лиде',
            HttpStatus.NOT_FOUND,
            'Not Found',
          );
        }
      } else {
        result = Core.ResponseError('Лид с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Список клиентов лидов
   * @param data
   */
  async listLeadClients(data: { pagination: Core.MongoPagination; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const leadClients = await this.leadClientModel.paginate({ active: true, filter }, data.pagination);
    try {
      result = Core.ResponseDataRecords('Список клиентов лидов', leadClients.data, leadClients.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Список компаний лидов
   * @param data
   */
  async listLeadCompanies(data: { pagination: Core.MongoPagination; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const leadCompanies = await this.leadCompanyModel.paginate({ active: true, filter }, data.pagination);
    try {
      result = Core.ResponseDataRecords('Список компании лидов', leadCompanies.data, leadCompanies.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск клиента лида по ID
   * @param data
   */
  async findLeadClient(data: { id: string; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const client = await this.leadClientModel.findOne({ _id: data.id, filter }).exec();
    try {
      if (client !== null) {
        result = Core.ResponseData('Клиент найден', client);
      } else {
        result = Core.ResponseError('Клиент с таким ID не найден', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Поиск компании лида по ID
   * @param data
   */
  async findLeadCompany(data: { id: string; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const company = await this.leadCompanyModel.findOne({ _id: data.id, filter }).exec();
    try {
      if (company !== null) {
        result = Core.ResponseData('Компания найдена', company);
      } else {
        result = Core.ResponseError('Компания с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Создание компании лида
   * @param leadData
   */
  async createCompanyLead(leadData: Core.Company.Schema) {
    let result;
    const company = new this.leadCompanyModel(leadData);
    company.inn = leadData.requisites.data.inn;
    try {
      await company.save();
      result = Core.ResponseDataAsync('Компания для лида успешно создана', company);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }
}
