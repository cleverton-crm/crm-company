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
  async listCars(data: { company: string }): Promise<Core.Response.Answer> {
    let result;
    let cars;
    let filter = {};
    try {
      if (data.company) {
        filter = Object.assign(filter, { company: data.company });
      }
      cars = await this.carsModel.find(filter).exec();
      result = Core.ResponseData('List of cars', cars);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Поиск машины по ID
   * @param id
   * @return ({Core.Response.Answer})
   */
  async findCar(id: string): Promise<Core.Response.Answer> {
    let result;
    const car = await this.carsModel.findOne({ _id: id }).exec();
    try {
      if (car !== null) {
        result = Core.ResponseData('Транспорт найден', car);
      } else {
        result = Core.ResponseSuccess('Транспорт с таким идентификатором не найден');
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
  async archiveCar(archiveData: Core.Cars.ArchiveData): Promise<Core.Response.Answer> {
    let result;
    const car = await this.carsModel.findOne({ _id: archiveData.id }).exec();
    const oldCar = car.toObject();
    if (car) {
      car.active = archiveData.active;
      const newCar = await this.carsModel.findOneAndUpdate({ _id: archiveData.id }, car, { new: true });
      await this.activityService.historyData(oldCar, newCar.toObject(), this.carsModel, archiveData.userId);
      if (!car.active) {
        result = Core.ResponseSuccess('Транспорт был отправлен в архив');
      } else {
        result = Core.ResponseSuccess('Транспорт был разархивирован');
      }
    } else {
      result = Core.ResponseError('Транспорт с таким ID не найден', HttpStatus.OK, 'Not Found');
    }
    return result;
  }

  /**
   * Изменение данных транспорта
   * @param updateData
   * @return ({Core.Response.Answer})
   */
  async updateCar(updateData: Core.Cars.UpdateData): Promise<Core.Response.Answer> {
    let result;
    const car = await this.carsModel.findOne({ _id: updateData.id }).exec();
    const oldCar = car.toObject();
    try {
      const newCar = await this.carsModel.findOneAndUpdate({ _id: updateData.id }, updateData.data);
      await this.activityService.historyData(oldCar, newCar.toObject(), this.carsModel, updateData.userId);
      result = Core.ResponseSuccess('Данные о транспорте изменены');
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }
}
