import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Core } from 'crm-core';
import { Cars, CarsModel } from '../schemas/cars.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Companies, CompanyModel } from '../schemas/company.schema';

@Injectable()
export class CarsService {
  private readonly carsModel: CarsModel<Cars>;
  private readonly companyModel: CompanyModel<Companies>;

  constructor(@InjectConnection() private connection: Connection) {
    this.carsModel = this.connection.model('Cars') as CarsModel<Cars>;
    this.companyModel = this.connection.model(
      'Companies',
    ) as CompanyModel<Companies>;
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
    console.log(company);
    try {
      if (company) {
        await car.save();
      } else {
        throw new NotFoundException(
          'Неизвестаня компания. Укажите правильный идентификатор компании',
        );
      }
      result = Core.ResponseDataAsync('Транспорт успешно создан', car);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Список всех машин
   */
  async listCars(): Promise<Core.Response.Answer> {
    let result;
    const cars = await this.carsModel.find().exec();
    try {
      result = Core.ResponseData('List of cars', cars);
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Поиск машины по ID
   * @param id
   */
  async findCar(id: string): Promise<Core.Response.Answer> {
    let result;
    const car = await this.carsModel.findOne({ _id: id }).exec();
    try {
      result = Core.ResponseData('Транспорт найден', car);
    } catch (e) {
      result = Core.ResponseNotFound(
        'Транспорт с таким идентификатором не найден',
        e.status,
        e.error,
      );
    }
    return result;
  }

  /**
   * Архивация транспорта
   * @param archiveData
   */
  async archiveCar(
    archiveData: Core.Cars.ArchiveData,
  ): Promise<Core.Response.Answer> {
    let result;
    console.log(archiveData.id);
    const car = await this.carsModel.findOne({ _id: archiveData.id }).exec();
    console.log(car);
    if (car) {
      car.active = archiveData.active;
      await car.save();
      if (!car.active) {
        result = Core.ResponseSuccess('Транспорт был отправлен в архив');
      } else {
        result = Core.ResponseSuccess('Транспорт был разархивирован');
      }
    } else {
      result = Core.ResponseNotFound(
        'Транспорт с таким ID не найден',
        HttpStatus.NOT_FOUND,
        'Not Found',
      );
    }
    return result;
  }
}
