import { Controller } from '@nestjs/common';
import { NewsService } from '../services/news.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NewsController {
  constructor(private readonly appService: NewsService) {}

  @MessagePattern('news:create')
  async createNews(@Payload() newsData: any) {
    return await this.appService.createNews(newsData);
  }

  @MessagePattern('news:update')
  async updateNews(@Payload() newsData: any) {
    return await this.appService.updateNews(newsData);
  }

  @MessagePattern('news:list')
  async listNews(@Payload() data: any) {
    return await this.appService.listNews(data);
  }

  @MessagePattern('news:find')
  async findNews(@Payload() id: string) {
    return await this.appService.findNews(id);
  }

  @MessagePattern('news:archive')
  async archiveNews(@Payload() data: any) {
    return await this.appService.archiveNews(data);
  }

  @MessagePattern('news:comment')
  async commentNews(@Payload() data: any) {
    return await this.appService.commentNews(data);
  }
}
