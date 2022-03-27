import { Controller } from '@nestjs/common';
import { CompanyService } from '../services';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class CompanyController {
  constructor(private readonly appService: CompanyService) {}

  @MessagePattern('company:create')
  async createCompany(@Payload() companyData: Core.Company.Schema) {
    return await this.appService.createCompany(companyData);
  }

  @MessagePattern('company:archive')
  async archiveCompany(@Payload() archiveData: Core.Company.ArchiveData) {
    return await this.appService.archiveCompany(archiveData);
  }

  @MessagePattern('company:list')
  async listCompanies(data: any) {
    return await this.appService.listCompanies(data);
  }

  @MessagePattern('company:find')
  async findCompany(@Payload() id: string) {
    return await this.appService.findCompany(id);
  }

  @MessagePattern('company:update')
  async updateCompany(@Payload() companyData: Core.Company.UpdateData) {
    return await this.appService.updateCompany(companyData);
  }

  @MessagePattern('company:checkout')
  async checkoutCompany(@Payload() inn: string) {
    return await this.appService.checkoutCompany(inn);
  }
}
