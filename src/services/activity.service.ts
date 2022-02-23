import { Injectable, Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Activity } from 'src/schemas/activity.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ActivityService {
  private readonly activityModel: Model<Activity>;
  private readonly logger = new Logger(ActivityService.name);

  constructor(@InjectConnection() private connection: Connection, private jwtService: JwtService) {
    this.activityModel = this.connection.model('Activity') as Model<Activity>;
  }

  /**
   * Сохранение истории действий с разными объектами
   * @param oldSchema - Старые данные до изменения
   * @param newSchema - Новые данные после изменений
   * @param className - Модель схемы
   * @param userId - Автор изменения
   */
  async historyData(oldSchema: any, newSchema: any, className: any, userId: string) {
    const paths = className.schema.paths;
    let collectionChanging = new Map<string, any>();

    for (let [key, value] of Object.entries(oldSchema)) {
      for (let [newKey, newValue] of Object.entries(newSchema)) {
        if (key === newKey) {
          switch (typeof newValue) {
            case 'boolean':
              if (Boolean(newValue) !== Boolean(value)) {
                collectionChanging.set(newKey, {
                  oldData: value,
                  newData: newValue,
                  text: paths[key].options?.changelog,
                });
              }
              break;
            case 'string':
              if (String(newValue) !== String(value)) {
                collectionChanging.set(newKey, {
                  oldData: value,
                  newData: newValue,
                  text: paths[key].options?.changelog,
                });
              }
              break;
            case 'object':
              if (value instanceof Date && newValue instanceof Date && String(newValue) !== String(value)) {
                collectionChanging.set(newKey, {
                  oldData: value,
                  newData: newValue,
                  text: paths[key].options?.changelog,
                });
              }
              break;
            case 'number':
              if (Number(newValue) !== Number(value)) {
                collectionChanging.set(newKey, {
                  oldData: value,
                  newData: newValue,
                  text: paths[key].options?.changelog,
                });
              }
              break;
            default:
              break;
          }
        }
      }
    }
    const newToken = this.jwtService.sign(oldSchema, { secret: newSchema.id });
    const oldToken = this.jwtService.sign(newSchema, { secret: newSchema.id });
    if (collectionChanging.size !== 1) {
      const saveHistory = new this.activityModel({
        objectId: newSchema._id,
        changelog: collectionChanging,
        newToken: newToken,
        oldToken: oldToken,
        type: newSchema.object,
        author: userId,
      });
      await saveHistory.save();
      this.logger.log(`Были добавлены изменения в объекте ${newSchema.object}`);
    }
  }

  isEqual(object1: any, object2: any) {
    const props1 = Object.getOwnPropertyNames(object1);
    const props2 = Object.getOwnPropertyNames(object2);

    if (props1.length !== props2.length) {
      return false;
    }

    for (let i = 0; i < props1.length; i += 1) {
      const prop = props1[i];
      const bothAreObjects = typeof object1[prop] === 'object' && typeof object2[prop] === 'object';

      if (
        (!bothAreObjects && object1[prop] !== object2[prop]) ||
        (bothAreObjects && !this.isEqual(object1[prop], object2[prop]))
      ) {
        return false;
      }
    }

    return true;
  }
}
