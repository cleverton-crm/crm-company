import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';
import { LeadsService } from '../services/leads.service';

@Controller()
export class LeadsController {
  constructor(private readonly appService: LeadsService) {}

  @MessagePattern('leads:create')
  async createClient(@Payload() leadData: Core.Leads.Schema) {
    return await this.appService.createLead(leadData);
  }

  @MessagePattern('leads:archive')
  async archiveClient(@Payload() archiveData: Core.Leads.ArchiveData) {
    return await this.appService.archiveLead(archiveData);
  }

  @MessagePattern('leads:list')
  async listClients() {
    return await this.appService.listLeads();
  }

  @MessagePattern('leads:find')
  async findClient(id: string) {
    return await this.appService.findLead(id);
  }

  @MessagePattern('leads:update')
  async updateDeal(@Payload() updateData: Core.Leads.UpdateData) {
    return await this.appService.updateLead(updateData);
  }
}
