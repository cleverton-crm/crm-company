import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Companies, CompanyModel } from '../schemas/company.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { Readable } from 'stream';
XLSX.stream.set_readable(Readable);

@Injectable()
export class ImportService implements OnApplicationBootstrap {
  private xlsxLibs;
  private readonly companyModel: CompanyModel<Companies>;
  constructor(@InjectConnection() private connection: Connection) {
    this.xlsxLibs = XLSX;
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
  }

  async onApplicationBootstrap() {
    // await this.getfileExcel();
  }

  async getfileExcel() {
    console.log(`${__dirname}/companys.xlsx`);
    let buf = fs.readFileSync(`${__dirname}/../../companys.xlsx`);
    let wb = this.xlsxLibs.read(buf, { type: 'buffer' });
    console.dir(wb, { depth: 3 });
  }
}
