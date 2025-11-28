import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PopularityTrend, PopularityTrendSchema } from './entities/popularity-trend.entity';
import { ExternalDataService } from './services/external-data.service';
import { TrendsUpdateService } from './services/trends-update.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PopularityTrend.name, schema: PopularityTrendSchema }
    ]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [StatsController],
  providers: [StatsService, ExternalDataService, TrendsUpdateService],
  exports: [StatsService],
})
export class StatsModule {}
