import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { LangageUpdateService } from 'src/langages/langage-update.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEntity, EventSchema } from 'src/events/entities/event.entity/event.entity';
import { Langage, LangageSchema } from 'src/langages/entities/langage.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        MongooseModule.forFeature([
          {
            name: Langage.name,
            schema: LangageSchema,
          },
          {
            name: EventEntity.name,
            schema: EventSchema,
          },
        ]),
        HttpModule
      ],
  controllers: [AdminController],
  providers: [{provide: LangageUpdateService, useClass: LangageUpdateService}],
})
export class AdminModule {}
