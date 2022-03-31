import { ParkCompany, ParkCompanyList, ParkCompanyListSchema, ParkCompanySchema } from '../schemas/park.schema';
import { Core } from 'crm-core';
import mongoosePaginator = require('mongoose-paginate-v2');

export const ParkCompanyProviderSchema = {
  name: ParkCompany.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };
    ParkCompanySchema.plugin(mongoosePaginator);

    ParkCompanySchema.set('toJSON', { virtuals: true });
    ParkCompanySchema.set('toObject', { virtuals: true });
    ParkCompanySchema.virtual('allCapacity').get(function () {
      let summary = Object.fromEntries(this.store.entries());
      let allCapacity = 0;
      for (let key of Object.keys(summary)) {
        let result = 0;
        summary[key].fuels.forEach((fuel) => {
          result += fuel.capacity;
        });
        allCapacity += result;
      }
      return allCapacity;
    });
    ParkCompanySchema.virtual('allConsumption').get(function () {
      let summary = Object.fromEntries(this.store.entries());
      let allConsumption = 0;
      for (let key of Object.keys(summary)) {
        let result = 0;
        summary[key].fuels.forEach((fuel) => {
          result += fuel.consumption;
        });
        allConsumption += result;
      }
      return allConsumption;
    });
    return ParkCompanySchema;
  },
};

export const ParkCompanyListProviderSchema = {
  name: ParkCompanyList.name,
  useFactory: () => {
    mongoosePaginator.paginate.options = {
      limit: 25,
      customLabels: Core.ResponseDataLabels,
    };
    ParkCompanyListSchema.plugin(mongoosePaginator);

    ParkCompanyListSchema.set('toJSON', { virtuals: true });
    ParkCompanyListSchema.set('toObject', { virtuals: true });
    ParkCompanyListSchema.virtual('allCapacity').get(function () {
      let summary = Object.fromEntries(this.store.entries());
      let allCapacity = 0;
      for (let key of Object.keys(summary)) {
        let result = 0;
        summary[key].fuels.forEach((fuel) => {
          result += fuel.capacity;
        });
        allCapacity += result;
      }
      return allCapacity;
    });
    ParkCompanyListSchema.virtual('allConsumption').get(function () {
      let summary = Object.fromEntries(this.store.entries());
      let allConsumption = 0;
      for (let key of Object.keys(summary)) {
        let result = 0;
        summary[key].fuels.forEach((fuel) => {
          result += fuel.consumption;
        });
        allConsumption += result;
      }
      return allConsumption;
    });
    return ParkCompanyListSchema;
  },
};
