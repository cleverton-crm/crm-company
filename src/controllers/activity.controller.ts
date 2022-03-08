import { Controller } from '@nestjs/common';
import { ActivityService } from '../services/activity.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class ActivityController {
  constructor(private readonly appService: ActivityService) {}

  @MessagePattern('activity:list')
  async listActivity(@Payload() pagination: Core.MongoPagination) {
    return await this.appService.listActivity(pagination);
  }

  @MessagePattern('activity:find')
  async findActivity(@Payload() id: string) {
    return await this.appService.findActivity(id);
  }
}
