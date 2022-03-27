import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Core } from 'crm-core';
import { ClientModel, Clients } from '../schemas/clients.schema';
import { ActivityService } from './activity.service';

@Injectable()
export class ClientService {
  private readonly clientModel: ClientModel<Clients>;

  constructor(@InjectConnection() private connection: Connection, private readonly activityService: ActivityService) {
    this.clientModel = this.connection.model('Clients') as ClientModel<Clients>;
  }

  /**
   * Создание клиента
   * @param clientData
   * @return ({Core.Response.Answer})
   */
  async createClient(clientData: Core.Client.Schema): Promise<Core.Response.Data> {
    let result;
    const client = new this.clientModel(clientData);
    try {
      await client.save();
      result = Core.ResponseSuccess('Клиент успешно создан');
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Архивация клиента
   * @return ({Core.Response.Answer})
   */
  async archiveClient(archiveData: { id: string; req: any; active: boolean }): Promise<Core.Response.Answer> {
    let result;
    let filter = archiveData.req?.filterQuery;
    try {
      const client = await this.clientModel.findOne({ _id: archiveData.id, filter }).exec();
      if (client) {
        const oldClient = client.toObject();
        client.active = archiveData.active;
        const newClient = await this.clientModel.findOneAndUpdate({ _id: archiveData.id }, client, { new: true });
        await this.activityService.historyData(
          oldClient,
          newClient.toObject(),
          this.clientModel,
          archiveData.req.userID,
        );
        if (!client.active) {
          result = Core.ResponseSuccess('Клиент был отправлен в архив');
        } else {
          result = Core.ResponseSuccess('Клиент был разархивирован');
        }
      } else {
        result = Core.ResponseError('Клиент с таким ID не найден', HttpStatus.OK, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }

    return result;
  }

  /**
   * Список компаний
   * @return({Core.Client.Schema[]})
   */
  async listClients(data: {
    company: string;
    searchFilter: string;
    pagination: Core.MongoPagination;
    req: any;
    createdAt: string;
    updatedAt: string;
    birthDate: string;
    first: string;
    last: string;
    middle: string;
    email: string;
    workPhone: string;
    active: boolean;
  }): Promise<Core.Response.RecordsData> {
    let result;
    let filter = data.req?.filterQuery;
    let clients;
    if (data.searchFilter) {
      filter = Object.assign(filter, {
        $or: [
          { first: { $regex: data.searchFilter, $options: 'i' } },
          { last: { $regex: data.searchFilter, $options: 'i' } },
          { middle: { $regex: data.searchFilter, $options: 'i' } },
          { email: { $regex: data.searchFilter, $options: 'i' } },
          { workPhone: { $regex: data.searchFilter, $options: 'i' } },
        ],
      });
    }
    if (!data.searchFilter) {
      filter = data.first ? Object.assign(filter, { first: { $regex: data.first, $options: 'i' } }) : filter;
      filter = data.last ? Object.assign(filter, { last: { $regex: data.last, $options: 'i' } }) : filter;
      filter = data.middle ? Object.assign(filter, { middle: { $regex: data.middle, $options: 'i' } }) : filter;
      filter = data.email ? Object.assign(filter, { email: { $regex: data.email, $options: 'i' } }) : filter;
      filter = data.workPhone
        ? Object.assign(filter, {
            workPhone: {
              $regex: data.workPhone,
              $options: 'i',
            },
          })
        : filter;
    }
    filter = data.createdAt ? Object.assign(filter, { createdAt: { $gte: data.createdAt, $lte: new Date() } }) : filter;
    filter = data.updatedAt ? Object.assign(filter, { updatedAt: { $gte: data.updatedAt, $lte: new Date() } }) : filter;
    filter = data.birthDate ? Object.assign(filter, { birthDate: { $gte: data.birthDate, $lte: new Date() } }) : filter;
    filter = data.active ? Object.assign(filter, { active: data.active }) : filter;
    if (data.company) {
      filter = Object.assign(filter, { company: data.company });
    }
    try {
      console.dir(filter, { depth: 5 });
      clients = await this.clientModel.paginate(filter, data.pagination);
      result = Core.ResponseDataRecords('Список клиентов', clients.data, clients.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск клиента по ID
   * @return({Core.Client.Schema[]})
   * @param data
   */
  async findClient(data: { id: string; req: any }): Promise<Core.Client.Schema> {
    let result;
    let filter = data.req?.filterQuery;
    try {
      const client = await this.clientModel.findOne({ _id: data.id, filter }).exec();
      if (client !== null) {
        result = Core.ResponseData('Клиент найден', client);
      } else {
        result = Core.ResponseError('Клиент с таким ID не найден', HttpStatus.OK, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Изменение данных клиента
   * @param updateData
   * @return({Core.Response.Answer})
   */
  async updateClient(updateData: { id: string; req: any; data: Core.Client.Schema }): Promise<Core.Response.Answer> {
    let result;
    let filter = updateData.req?.filterQuery;
    try {
      const client = await this.clientModel.findOne({ _id: updateData.id, filter }).exec();
      let oldClient;
      if (client) {
        oldClient = client.toObject();
        const newClient = await this.clientModel.findOneAndUpdate({ _id: updateData.id }, updateData.data, {
          new: true,
        });
        await this.activityService.historyData(
          oldClient,
          newClient.toObject(),
          this.clientModel,
          updateData.req.userID,
        );
        result = Core.ResponseData('Клиент успешно изменен', newClient);
      } else {
        result = Core.ResponseError('Клиент с таким ID не найден', HttpStatus.OK, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
