import { Module } from '@nestjs/common';
import { LangagesController } from './langages.controller';
import { LangagesService } from './langages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Langage, LangageSchema } from './entities/langage.entity';
import {
  EventEntity,
  EventSchema,
} from 'src/events/entities/event.entity/event.entity';

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
  ],
  controllers: [LangagesController],
  providers: [{ provide: LangagesService, useClass: LangagesService }],
})
export class LangagesModule {}
