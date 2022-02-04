import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';
import { LeadsService } from '../services/leads.service';

@Controller()
export class LeadsController {
  constructor(private readonly appService: LeadsService) {}

  @MessagePattern('leads:create')
  async createLead(@Payload() leadData: Core.Deals.Schema) {
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

  @MessagePattern('leads:swap')
  async swapType(@Payload() id: string) {
    return await this.appService.swapType(id);
  }
}
