import { Controller } from '@nestjs/common';
import { CarsService } from '../services/cars.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';

@Controller()
export class CarsController {
  constructor(private readonly appService: CarsService) {}

  @MessagePattern('cars:create')
  async createCar(@Payload() carData: Core.Cars.Schema) {
    return await this.appService.createCar(carData);
  }

  @MessagePattern('cars:list')
  async listCars(@Payload() data: { company: string; pagination: Core.MongoPagination; req: any }) {
    return await this.appService.listCars(data);
  }

  @MessagePattern('cars:find')
  async findCar(@Payload() data: { id: string; req: any }) {
    return await this.appService.findCar(data);
  }

  @MessagePattern('cars:archive')
  async archiveCar(@Payload() archiveData: { id: string; req: any; active: boolean }) {
    return await this.appService.archiveCar(archiveData);
  }

  @MessagePattern('cars:update')
  async updateCar(@Payload() updateData: { id: string; req: any; data: Core.Cars.Schema }) {
    return await this.appService.updateCar(updateData);
  }
}
