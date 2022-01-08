import { Prop, Schema } from '@nestjs/mongoose';
import { Core } from 'crm-core';

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CompanyRequisitesState implements Core.Company.Requisites.State {
  @Prop({ type: String, default: null })
  status?: string;

  @Prop({ type: String, default: null })
  code?: string | null;

  @Prop({ type: Number, default: null })
  actuality_date?: number;

  @Prop({ type: Number, default: null })
  registration_date?: number;

  @Prop({ type: Number, default: null })
  liquidation_date?: number | null;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CompanyRequisitesOPF implements Core.Company.Requisites.OPF {
  @Prop({ type: String, default: null })
  type?: string;
  @Prop({ type: String, default: null })
  code?: string;
  @Prop({ type: String, default: null })
  full?: string;
  @Prop({ type: String, default: null })
  short?: string;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CompanyRequisitesName implements Core.Company.Requisites.Name {
  @Prop({ type: String, default: null })
  full_with_opf?: string;
  @Prop({ type: String, default: null })
  short_with_opf?: string;
  @Prop({ type: String, default: null })
  latin?: string | null;
  @Prop({ type: String, default: null })
  full?: string;
  @Prop({ type: String, default: null })
  short?: string;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CompanyRequisitesInfo implements Core.Company.Requisites.Info {
  @Prop({ type: String, default: null })
  area: string | null;
  @Prop({ type: String, default: null })
  area_fias_id: string | null;
  @Prop({ type: String, default: null })
  area_kladr_id: string | null;
  @Prop({ type: String, default: null })
  area_type: string | null;
  @Prop({ type: String, default: null })
  area_type_full: string | null;
  @Prop({ type: String, default: null })
  area_with_type: string | null;
  @Prop({ type: String, default: null })
  beltway_distance: string | null;
  @Prop({ type: String, default: null })
  beltway_hit: string;
  @Prop({ type: String, default: null })
  block: string | null;
  @Prop({ type: String, default: null })
  block_type: string | null;
  @Prop({ type: String, default: null })
  block_type_full: string | null;
  @Prop({ type: String, default: null })
  capital_marker: string;
  @Prop({ type: String, default: null })
  city: string;
  @Prop({ type: String, default: null })
  city_area: string;
  @Prop({ type: String, default: null })
  city_district: string;
  @Prop({ type: String, default: null })
  city_district_fias_id: string | null;
  @Prop({ type: String, default: null })
  city_district_kladr_id: string | null;
  @Prop({ type: String, default: null })
  city_district_type: string;
  @Prop({ type: String, default: null })
  city_district_type_full: string;
  @Prop({ type: String, default: null })
  city_district_with_type: string;
  @Prop({ type: String, default: null })
  city_fias_id: string;
  @Prop({ type: String, default: null })
  city_kladr_id: string;
  @Prop({ type: String, default: null })
  city_type: string;
  @Prop({ type: String, default: null })
  city_type_full: string;
  @Prop({ type: String, default: null })
  city_with_type: string;
  @Prop({ type: String, default: null })
  entrance: string | null;
  @Prop({ type: String, default: null })
  fias_actuality_state: string;
  @Prop({ type: String, default: null })
  fias_code: string;
  @Prop({ type: String, default: null })
  fias_id: string;
  @Prop({ type: String, default: null })
  fias_level: string;
  @Prop({ type: String, default: null })
  flat: string | null;
  @Prop({ type: String, default: null })
  flat_area: string | null;
  @Prop({ type: String, default: null })
  flat_cadnum: string | null;
  @Prop({ type: String, default: null })
  flat_fias_id: string | null;
  @Prop({ type: String, default: null })
  flat_price: string | null;
  @Prop({ type: String, default: null })
  flat_type: string | null;
  @Prop({ type: String, default: null })
  flat_type_full: string | null;
  @Prop({ type: String, default: null })
  floor: string | null;
  @Prop({ type: String, default: null })
  geo_lat: string;
  @Prop({ type: String, default: null })
  geo_lon: string;
  @Prop({ type: String, default: null })
  geoname_id: string;
  @Prop({ type: String, default: null })
  history_values: string | null;
  @Prop({ type: String, default: null })
  house: string;
  @Prop({ type: String, default: null })
  house_cadnum: string | null;
  @Prop({ type: String, default: null })
  house_fias_id: string;
  @Prop({ type: String, default: null })
  house_kladr_id: string;
  @Prop({ type: String, default: null })
  house_type: string;
  @Prop({ type: String, default: null })
  house_type_full: string;
  @Prop({ type: String, default: null })
  kladr_id: string;
  @Prop({ type: Array, default: [] })
  metro: Array<any>;
  @Prop({ type: String, default: null })
  okato: string;
  @Prop({ type: String, default: null })
  oktmo: string;
  @Prop({ type: String, default: null })
  postal_box: string | null;
  @Prop({ type: String, default: null })
  qc: string;
  @Prop({ type: String, default: null })
  qc_complete: string | null;
  @Prop({ type: String, default: null })
  qc_geo: string;
  @Prop({ type: String, default: null })
  qc_house: string | null;
  @Prop({ type: String, default: null })
  region: string;
  @Prop({ type: String, default: null })
  region_iso_code: string;
  @Prop({ type: String, default: null })
  region_type: string;
  @Prop({ type: String, default: null })
  region_type_full: string;
  @Prop({ type: String, default: null })
  region_with_type: string;
  @Prop({ type: String, default: null })
  settlement: string | null;
  @Prop({ type: String, default: null })
  settlement_fias_id: string | null;
  @Prop({ type: String, default: null })
  settlement_kladr_id: string | null;
  @Prop({ type: String, default: null })
  settlement_type: string | null;
  @Prop({ type: String, default: null })
  settlement_type_full: string | null;
  @Prop({ type: String, default: null })
  settlement_with_type: string | null;
  @Prop({ type: String, default: null })
  source: string;
  @Prop({ type: String, default: null })
  square_meter_price: string | null;
  @Prop({ type: String, default: null })
  street: string;
  @Prop({ type: String, default: null })
  street_fias_id: string;
  @Prop({ type: String, default: null })
  street_kladr_id: string;
  @Prop({ type: String, default: null })
  street_type: string;
  @Prop({ type: String, default: null })
  street_type_full: string;
  @Prop({ type: String, default: null })
  street_with_type: string;
  @Prop({ type: String, default: null })
  tax_office: string;
  @Prop({ type: String, default: null })
  tax_office_legal: string;
  @Prop({ type: String, default: null })
  timezone: string;
  @Prop({ type: String, default: null })
  unparsed_parts: string | null;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CompanyRequisitesAddress
  implements Core.Company.Requisites.Address
{
  @Prop({ type: () => CompanyRequisitesInfo, default: {} })
  data: CompanyRequisitesInfo;

  @Prop({ type: String, default: null })
  unrestricted_value: string;

  @Prop({ type: String, default: null })
  value: string;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CompanyRequisitesCompanyUs
  implements Core.Company.Requisites.CompanyUs
{
  @Prop({ type: () => CompanyRequisitesAddress, default: {} })
  address: CompanyRequisitesAddress;

  @Prop({ type: String, default: null })
  authorities: string | null;

  @Prop({ type: Number, default: 0 })
  branch_count: number;

  @Prop({ type: String, default: null })
  branch_type: string;

  @Prop({ type: String, default: null })
  documents: string | null;

  @Prop({ type: String, default: null })
  emails: string | null;

  @Prop({ type: Number, default: 0 })
  employee_count: number | string | null;

  @Prop({ type: String, default: null })
  finance: string | null;

  @Prop({ type: String, default: null })
  hid: string | null;

  @Prop({ type: String, default: null })
  inn: string;

  @Prop({ type: String, default: null })
  licenses: string | null;

  @Prop({ type: () => CompanyRequisitesName, default: {} })
  name: CompanyRequisitesName;

  @Prop({ type: String, default: null })
  ogrn: string;

  @Prop({ type: Number, default: 0 })
  ogrn_date: number;

  @Prop({ type: String, default: null })
  okato: string;

  @Prop({ type: String, default: null })
  okfs: string;

  @Prop({ type: String, default: null })
  okogu: string;

  @Prop({ type: String, default: null })
  okpo: string;

  @Prop({ type: String, default: null })
  oktmo: string;

  @Prop({ type: String, default: null })
  okved: string;

  @Prop({ type: String, default: null })
  okved_type: string;

  @Prop({ type: String, default: null })
  okveds: string | null;

  @Prop({ type: () => CompanyRequisitesOPF, default: {} })
  opf: CompanyRequisitesOPF;

  @Prop({ type: String, default: null })
  phones: string | null;

  @Prop({ type: String, default: null })
  qc: string | null;
  @Prop({ type: String, default: null })
  source: string | null;
  @Prop({ type: () => CompanyRequisitesState, default: {} })
  state: CompanyRequisitesState;
  @Prop({ type: String, default: null })
  successors: string | null;
  @Prop({ type: String, default: null })
  type: string;
}

@Schema({ timestamps: false, _id: false, versionKey: false })
export class CompanyRequisitesCompanyName
  implements Core.Company.Requisites.CompanyName
{
  @Prop({ type: () => CompanyRequisitesCompanyUs, default: {} })
  data: CompanyRequisitesCompanyUs;

  @Prop({ type: String, default: null })
  unrestricted_value: string;

  @Prop({ type: String, default: null })
  value: string;
}
