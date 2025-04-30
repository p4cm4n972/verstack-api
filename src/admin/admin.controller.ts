import { Controller, Post } from '@nestjs/common';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { LangageUpdateService } from 'src/langages/langage-update.service';

@Auth(AuthType.None)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly updateService: LangageUpdateService) {}


  @Post('sync-langages')
  async sync() {
    await this.updateService.syncAll();
    return { message: 'Synchronisation terminée ✅' };
  }
}
