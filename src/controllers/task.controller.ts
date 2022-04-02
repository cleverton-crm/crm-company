import { Controller } from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class TaskController {
  constructor(private readonly appService: TaskService) {}

  @MessagePattern('task:create')
  async createTask(@Payload() taskData: any) {
    return await this.appService.createTask(taskData);
  }

  @MessagePattern('task:update')
  async updateTask(@Payload() updateData: any) {
    return await this.appService.updateTask(updateData);
  }

  @MessagePattern('task:list')
  async listTasks(@Payload() data: any) {
    return await this.appService.listTasks(data);
  }

  @MessagePattern('task:find')
  async findTask(@Payload() id: string) {
    return await this.appService.findTask(id);
  }

  @MessagePattern('task:delete')
  async deleteTask(@Payload() data: any) {
    return await this.appService.deleteTask(data);
  }
}
