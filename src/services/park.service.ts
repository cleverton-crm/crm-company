import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Companies, CompanyModel } from '../schemas/company.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ActivityService } from './activity.service';
import { ParkCompany, ParkCompanyList, ParkCompanyListModel, ParkCompanyModel } from '../schemas/park.schema';
import { Core } from 'crm-core';

Injectable();
export class ParkCompanyService {
  private readonly parkModel: ParkCompanyModel<ParkCompany>;
  private readonly parkListModel: ParkCompanyListModel<ParkCompanyList>;
  private readonly companyModel: CompanyModel<Companies>;

  constructor(@InjectConnection() private connection: Connection, private readonly activityService: ActivityService) {
    this.parkModel = this.connection.model('ParkCompany') as ParkCompanyModel<ParkCompany>;
    this.parkListModel = this.connection.model('ParkCompanyList') as ParkCompanyListModel<ParkCompanyList>;
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
  }

  /**
   * Создание хранилища компании
   * @param data
   */
  async createPark(data: { cid: string; parkData: Core.Company.ParkCompany.ParkSchema }): Promise<Core.Response.Data> {
    let result;
    const park = new this.parkModel({ ...data.parkData });
    const company = await this.companyModel.findOne({ _id: data.cid, active: true }).exec();
    try {
      if (company) {
        park.company = data.cid;
        park.name = 'Парк компании ' + company.name;
        await park.save();
      } else {
        throw new NotFoundException('Неизвестаня компания. Укажите правильный идентификатор компании');
      }
      result = Core.ResponseDataAsync('Емкостный парк успешно создан', park);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Добавление емкостного парка к хранилищу компании
   * @param data
   */
  async addStoreToPark(data: { parkId: string; storeData: any; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const park = await this.parkModel.findOne({ _id: data.parkId, active: true, filter });
    try {
      if (park) {
        park.store.set(Date.now().toString(), data.storeData);
        await this.parkModel.findOneAndUpdate({ _id: park._id }, park);
        result = Core.ResponseDataAsync('Емкостный парк успешно добавлен', data.storeData);
      } else {
        result = Core.ResponseError('Хранилища компании с таким ID не существует', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Добавление топлива к емкостному парку
   * @param data
   */
  async addFuelToStore(data: {
    parkId: string;
    storeId: string;
    fuelData: Core.Company.ParkCompany.FuelInfoSchema;
    req: any;
  }) {
    let result;
    const filter = data.req?.filterQuery;
    const park = await this.parkModel.findOne({
      _id: data.parkId,
      [`store.${data.storeId}`]: { $exists: true },
      active: true,
      filter,
    });
    try {
      if (park) {
        this.checkFuelName(park.store.get(data.storeId).fuels, data.fuelData.name);
        park.store.get(data.storeId).fuels.push(data.fuelData);
        const dataFuels = this.fuelSummary(park.store.get(data.storeId).fuels);
        data.fuelData.id = Date.now().toString();
        await this.parkModel.findOneAndUpdate(
          { _id: data.parkId },
          {
            $push: { [`store.${data.storeId}.fuels`]: data.fuelData },
            $set: {
              [`store.${data.storeId}.resultCapacity`]: dataFuels.capacity,
              [`store.${data.storeId}.resultConsumption`]: dataFuels.consumption,
            },
          },
          { new: true },
        );
        result = Core.ResponseSuccess('Топливо успешно добавлено');
      } else {
        result = Core.ResponseError('Емкостного парка с таким ID не существует', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  private fuelSummary(fuels: any) {
    if (!Array.isArray(fuels)) {
      throw new BadRequestException('Ошибка. Данные о топливе не является массивом');
    }
    let resultCapacity: Number = 0;
    let resultConsumption: Number = 0;
    for (let fuel of fuels) {
      resultCapacity += fuel.capacity;
      resultConsumption += fuel.consumption;
    }
    return { capacity: resultCapacity, consumption: resultConsumption };
  }

  private checkFuelName(fuels: any, findName: string) {
    for (let fuel of fuels) {
      if (fuel.name === findName) {
        throw new BadRequestException('Топливо с таким названием уже существует');
      }
    }
  }

  /**
   * Архивация хранилища компании
   * @param data
   */
  async archivePark(data: { id: string; active: boolean; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    try {
      const park = await this.parkModel.findOne({ _id: data.id, filter }).exec();
      if (park) {
        const oldPark = park.toObject();
        park.active = data.active;
        const newPark = await this.parkModel.findOneAndUpdate({ _id: data.id }, park, { new: true });
        await this.activityService.historyData(oldPark, newPark.toObject(), this.parkModel, data.req.userID);
        if (!park.active) {
          result = Core.ResponseSuccess('Хранилище было отправлено в архив');
        } else {
          result = Core.ResponseSuccess('Хранилище было разархивировано');
        }
      } else {
        result = Core.ResponseError('Хранилище с таким ID не найдено', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Изменение емкостного парка
   * @param data
   */
  async updateStore(data: { parkId: string; storeId: string; storeData: any; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const park = await this.parkModel.findOne({ _id: data.parkId, active: true, filter });
    let queryData = {};
    try {
      if (park) {
        Object.entries(data.storeData).map((key) => {
          if (key[0] !== 'fuels') {
            queryData = Object.assign(queryData, { [`store.${data.storeId}.${key[0]}`]: key[1] });
          } else {
            delete data.storeData.fuels;
          }
        });
        await this.parkModel.findOneAndUpdate({ _id: park._id }, { $set: queryData });
        result = Core.ResponseDataAsync('Емкостный парк успешно изменен', data.storeData);
      } else {
        result = Core.ResponseError('Хранилища компании с таким ID не существует', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Изменение данных топлива
   * @param data
   */
  async updateFuel(data: {
    parkId: string;
    storeId: string;
    fuelId: string;
    fuelData: Core.Company.ParkCompany.FuelInfoSchema;
    req: any;
  }) {
    let result;
    const filter = data.req?.filterQuery;
    const park = await this.parkModel.findOne({
      _id: data.parkId,
      [`store.${data.storeId}`]: { $exists: true },
      active: true,
      filter,
    });
    try {
      if (park) {
        park.store.get(data.storeId).fuels.pop(data.fuelData);
        park.store.get(data.storeId).fuels.push(data.fuelData);
        const dataFuels = this.fuelSummary(park.store.get(data.storeId).fuels);
        const updateFuel = await this.parkModel.findOneAndUpdate(
          { _id: data.parkId, [`store.${data.storeId}.fuels.id`]: data.fuelId },
          {
            $set: {
              [`store.${data.storeId}.fuels.$`]: { ...data.fuelData, id: data.fuelId },
              [`store.${data.storeId}.resultCapacity`]: dataFuels.capacity,
              [`store.${data.storeId}.resultConsumption`]: dataFuels.consumption,
            },
          },
          { new: true, upsert: true },
        );
        if (updateFuel) {
          result = Core.ResponseSuccess('Топливо успешно изменено');
        } else {
          result = Core.ResponseError('Топливо c таким идентификатором не найдено', HttpStatus.NOT_FOUND, 'Not Found');
        }
      } else {
        result = Core.ResponseError('Хранилище с таким идентификатором не найдено', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Список хранилища компаний
   * @param data
   */
  async listParks(data: any) {
    let result;
    const { companyId, pagination, req, active, createdAt, updatedAt } = data;
    let filter = {};
    filter = Object.assign(filter, req.filterQuery);
    filter = active ? Object.assign(filter, { active: active }) : filter;
    filter = Object.assign(filter, { company: companyId });
    filter = createdAt ? Object.assign(filter, { createdAt: { $gte: createdAt, $lte: new Date() } }) : filter;
    filter = updatedAt ? Object.assign(filter, { updatedAt: { $gte: updatedAt, $lte: new Date() } }) : filter;
    try {
      const parks = await this.parkListModel.paginate(filter, pagination);
      result = Core.ResponseDataRecords('Список емкостных парков', parks.data, parks.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск хранилища компании по ID
   * @param data
   */
  async findPark(data: { id: string; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    try {
      const park = await this.parkModel.findOne({ _id: data.id, filter, active: true }).exec();
      if (park !== null) {
        result = Core.ResponseData('Хранилище компании найдено', park);
      } else {
        result = Core.ResponseError('Хранилище с таким идентификатором не найдено', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Удаление емкостного парка
   * @param data
   */
  async deleteStore(data: { parkId: string; storeId: string; req: any }) {
    let result;
    const filter = data.req?.filterQuery || {};
    const park = await this.parkModel
      .findOne({ _id: data.parkId, [`store.${data.storeId}`]: { $exists: true }, ...filter })
      .exec();
    try {
      if (Object.keys(filter).length === 0) {
        if (park) {
          park.store.delete(data.storeId);
          await park.save();
          result = Core.ResponseSuccess('Емкостный парк успешно удален');
        } else {
          result = Core.ResponseError(
            'Емкостный парк с таким идентификатором не найден',
            HttpStatus.NOT_FOUND,
            'Not Found',
          );
        }
      } else {
        result = Core.ResponseError(
          'Удаление емкостного парка доступно только администратору',
          HttpStatus.BAD_REQUEST,
          'Bad Request',
        );
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Удаление топлива
   * @param data
   */
  async deleteFuel(data: { parkId: string; storeId: string; fuelId: string; req: any }) {
    let result;
    const filter = data.req?.filterQuery || {};
    const park = await this.parkModel
      .findOne({ _id: data.parkId, [`store.${data.storeId}`]: { $exists: true }, ...filter })
      .exec();
    let resultSearchFuel = [];
    park.store.get(data.storeId).fuels.map((fuel) => {
      if (fuel.id === data.fuelId) {
        resultSearchFuel.push(fuel);
      }
    });
    try {
      if (Object.keys(filter).length === 0) {
        if (park) {
          park.store.get(data.storeId).fuels.pop(resultSearchFuel[0]);
          const dataFuels = this.fuelSummary(park.store.get(data.storeId).fuels);
          const updateFuel = await this.parkModel.findOneAndUpdate(
            { _id: data.parkId, [`store.${data.storeId}.fuels.id`]: data.fuelId },
            {
              $pull: { [`store.${data.storeId}.fuels`]: { id: data.fuelId } },
              $set: {
                [`store.${data.storeId}.resultCapacity`]: dataFuels.capacity,
                [`store.${data.storeId}.resultConsumption`]: dataFuels.consumption,
              },
            },
            { new: true },
          );
          if (updateFuel) {
            result = Core.ResponseSuccess('Топливо успешно удалено');
          } else {
            result = Core.ResponseError('Топливо c таким ID не найдено', HttpStatus.NOT_FOUND, 'Not Found');
          }
        } else {
          result = Core.ResponseError(
            'Хранилище с таким идентификатором не найдено',
            HttpStatus.NOT_FOUND,
            'Not Found',
          );
        }
      } else {
        result = Core.ResponseError(
          'Удаление топлива доступно только администратору',
          HttpStatus.BAD_REQUEST,
          'Bad Request',
        );
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }
}
