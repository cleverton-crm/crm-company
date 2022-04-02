import { Injectable } from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';

import * as csv from 'csv-parser';
import * as fs from 'fs';
import Collection from '@discordjs/collection';

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

  getDataCSV(): any {
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
}

// export const instance = axios.create({
//   baseURL: url,
//   headers: {
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//     Authorization: 'Token ' + token,
//   },
// });
