import { Injectable } from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';

import * as csv from 'csv-parser';
import * as fs from 'fs';
import Collection from '@discordjs/collection';
import { Profile, ProfileModel } from '../schemas/profile.schema';
import { Companies, CompanyModel } from '../schemas/company.schema';
import { ClientModel, Clients } from '../schemas/clients.schema';

export interface CompanyData {
  suggestions: any[];
}
@Injectable()
export class DataParserHelper {
  private DATA_URI = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';
  private TOKEN = 'a82c7bbdd650df79b0df2325586e4f3c7b86a26a';
  private instance;
  constructor(private httpService: HttpService) {
    this.instance = axios.create({
      baseURL: this.DATA_URI,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Token ' + this.TOKEN,
      },
    });
  }

  async fetchCompany(inn: string): Promise<AxiosResponse<CompanyData>> {
    return this.instance.post('', { query: inn }).then((response) => response.data.suggestions);
  }

  fetchCompanyData(inn: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(this.fetchCompany(inn));
    });
  }

  findDataCompany(inn: string): Observable<AxiosResponse<CompanyData[]>> {
    const dadata = this.httpService.post(
      this.DATA_URI,
      { query: inn },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Token ' + this.TOKEN,
        },
      },
    );
    return dadata;
  }

  getClientsDataCSV(): any {
    const collectionClient = new Collection<string, any>();
    const temp = fs.createReadStream(__dirname + '/../../clients.csv');
    return new Promise((resolve) => {
      temp
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => {
          data.name = {};
          data.metadata = {};
          data.passport = {};
          data.phones = [];

          // INN
          if (data['Контрагент ИНН']) {
            data.inn = data['Контрагент ИНН'];
          }
          delete data['Контрагент ИНН'];
          // FIO
          if (data['﻿ФИО']) {
            let names = data['﻿ФИО'].split(' ');
            data.first = names[1];
            data.last = names[0];
            data.middle = names[2];
          }
          delete data['﻿ФИО'];

          if (data['Телефон']) {
            data.phones.push(data['Телефон']);
          }
          delete data['Телефон'];

          if (data['Адрес электронной почты']) {
            data.email = data['Адрес электронной почты'];
          } else {
            data.email = '';
          }
          delete data['Адрес электронной почты'];

          if (data['Паспорт серия']) {
            data.passport.series = data['Паспорт серия'];
          }
          delete data['Паспорт серия'];

          if (data['Паспорт номер']) {
            data.passport.number = data['Паспорт номер'];
          }
          delete data['Паспорт номер'];

          if (data['Паспорт кем выдан']) {
            data.passport.issuedBy = data['Паспорт кем выдан'];
          }
          delete data['Паспорт кем выдан'];

          if (data['Паспорт дата выдачи']) {
            // data.passport.dateOfIssue = data['Паспорт дата выдачи'];
          }
          delete data['Паспорт дата выдачи'];

          if (data['Должность по визитке']) {
            data.roleInCompany = data['Должность по визитке'];
          }
          delete data['Должность по визитке'];

          if (data['Контрагент']) {
            data.metadata.contragent = data['Контрагент'];
          }
          delete data['Контрагент'];
          delete data['Пол'];

          delete data['Дата рождения'];

          if (data['ФИО родительный падеж']) {
            data.metadata.genitive = data['ФИО родительный падеж'].split(' ');
          }
          delete data['ФИО родительный падеж'];

          if (data['ФИО дательный падеж']) {
            data.metadata.dative = data['ФИО дательный падеж'].split(' ');
          }
          delete data['ФИО дательный падеж'];

          if (data['Должность родительный падеж']) {
            data.metadata.genitiveRole = data['Должность родительный падеж'];
          }
          delete data['Должность родительный падеж'];

          if (data['Должность дательный падеж']) {
            data.metadata.dativeRole = data['Должность дательный падеж'];
          }
          delete data['Должность дательный падеж'];

          collectionClient.set(data.inn, data);
        })
        .on('end', () => {
          resolve(collectionClient);
        });
    });
  }

  /**
   * Создаем данные о компании из файла
   */
  getCompanyDataCSV(): any {
    const collection = new Collection<string, any>();
    const temp = fs.createReadStream(__dirname + '/../../company.csv');
    return new Promise((resolve) => {
      temp
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => {
          data.partner = {};
          data.status = {};
          data.phones = [];
          if (data['﻿ИНН']) {
            data.inn = data['﻿ИНН'];
            delete data['﻿ИНН'];
          }
          if (data['Менеджер']) {
            data.manager = data['Менеджер'].split(' ');
            delete data['Менеджер'];
          } else {
            data.manager = ['no'];
          }

          if (data['Реальный клиент'] !== '') {
            data.status = 'Реальный';
          } else {
            data.status = '';
          }

          delete data['Реальный клиент'];

          if (data['Поставщик'] !== '') {
            data.partner.gsmPost = 'Трейдер';
          } else {
            data.partner.gsmPost = '';
          }

          delete data['Поставщик'];
          if (data['Розничный клиент'] !== '' && data['Оптовый клиент'] === '') {
            data.partner.gsmBought = 'Розничный';
          } else if (data['Оптовый клиент'] !== '' && data['Розничный клиент'] === '') {
            data.partner.gsmBought = 'Оптовый';
          } else if (data['Розничный клиент'] === '' && data['Оптовый клиент'] === '') {
            data.partner.gsmBought = '';
          }
          delete data['Розничный клиент'];
          delete data['Оптовый клиент'];

          if (data['Безналичная оплата'] !== '' && data['Наличная оплата'] !== '') {
            data.partner.payType = 'Безналичная и Наличная';
          } else if (data['Безналичная оплата'] !== '') {
            data.partner.payType = 'Безналичная';
          } else if (data['Наличная оплата'] !== '') {
            data.partner.payType = 'Наличная';
          } else if (data['Безналичная оплата'] === '' && data['Наличная оплата'] === '') {
            data.partner.payType = '';
          }

          delete data['Наличная оплата'];
          delete data['Безналичная оплата'];

          if (data['Телефон']) {
            data.phones.push(data['Телефон']);
          }

          delete data['Телефон'];

          if (data['Факс']) {
            data.fax = data['Факс'];
            delete data['Факс'];
          } else {
            data.fax = '';
            delete data['Факс'];
          }
          if (data['Адрес электронной почты']) {
            data.emails = data['Адрес электронной почты'].split(' ');
            delete data['Адрес электронной почты'];
          } else {
            data.emails = '';
            delete data['Адрес электронной почты'];
          }

          collection.set(data.inn, data);
          return collection;
        })
        .on('end', () => {
          resolve(collection);
        });
    });
  }

  async insertClient(companyModel: CompanyModel<Companies>, clientModel: ClientModel<Clients>) {
    const listClients = await this.getClientsDataCSV();
    for (let key of Object.keys(Object.fromEntries(listClients))) {
      let company = await companyModel.findOne({ inn: key }).exec();
      let client = new clientModel(listClients.get(key));

      if (company) {
        client.company = company._id;
        client.owner = company.owner;
        client.metadata.set('company', company.name);
      } else {
        client.owner = 'f4468854-2e85-4e07-8baa-c1ed50fc6515';
      }

      await client.save();
    }
  }

  /**
   * Import company from CSV
   * @param profileModel
   * @param companyModel
   */
  async insertCompany(profileModel: ProfileModel<Profile>, companyModel: CompanyModel<Companies>) {
    const resultCollection = new Collection();
    const companyCSV = await this.getCompanyDataCSV();
    //let companyData: Core.Company.Clear;

    for (let key of Object.keys(Object.fromEntries(companyCSV))) {
      let newCompany = companyCSV.get(key);
      if (newCompany) {
        let profileMan = await profileModel.findOne({ lastName: newCompany?.manager[0] }).exec();
        if (profileMan) {
          newCompany['owner'] = profileMan._id;
        } else {
          newCompany['owner'] = 'f4468854-2e85-4e07-8baa-c1ed50fc6515';
        }
        resultCollection.set(key, newCompany);
      }
    }
    let arrayCompany = [];
    //console.log(resultCollection);
    for (let keys of Object.keys(Object.fromEntries(resultCollection))) {
      let newData = resultCollection.get(keys);

      let companyName = await this.fetchCompanyData(keys);
      let companyData = new companyModel(newData);

      const company = await companyModel.findOne({ inn: companyData.inn }).exec();
      if (!company) {
        if (companyData.requisites.data !== undefined) {
          companyData.requisites = companyName[0];
          companyData.inn = companyData.requisites?.data.inn;
          companyData.name = companyData.requisites?.value;
          companyData.ownership = companyData.requisites?.data.opf.short;
          companyData.factLocation = companyData.requisites?.data.address.unrestricted_value;

          await companyData.save();
          //  arrayCompany.push(companyData);
        }
      }

      //fs.writeFileSync(__dirname + '/../../company.json', JSON.stringify(arrayCompany));
    }
  }
}
