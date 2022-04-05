import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class News extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, default: '' })
  owner: string;

  @Prop({ type: String, default: 'news' })
  object: string;

  @Prop({ type: String, default: '' })
  content: string;

  @Prop({ type: Map, default: {} })
  comments: Map<string, any>;

  @Prop({ type: Map, default: {} })
  avatar: Map<string, any>;
}
export type NewsModel<T extends Document> = PaginateModel<News>;
export const NewsSchema = SchemaFactory.createForClass(News);
export const NewsModel: NewsModel<News> = model<News>('News', NewsSchema) as NewsModel<News>;

@Schema({ collection: 'newsList' })
export class NewsList extends News {}

export type NewsListModel<T extends Document> = PaginateModel<NewsList>;
export const NewsListSchema = SchemaFactory.createForClass(NewsList);
export const NewsListModel: NewsListModel<NewsList> = model<NewsList>(
  'NewsList',
  NewsListSchema,
) as NewsListModel<NewsList>;
