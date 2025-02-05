import { Module } from '@nestjs/common';
import { LangagesController } from './langages.controller';
import { LangagesService } from './langages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Langage, LangageSchema } from './entities/langage.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Langage.name,
        schema: LangageSchema,
      },
    ]),
  ],
  controllers: [LangagesController],
  providers: [LangagesService],
})
export class LangagesModule {}
