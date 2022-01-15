import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Core } from 'crm-core';
import { ClientService } from '../services/clients.service';

@Controller()
export class ClientsController {
  constructor(private readonly appService: ClientService) {}

  @MessagePattern('client:create')
  async createClient(@Payload() clientData: Core.Client.Schema) {
    return await this.appService.createClient(clientData);
  }

  @MessagePattern('client:archive')
  async archiveClient(@Payload() archiveData: Core.Company.ArchiveData) {
    return await this.appService.archiveClient(archiveData);
  }

  @MessagePattern('client:list')
  async listClients() {
    return await this.appService.listClients();
  }

  @MessagePattern('client:find')
  async findClient(id: string) {
    return await this.appService.findClient(id);
  }
}
