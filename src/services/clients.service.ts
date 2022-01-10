import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Core } from 'crm-core';
import { ClientModel, Clients } from '../schemas/clients.schema';

@Injectable()
export class ClientService {
  private readonly clientModel: ClientModel<Clients>;

  constructor(
    @InjectConnection() private connection: Connection,
    private jwtService: JwtService,
  ) {
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
      result = {
        statusCode: HttpStatus.OK,
        message: 'Клиент успешно создан',
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Ошибка при создании клиента',
        errors: 'Bad Request',
      };
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
        result = {
          statusCode: HttpStatus.OK,
          message: 'Клиент был отправлен в архив',
        };
      } else {
        result = {
          statusCode: HttpStatus.OK,
          message: 'Клиент был разархивирован',
        };
      }
    } else {
      result = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Клиент с таким id не найден',
        errors: 'Not Found',
      };
    }
    return result;
  }

  /**
   * Список компаний
   * @return({Core.Client.Schema[]})
   */
  async listClients(): Promise<Core.Client.Schema[]> {
    let result;
    try {
      result = {
        statusCode: HttpStatus.OK,
        message: 'Clients List',
        data: await this.clientModel.find().exec(),
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: e.message,
        errors: e.error,
      };
    }
    return result;
  }

  /**
   * Поиск клиента по ID
   * @return({Core.Client.Schema[]})
   * @param {} data
   */
  async findClient(data: {
    id: string;
    company: string;
  }): Promise<Core.Client.Schema> {
    let result;
    try {
      result = {
        statusCode: HttpStatus.OK,
        message: 'Client Found',
        data: await this.clientModel
          .findOne({ $or: [{ _id: data.id }, { company: data.company }] })
          .exec(),
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: e.message,
        errors: e.error,
      };
    }
    return result;
  }
}
