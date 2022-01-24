import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Core } from 'crm-core';
import { ClientModel, Clients } from '../schemas/clients.schema';

@Injectable()
export class ClientService {
  private readonly clientModel: ClientModel<Clients>;

  constructor(@InjectConnection() private connection: Connection) {
    this.clientModel = this.connection.model('Clients') as ClientModel<Clients>;
  }

  /**
   * Создание клиента
   * @param clientData
   * @return ({Core.Response.Answer})
   */
  async createClient(
    clientData: Core.Client.Schema,
  ): Promise<Core.Response.Answer> {
    let result;
    const client = new this.clientModel(clientData);
    try {
      await client.save();
      result = Core.ResponseSuccess('Клиент успешно создан');
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Архивация клиента
   * @param {Core.Client.ArchiveData} archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveClient(
    archiveData: Core.Client.ArchiveData,
  ): Promise<Core.Response.Answer> {
    let result;
    const client = await this.clientModel.findOne({ _id: archiveData.id });
    if (client) {
      client.active = archiveData.active;
      await client.save();
      if (!client.active) {
        result = Core.ResponseSuccess('Клиент был отправлен в архив');
      } else {
        result = Core.ResponseSuccess('Клиент был разархивирован');
      }
    } else {
      result = Core.ResponseError(
        'Клиент с таким id не найден',
        HttpStatus.OK,
        'Not Found',
      );
    }
    return result;
  }

  /**
   * Список компаний
   * @return({Core.Client.Schema[]})
   */
  async listClients(data: { company: string }): Promise<Core.Client.Schema[]> {
    let result;
    let filter = {};
    let clients;
    try {
      if (data.company) {
        filter = Object.assign(filter, { company: data.company });
      }
      clients = await this.clientModel.find(filter).exec();
      result = Core.ResponseData('List of cars', clients);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
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
    try {
      result = Core.ResponseData(
        'Клиент найден',
        await this.clientModel.findOne({ _id: id }).exec(),
      );
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
  async updateClient(
    updateData: Core.Client.UpdateData,
  ): Promise<Core.Response.Answer> {
    let result;
    try {
      const client = await this.clientModel.findOneAndUpdate(
        { _id: updateData.id },
        updateData.data,
      );
      result = Core.ResponseData('Клиент успешно изменен', client);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
