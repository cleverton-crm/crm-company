import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';
import { ParkCompanyService } from '../services/park.service';

@Controller()
export class ParkCompanyController {
  constructor(private readonly appService: ParkCompanyService) {}

  @MessagePattern('park:create')
  async createPark(@Payload() data: { cid: string; parkData: Core.Company.ParkCompany.Park }) {
    return await this.appService.createPark(data);
  }

  @MessagePattern('park:store:create')
  async addStoreToPark(
    @Payload() data: { parkId: string; storeData: Core.Company.ParkCompany.ParkObjectSchema; req: any },
  ) {
    return await this.appService.addStoreToPark(data);
  }

  @MessagePattern('park:fuel:create')
  async addFuelToStore(@Payload() data: any) {
    return await this.appService.addFuelToStore(data);
  }

  @MessagePattern('park:store:update')
  async updateStore(@Payload() data: any) {
    return await this.appService.updateStore(data);
  }

  @MessagePattern('park:fuel:update')
  async updateFuel(@Payload() data: any) {
    return await this.appService.updateFuel(data);
  }

  @MessagePattern('park:list')
  async listParks(@Payload() data: any) {
    return await this.appService.listParks(data);
  }

  @MessagePattern('park:find')
  async findPark(@Payload() data: { id: string; req: any }) {
    return await this.appService.findPark(data);
  }

  @MessagePattern('park:archive')
  async archivePark(@Payload() data: any) {
    return await this.appService.archivePark(data);
  }

  @MessagePattern('park:store:delete')
  async deleteStore(@Payload() data: any) {
    return await this.appService.deleteStore(data);
  }

  @MessagePattern('park:fuel:delete')
  async deleteFuel(@Payload() data: any) {
    return await this.appService.deleteFuel(data);
  }
}
