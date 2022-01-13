import { Controller } from '@nestjs/common';
import { DealsService } from '../services/deals.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class DealsController {
  constructor(private readonly appService: DealsService) {}

  @MessagePattern('deals:create')
  async createDeal(@Payload() dealData: Core.Deals.Schema) {
    return await this.appService.createDeal(dealData);
  }

  @MessagePattern('deals:list')
  async listDeals() {
    return await this.appService.listDeals();
  }

  @MessagePattern('deals:find')
  async findDeal(@Payload() id: string) {
    return await this.appService.findDeal(id);
  }

  @MessagePattern('deals:archive')
  async archiveDeal(@Payload() archiveData: Core.Deals.ArchiveData) {
    return await this.appService.archiveDeal(archiveData);
  }

  @MessagePattern('deals:update')
  async updateDeal(@Payload() updateData: Core.Deals.UpdateData) {
    return await this.appService.updateDeal(updateData);
  }
}
