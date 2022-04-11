import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';
import { LeadsService } from '../services';

@Controller()
export class LeadsController {
  constructor(private readonly appService: LeadsService) {}

  @MessagePattern('leads:create')
  async createLead(@Payload() leadData: { data: Core.Deals.Schema; owner: any }) {
    return await this.appService.createLead(leadData);
  }

  @MessagePattern('leads:company:create')
  async createCompanyLead(@Payload() leadData: Core.Company.Schema) {
    return await this.appService.createCompanyLead(leadData);
  }

  @MessagePattern('leads:archive')
  async archiveLead(@Payload() archiveData: { id: string; req: any; active: boolean }) {
    return await this.appService.archiveLead(archiveData);
  }

  @MessagePattern('leads:list')
  async listLeads(@Payload() data: any) {
    return await this.appService.listLeads(data);
  }

  @MessagePattern('leads:clients:list')
  async listLeadClients(@Payload() data: { pagination: Core.MongoPagination; req: any }) {
    return await this.appService.listLeadClients(data);
  }

  @MessagePattern('leads:companies:list')
  async listLeadCompanies(@Payload() data: { pagination: Core.MongoPagination; req: any }) {
    return await this.appService.listLeadCompanies(data);
  }

  @MessagePattern('leads:find')
  async findLead(@Payload() data: { id: string; req: any }) {
    return await this.appService.findLead(data);
  }

  @MessagePattern('leads:client:find')
  async findLeadClient(@Payload() data: { id: string; req: any }) {
    return await this.appService.findLeadClient(data);
  }

  @MessagePattern('leads:company:find')
  async findLeadCompany(@Payload() data: { id: string; req: any }) {
    return await this.appService.findLeadCompany(data);
  }

  @MessagePattern('leads:update')
  async updateLead(@Payload() updateData: Core.Deals.UpdateData) {
    return await this.appService.updateLead(updateData);
  }

  @MessagePattern('leads:change:status')
  async changeLeadStatus(@Payload() data: { id: string; sid: string; owner: any }) {
    return await this.appService.changeLeadStatus(data);
  }

  @MessagePattern('leads:change:owner')
  async changeLeadOwner(@Payload() data: { id: string; oid: string; owner: any }) {
    return await this.appService.changeLeadOwner(data);
  }

  @MessagePattern('leads:company:update')
  async updateLeadCompany(@Payload() updateData: any) {
    return await this.appService.updateLeadCompany(updateData);
  }

  @MessagePattern('leads:client:update')
  async updateLeadClient(@Payload() updateData: { id: string; cid: string; data: Core.Client.Schema; owner: any }) {
    return await this.appService.updateLeadClient(updateData);
  }

  @MessagePattern('leads:failure')
  async failureLead(@Payload() data: { id: string; owner: any }) {
    return await this.appService.failureLead(data);
  }

  @MessagePattern('leads:done')
  async doneLead(@Payload() data: { id: string; owner: any }) {
    return await this.appService.doneLead(data);
  }

  @MessagePattern('leads:comment')
  async commentLead(@Payload() commentData: { id: string; req: any; comments: string }) {
    return await this.appService.commentLead(commentData);
  }
}
