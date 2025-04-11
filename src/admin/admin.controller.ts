import { Controller, Post } from '@nestjs/common';
import { LangageUpdateService } from 'src/langages/langage-update.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly updateService: LangageUpdateService) {}

  @Post('sync-langages')
  async sync() {
    await this.updateService.syncAll();
    return { message: 'Synchronisation terminée ✅' };
  }
}
