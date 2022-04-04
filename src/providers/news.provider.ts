import { BaseProvider } from './base.provider';
import { News, NewsList, NewsListSchema, NewsSchema } from '../schemas/news.schema';

export const NewsProviderSchema = BaseProvider(News, NewsSchema);
export const NewsListProviderSchema = BaseProvider(NewsList, NewsListSchema);
