import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class StatusDeals extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({
    type: String,
    unique: true,
    index: true,
    required: true,
    description: 'Название статуса',
    changelog: 'Изменение названия статуса',
  })
  name: string;

  @Prop({ type: Boolean, default: true, description: 'Статус архивации', changelog: 'Изменение статуса архивации' })
  active: boolean;

  @Prop({ type: Boolean, default: false })
  locked: boolean;

  @Prop({ type: Boolean, default: true })
  public: boolean;

  @Prop({ type: Number, default: 1, description: 'Приоритет', changelog: 'Изменение приоритета статуса' })
  priority: number;

  @Prop({ type: String, default: null, description: 'Описание', changelog: 'Изменение описания' })
  description: string;

  @Prop({ type: String, default: null, description: 'Цвет', changelog: 'Изменение цвета' })
  color: string;

  @Prop({ type: String, default: null })
  owner: string;
}
export const StatusSchema = SchemaFactory.createForClass(StatusDeals);
