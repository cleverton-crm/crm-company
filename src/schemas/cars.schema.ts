import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CarsVehicleData {
  tractor: string;
  semitrailer: string;
}

@Schema({ timestamps: true })
export class Cars extends Document {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ type: Map, default: {} })
  model: Map<string, string>;

  @Prop({ type: Map, default: {} })
  typeTS: Map<string, string>;

  @Prop({ type: Map, default: {} })
  vin: Map<string, string>;

  @Prop({ type: Map, default: {} })
  calibration: Map<string, string>;

  @Prop({ type: Map, default: {} })
  carcase: Map<string, string>;

  @Prop({ type: Map, default: {} })
  chassis: Map<string, string>;

  @Prop({ type: Map, default: {} })
  color: Map<string, string>;

  @Prop({ type: String, default: null })
  company: string;

  @Prop({ type: String, default: 'cars' })
  object: string;

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: Map, default: {} })
  curbWeight: Map<string, string>;

  @Prop({ type: Map, default: {} })
  enginePower: Map<string, string>;

  @Prop({ type: Map, default: {} })
  govNumber: Map<string, string>;

  @Prop({ type: Map, default: {} })
  issueYear: Map<string, string>;

  @Prop({ type: Map, default: {} })
  maxMass: Map<string, string>;

  @Prop({ type: Map, default: {} })
  ownerCar: Map<string, string>;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}
export type CarsModel<T extends Document> = PaginateModel<Cars>;
export const CarsSchema = SchemaFactory.createForClass(Cars);
export const CarsModel: CarsModel<Cars> = model<Cars>(
  'Cars',
  CarsSchema,
) as CarsModel<Cars>;
