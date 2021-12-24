import { Controller } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class CompanyController {
  constructor(private readonly appService: CompanyService) {}

  @MessagePattern('company:create')
  async createCompany(companyData: Core.Company.Schema) {
    return await this.appService.createCompany(companyData);
  }

  @MessagePattern('company:archive')
  async archiveCompany(@Payload() archiveData: Core.Company.ArchiveData) {
    return await this.appService.archiveCompany(archiveData);
  }
}
