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
  async archiveClient(@Payload() archiveData: { id: string; req: any; active: boolean }) {
    return await this.appService.archiveClient(archiveData);
  }

  @MessagePattern('client:list')
  async listClients(
    @Payload()
    data: {
      company: string;
      searchFilter: string;
      pagination: Core.MongoPagination;
      req: any;
      createdAt: string;
      updatedAt: string;
      birthDate: string;
      first: string;
      last: string;
      middle: string;
      email: string;
      workPhone: string;
    },
  ) {
    return await this.appService.listClients(data);
  }

  @MessagePattern('client:find')
  async findClient(data: { id: string; req: any }) {
    return await this.appService.findClient(data);
  }

  @MessagePattern('client:update')
  async updateClient(@Payload() updateData: { id: string; req: any; data: Core.Client.Schema }) {
    return await this.appService.updateClient(updateData);
  }
}
