import { Prop, Schema } from '@nestjs/mongoose';
import { ClientCompany } from 'crm-core';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Clients extends Document implements ClientCompany.PersonaSchema {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;
}
