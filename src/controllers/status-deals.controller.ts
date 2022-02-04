import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StatusDealsService } from '../services/status-deals.service';
import { Core } from 'crm-core';

@Controller()
export class StatusDealsController {
  constructor(private readonly appService: StatusDealsService) {}

  @MessagePattern('status:create')
  async createStatusDeal(
    @Payload() statusData: { data: Core.StatusDeals.Schema; owner: any },
  ) {
    return await this.appService.createStatus(statusData);
  }

  @MessagePattern('status:list')
  async listStatusDeals() {
    return await this.appService.listStatus();
  }

  @MessagePattern('status:find')
  async findStatusDeal(@Payload() id: string) {
    return await this.appService.findStatus(id);
  }

  @MessagePattern('status:archive')
  async archiveStatusDeal(
    @Payload() archiveData: Core.StatusDeals.ArchiveData,
  ) {
    return await this.appService.archiveStatus(archiveData);
  }

  @MessagePattern('status:update')
  async updateStatusDeal(@Payload() updateData: Core.StatusDeals.UpdateData) {
    return await this.appService.updateStatus(updateData);
  }

  @MessagePattern('status:change:priority')
  async changeStatusPriority(
    @Payload() data: { id: string; priority: number },
  ) {
    return await this.appService.changeStatusPriority(data);
  }
}
