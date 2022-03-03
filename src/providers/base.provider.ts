import { Core } from 'crm-core';
import mongoosePaginator = require('mongoose-paginate-v2');

export const BaseProvider = (className: any, schemaName: any) => {
  return {
    name: className.name,
    useFactory: () => {
      mongoosePaginator.paginate.options = {
        limit: 25,
        customLabels: Core.ResponseDataLabels,
      };
      schemaName.plugin(mongoosePaginator);

      schemaName.set('toJSON', { virtuals: true });
      schemaName.set('toObject', { virtuals: true });

      return schemaName;
    },
  };
};
