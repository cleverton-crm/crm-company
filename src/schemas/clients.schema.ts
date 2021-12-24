import { Prop, Schema } from '@nestjs/mongoose';
import { Core } from 'crm-core';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Clients extends Document implements Core.Client.PersonaSchema {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;
}
