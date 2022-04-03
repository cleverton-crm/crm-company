import { ApiQuery } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

/**
 * Добавлем параметры перехвата
 * ApiQuery(name: 'startDate')
 * ApiQuery(name: 'endDate')
 * @constructor
 */
export function ApiDatePagination() {
  return applyDecorators(
    ApiQuery({
      name: 'startDate',
      required: false,
      description: 'Укажите началую дату',
      type: Date,
      example: '2021-01-01T00:00:00',
    }),
    ApiQuery({
      name: 'endDate',
      description: 'Укажите конечную дату',
      required: false,
      type: Date,
      example: '2021-12-31T00:00:00',
    }),
  );
}
