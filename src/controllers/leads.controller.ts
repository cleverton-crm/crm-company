import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';
import { LeadsService } from '../services/leads.service';

@Controller()
export class LeadsController {
  constructor(private readonly appService: LeadsService) {}

  @MessagePattern('leads:create')
  async createLead(@Payload() leadData: Core.Leads.Schema) {
    return await this.appService.createLead(leadData);
  }

  @MessagePattern('leads:archive')
  async archiveLead(@Payload() archiveData: Core.Leads.ArchiveData) {
    return await this.appService.archiveLead(archiveData);
  }

  @MessagePattern('leads:list')
  async listLeads() {
    return await this.appService.listLeads();
  }

  @MessagePattern('leads:find')
  async findLead(id: string) {
    return await this.appService.findLead(id);
  }

  @MessagePattern('leads:update')
  async updateLead(@Payload() updateData: Core.Leads.UpdateData) {
    return await this.appService.updateLead(updateData);
  }
}
