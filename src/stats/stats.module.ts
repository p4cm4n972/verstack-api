import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PopularityTrend, PopularityTrendSchema } from './entities/popularity-trend.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PopularityTrend.name, schema: PopularityTrendSchema }
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
