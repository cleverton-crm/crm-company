import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { isBoolean, isString } from 'class-validator';
import * as moment from 'moment';

const DEFAULT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

/**
 * @description Получаем форматированные данные с датой и данные для выборки в Монго
 * промежутки времени для созданных и обновленных
 * @interface
 * @property {String} startDate - Start date
 * @property {String} startEnd - End date
 * @property {any} betweenCreatedAt - Between start and end dates of generated data
 * @property {any} betweenUpdatedAt - Between start and end dates of update data
 */
export interface DateSelector {
  startDate?: string;
  endDate?: string;
  betweenCreatedAt?: any;
  betweenUpdatedAt?: any;
}

export interface DateSelectorOptions {
  timeStart?: string;
  timeEnd?: string;
}

const BetweenCreate = (startDate, endDate) => {
  return { createdAt: { $gte: startDate, $lte: endDate } };
};
const BetweenUpdate = (startDate, endDate) => {
  return { updatedAt: { $gte: startDate, $lte: endDate } };
};

export const getRequest = (options: DateSelectorOptions = {}, context: ExecutionContext): DateSelector => {
  const req: Request = context.switchToHttp().getRequest();

  const { timeStart = 'startDate', timeEnd = 'endDate' } = options;

  const startDate: string = isString(req.query[timeStart])
    ? moment(String(req.query[timeStart])).format(DEFAULT_FORMAT)
    : null;
  const endDate: string = isString(req.query[timeEnd])
    ? moment(String(req.query[timeEnd])).format(DEFAULT_FORMAT)
    : null;

  let result: any = {};

  if (startDate) {
    result = Object.assign(result, {
      startDate,
      endDate,
      betweenCreatedAt: BetweenCreate(startDate, endDate),
      betweenUpdatedAt: BetweenUpdate(startDate, endDate),
    });
  }
  return result;
};
/**
 * @decorator DataSelectDecorator
 * Перехватываеи и формируем данные из запроса
 * @example
 *
 * #DataSelectDecorator() dateTime: DateSelector
 *  { dateTime: {
 * startDate: '2021-01-01T00:00:00.000+00:00',
 * endDate: '2021-12-31T00:00:00.000+00:00',
 * betweenCreatedAt: {
 *   createdAt: {
 *     '$gte': '2021-01-01T00:00:00.000+00:00',
 *     '$lte': '2021-12-31T00:00:00.000+00:00'
 *     }
 *  },
 * betweenUpdatedAt: {
 *    updatedAt: {
 *     '$gte': '2021-01-01T00:00:00.000+00:00',
 *     '$lte': '2021-12-31T00:00:00.000+00:00'
 *      }
 *    }
 *  }
 * }
 * @return {}
 *
 */
export const DataSelectDecorator = createParamDecorator(getRequest);
