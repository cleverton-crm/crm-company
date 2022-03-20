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
   * @param {Core.Client.ArchiveData} archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveClient(archiveData: Core.Client.ArchiveData): Promise<Core.Response.Answer> {
    let result;
    const client = await this.clientModel.findOne({ _id: archiveData.id }).exec();
    const oldClient = client.toObject();
    if (client) {
      client.active = archiveData.active;
      const newClient = await this.clientModel.findOneAndUpdate({ _id: archiveData.id }, client, { new: true });
      await this.activityService.historyData(oldClient, newClient.toObject(), this.clientModel, archiveData.userId);
      if (!client.active) {
        result = Core.ResponseSuccess('Клиент был отправлен в архив');
      } else {
        result = Core.ResponseSuccess('Клиент был разархивирован');
      }
    } else {
      result = Core.ResponseError('Клиент с таким id не найден', HttpStatus.OK, 'Not Found');
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
    if (data.company) {
      filter = Object.assign(filter, { company: data.company });
    }
    try {
      clients = await this.clientModel.paginate({ active: true, ...filter }, data.pagination);
      result = Core.ResponseDataRecords('Список клиентов', clients.data, clients.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск клиента по ID
   * @return({Core.Client.Schema[]})
   * @param id
   */
  async findClient(id: string): Promise<Core.Client.Schema> {
    let result;
    const client = await this.clientModel.findOne({ _id: id }).exec();
    try {
      if (client !== null) {
        result = Core.ResponseData('Клиент найден', client);
      } else {
        result = Core.ResponseSuccess('Клиент с таким идентификатором не найден');
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
  async updateClient(updateData: Core.Client.UpdateData): Promise<Core.Response.Answer> {
    let result;
    const client = await this.clientModel.findOne({ _id: updateData.id }).exec();
    const oldClient = client.toObject();
    try {
      const newClient = await this.clientModel.findOneAndUpdate({ _id: updateData.id }, updateData.data, { new: true });
      await this.activityService.historyData(oldClient, newClient.toObject(), this.clientModel, updateData.userId);
      result = Core.ResponseData('Клиент успешно изменен', newClient);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
