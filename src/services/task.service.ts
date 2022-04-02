import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Companies, CompanyModel } from '../schemas/company.schema';
import { ClientModel, Clients } from '../schemas/clients.schema';
import { DealModel, Deals } from '../schemas/deals.schema';
import { Task, TaskModel } from '../schemas/task.schema';
import { Cars, CarsModel } from '../schemas/cars.schema';
import { Core } from 'crm-core';

@Injectable()
export class TaskService {
  private readonly taskModel: TaskModel<Task>;
  private readonly dealsModel: DealModel<Deals>;
  private readonly companyModel: CompanyModel<Companies>;
  private readonly clientModel: ClientModel<Clients>;
  private readonly carsModel: CarsModel<Cars>;

  constructor(@InjectConnection() private connection: Connection) {
    this.taskModel = this.connection.model('Task') as TaskModel<Task>;
    this.clientModel = this.connection.model('Clients') as ClientModel<Clients>;
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
    this.dealsModel = this.connection.model('Deals') as DealModel<Deals>;
    this.carsModel = this.connection.model('Cars') as CarsModel<Cars>;
  }

  /**s
   * Создание задачи
   * @param taskData
   */
  async createTask(taskData: any) {
    let result;
    try {
      if (!taskData.linkType) {
        throw new BadRequestException('Отсутствует тип объекта');
      }
      const task = new this.taskModel(taskData);
      await task.save();
      result = Core.ResponseDataAsync('Задача успешно создана', task);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Изменение задачи
   * @param updateData
   */
  async updateTask(updateData: { id: string; data: any; req: any }) {
    let result;
    const filter = updateData.req?.filterQuery;
    const task = await this.taskModel.findOne({ _id: updateData.id, filter }).exec();
    try {
      if (task) {
        if (updateData.data.object) {
          throw new BadRequestException('Смена объекта запрещена');
        }
        if (updateData.data.linkId && !updateData.data.linkType) {
          throw new BadRequestException('Отсутствует тип объекта');
        }
        await this.taskModel.findOneAndUpdate({ _id: updateData.id }, updateData.data);
        result = Core.ResponseDataAsync('Задача успешно изменена', updateData.data);
      } else {
        result = Core.ResponseError('Задача с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Список задач
   * @param data
   */
  async listTasks(data: {
    createdAt: string;
    updatedAt: string;
    pagination: Core.MongoPagination;
    status: string;
    startDate: string;
    endDate: string;
    linkType: string;
  }) {
    let result;
    let filter = {};
    filter = data.createdAt ? Object.assign(filter, { createdAt: { $gte: data.createdAt, $lte: new Date() } }) : filter;
    filter = data.updatedAt ? Object.assign(filter, { updatedAt: { $gte: data.updatedAt, $lte: new Date() } }) : filter;
    filter = data.startDate ? Object.assign(filter, { startDate: { $gte: data.startDate, $lte: new Date() } }) : filter;
    filter = data.endDate ? Object.assign(filter, { endDate: { $gte: data.endDate, $lte: new Date() } }) : filter;
    filter = data.status ? Object.assign(filter, { status: data.status }) : filter;
    filter = data.linkType ? Object.assign(filter, { linkType: { $regex: data.linkType, $options: 'i' } }) : filter;
    try {
      const tasks = await this.taskModel.paginate(filter, data.pagination);
      result = Core.ResponseDataRecords('Список задач', tasks.data, tasks.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск задачи
   * @param id
   */
  async findTask(id: string) {
    let result;
    try {
      const task = await this.taskModel.findOne({ _id: id }).exec();
      if (task) {
        result = Core.ResponseData('Задача найдена', task);
      } else {
        result = Core.ResponseError('Задача с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Удаление задачи
   * @param data
   */
  async deleteTask(data: { id: string; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const task = await this.taskModel.findOne({ _id: data.id, filter }).exec();
    try {
      if (task) {
        await this.taskModel.deleteOne({ _id: data.id }).exec();
        result = Core.ResponseSuccess('Задача успешно удалена');
      } else {
        result = Core.ResponseError('Задача с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
