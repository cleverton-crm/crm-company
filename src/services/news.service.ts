import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { News, NewsList, NewsListModel, NewsModel } from '../schemas/news.schema';
import { Core } from 'crm-core';
import { BadRequestException, HttpStatus } from '@nestjs/common';

export class NewsService {
  private readonly newsModel: NewsModel<News>;
  private readonly newsListModel: NewsListModel<NewsList>;

  constructor(@InjectConnection() private connection: Connection) {
    this.newsModel = this.connection.model('News') as NewsModel<News>;
    this.newsListModel = this.connection.model('NewsList') as NewsListModel<NewsList>;
  }

  /**
   * Создание новости
   * @param newsData
   */
  async createNews(newsData: { data: any; req: any }) {
    let result;
    const news = new this.newsModel(newsData.data);
    try {
      news.owner = newsData.req.userID;
      await news.save();
      result = Core.ResponseDataAsync('Новость успешно создана', news);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Обновление новости
   * @param newsData
   */
  async updateNews(newsData: { data: any; id: string; req: any }) {
    let result;
    const filter = newsData.req?.filterQuery;
    const news = await this.newsModel.findOne({ _id: newsData.id, active: true, filter });
    try {
      if (news) {
        const updatedNews = await this.newsModel.findOneAndUpdate({ _id: newsData.id }, newsData.data);
        result = Core.ResponseDataAsync('Новость успешно изменена', updatedNews);
      } else {
        result = Core.ResponseError('Новость с таким ID не существует', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Список новостей
   * @param data
   */
  async listNews(data: { pagination: Core.MongoPagination; active: boolean }) {
    let result;
    try {
      const news = await this.newsListModel.paginate({ active: data.active }, data.pagination);
      result = Core.ResponseDataRecords('Список новостей', news.data, news.records);
    } catch (e) {
      result = Core.ResponseError(e.message, HttpStatus.BAD_REQUEST, e.error);
    }
    return result;
  }

  /**
   * Поиск новости по идентификатору
   * @param id
   */
  async findNews(id: string) {
    let result;
    const news = await this.newsModel.findOne({ _id: id, active: true });
    try {
      if (news) {
        result = Core.ResponseData('Новость найдена', news);
      } else {
        result = Core.ResponseError('Новость с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Архивация новости
   * @param data
   */
  async archiveNews(data: { id: string; active: boolean; req: any }) {
    let result;
    const filter = data.req?.filterQuery;
    const news = await this.newsModel.findOne({ _id: data.id, filter }).exec();
    try {
      if (news) {
        news.active = data.active;
        await this.newsModel.findOneAndUpdate({ _id: data.id }, news, { new: true });
        if (!news.active) {
          result = Core.ResponseSuccess('Новость была отправлена в архив');
        } else {
          result = Core.ResponseSuccess('Новость была разархивирована');
        }
      } else {
        result = Core.ResponseError('Новость с таким ID не найдена', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }

  /**
   * Комментирование новости
   * @param data
   */
  async commentNews(data: { id: string; req: any; comments: any }) {
    let result;
    const news = await this.newsModel.findOne({ _id: data.id }).exec();
    try {
      if (news) {
        news.comments.set(Date.now().toString(), {
          [data.req.userID]: data.comments,
        });
        await this.newsModel.findOneAndUpdate({ _id: data.id }, news, { new: true });
        result = Core.ResponseDataAsync('Комментарий успешно добавлен', news);
      } else {
        result = Core.ResponseError('Сделка с таким ID не существует в базе', HttpStatus.NOT_FOUND, 'Not Found');
      }
    } catch (e) {
      result = Core.ResponseError(e.message, e.status, e.error);
    }
    return result;
  }
}
