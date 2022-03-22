import { Controller } from '@nestjs/common';
import { DealsService } from '../services/deals.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class DealsController {
  constructor(private readonly appService: DealsService) {}

  @MessagePattern('deals:create')
  async createDeal(@Payload() dealData: { data: Core.Deals.Schema; owner: any }) {
    return await this.appService.createDeal(dealData);
  }

  @MessagePattern('deals:list')
  async listDeals(@Payload() data: any) {
    return await this.appService.listDeals(data);
  }

  @MessagePattern('deals:find')
  async findDeal(@Payload() data: { id: string; req: any }) {
    return await this.appService.findDeal(data);
  }

  @MessagePattern('deals:change:status')
  async changeDealStatus(@Payload() data: { id: string; sid: string; owner: any }) {
    return await this.appService.changeDealStatus(data);
  }

  @MessagePattern('deals:change:owner')
  async changeDealOwner(@Payload() data: { id: string; oid: string; owner: any }) {
    return await this.appService.changeDealOwner(data);
  }

  @MessagePattern('deals:archive')
  async archiveDeal(@Payload() archiveData: { id: string; req: any; active: boolean }) {
    return await this.appService.archiveDeal(archiveData);
  }

  @MessagePattern('deals:update')
  async updateDeal(@Payload() updateData: { id: string; req: any; data: Core.Deals.Schema }) {
    return await this.appService.updateDeal(updateData);
  }

  @MessagePattern('deals:comment')
  async commentDeal(@Payload() commentData: { id: string; req: any; comments: string }) {
    return await this.appService.commentDeal(commentData);
  }
}
