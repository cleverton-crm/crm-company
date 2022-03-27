import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Core } from 'crm-core';
import { Cars, CarsModel } from '../schemas/cars.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Companies, CompanyModel } from '../schemas/company.schema';
import { ActivityService } from './activity.service';

@Injectable()
export class CarsService {
  private readonly carsModel: CarsModel<Cars>;
  private readonly companyModel: CompanyModel<Companies>;

  constructor(@InjectConnection() private connection: Connection, private readonly activityService: ActivityService) {
    this.carsModel = this.connection.model('Cars') as CarsModel<Cars>;
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
  }

  /**
   * Создание машины
   * @param carsData
   * @return ({Core.Response.Answer})
   */
  async createCar(carsData: Core.Cars.Schema): Promise<Core.Response.Answer> {
    let result;
    const car = new this.carsModel({ ...carsData });
    const company = await this.companyModel.exists({ _id: carsData.company });
    try {
      if (company) {
        await car.save();
      } else {
        throw new NotFoundException('Неизвестаня компания. Укажите правильный идентификатор компании');
      }
      result = Core.ResponseDataAsync('Транспорт успешно создан', car);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Список всех машин
   * @return ({Core.Response.Answer})
   */
  async listCars(data: {
    company: string;
    active: boolean;
    pagination: Core.MongoPagination;
    req: any;
  }): Promise<Core.Response.Answer> {
    let result, cars;
    let filter = data.req.filterQuery;
    const active = data.active;
    try {
      if (data.company) {
        filter = Object.assign(filter, { company: data.company });
      }
      cars = await this.carsModel.paginate({ active, filter }, data.pagination);
      result = Core.ResponseDataRecords('Список транспорта', cars.data, cars.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск машины по ID
   * @return ({Core.Response.Answer})
   * @param data
   */
  async findCar(data: { id: string; req: any }): Promise<Core.Response.Answer> {
    let result;
    const filter = data.req?.filterQuery;
    try {
      const car = await this.carsModel.findOne({ _id: data.id, filter }).exec();
      if (car !== null) {
        result = Core.ResponseData('Транспорт найден', car);
      } else {
        result = Core.ResponseError('Транспорт с таким идентификатором не найден', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Архивация транспорта
   * @param archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveCar(archiveData: { id: string; req: any; active: boolean }): Promise<Core.Response.Answer> {
    let result;
    const filter = archiveData.req?.filterQuery;
    try {
      const car = await this.carsModel.findOne({ _id: archiveData.id, filter }).exec();
      if (car) {
        const oldCar = car.toObject();
        car.active = archiveData.active;
        const newCar = await this.carsModel.findOneAndUpdate({ _id: archiveData.id }, car, { new: true });
        await this.activityService.historyData(oldCar, newCar.toObject(), this.carsModel, archiveData.req.userID);
        if (!car.active) {
          result = Core.ResponseSuccess('Транспорт был отправлен в архив');
        } else {
          result = Core.ResponseSuccess('Транспорт был разархивирован');
        }
      } else {
        result = Core.ResponseError('Транспорт с таким ID не найден', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Изменение данных транспорта
   * @param updateData
   * @return ({Core.Response.Answer})
   */
  async updateCar(updateData: { id: string; req: any; data: Core.Cars.Schema }): Promise<Core.Response.Answer> {
    let result;
    const filter = updateData.req?.filterQuery;
    try {
      const car = await this.carsModel.findOne({ _id: updateData.id, filter }).exec();
      if (car) {
        const oldCar = car.toObject();
        const newCar = await this.carsModel.findOneAndUpdate({ _id: updateData.id }, updateData.data);
        await this.activityService.historyData(oldCar, newCar.toObject(), this.carsModel, updateData.req.userID);
        result = Core.ResponseSuccess('Данные о транспорте изменены');
      } else {
        result = Core.ResponseError('Транспорт с таким ID не найден', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
