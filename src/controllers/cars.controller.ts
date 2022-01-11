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
  async listCars() {
    return await this.appService.listCars();
  }
}
