import { Controller, Get } from '@nestjs/common';
import { CompanyService } from '../services/company.service';

@Controller()
export class CompanyController {
  constructor(private readonly appService: CompanyService) {}

  @Get()
  getHello(): string {
    return;
  }
}
