import { Module } from '@nestjs/common';
import { LangagesController } from './langages.controller';
import { LangagesService } from './langages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Langage, LangageSchema } from './entities/langage.entity';
import {
  EventEntity,
  EventSchema,
} from 'src/events/entities/event.entity/event.entity';
import { LangageUpdateService } from './langage-update.service';
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
  controllers: [LangagesController],
  providers: [{ provide: LangagesService, useClass: LangagesService }, { provide: LangageUpdateService, useClass: LangageUpdateService }],
})
export class LangagesModule {}
