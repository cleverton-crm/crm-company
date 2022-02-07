import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';
import { LeadsService } from '../services/leads.service';

@Controller()
export class LeadsController {
  constructor(private readonly appService: LeadsService) {}

  @MessagePattern('leads:create')
  async createLead(
    @Payload() leadData: { data: Core.Deals.Schema; owner: any },
  ) {
    return await this.appService.createLead(leadData);
  }

  @MessagePattern('leads:archive')
  async archiveLead(@Payload() archiveData: Core.Deals.ArchiveData) {
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
  async updateLead(@Payload() updateData: Core.Deals.UpdateData) {
    return await this.appService.updateLead(updateData);
  }

  @MessagePattern('leads:change:status')
  async changeLeadStatus(
    @Payload() data: { id: string; sid: string; owner: any },
  ) {
    return await this.appService.changeLeadStatus(data);
  }

  @MessagePattern('leads:change:owner')
  async changeLeadOwner(
    @Payload() data: { id: string; oid: string; owner: any },
  ) {
    return await this.appService.changeLeadOwner(data);
  }
  @MessagePattern('leads:failure')
  async failureLead(@Payload() data: { id: string; owner: any }) {
    return await this.appService.failureLead(data);
  }
}
