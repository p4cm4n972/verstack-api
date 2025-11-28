import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { StatsService } from './stats.service';
import { PopularityTrend } from './entities/popularity-trend.entity';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { TrendsUpdateService } from './services/trends-update.service';

@Auth(AuthType.None)
@Controller('api/stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly trendsUpdateService: TrendsUpdateService,
  ) {}

  /**
   * GET /api/stats/trends
   * Récupère toutes les tendances
   */
  @Get('trends')
  async getAllTrends() {
    return this.statsService.getTrends();
  }

  /**
   * GET /api/stats/trends/by-year/:year
   * Récupère les tendances pour une année spécifique
   */
  @Get('trends/by-year/:year')
  async getTrendsByYear(@Param('year') year: string) {
    return this.statsService.getTrendsByYear(year);
  }

  /**
   * GET /api/stats/trends/language/:language
   * Récupère les tendances d'un langage spécifique
   */
  @Get('trends/language/:language')
  async getTrendByLanguage(@Param('language') language: string) {
    return this.statsService.getTrendByLanguage(language);
  }

  /**
   * POST /api/stats/trends
   * Met à jour ou crée une tendance
   */
  @Post('trends')
  async upsertTrend(@Body() trendData: Partial<PopularityTrend>) {
    return this.statsService.upsertTrend(trendData);
  }

  /**
   * POST /api/stats/trends/bulk
   * Met à jour ou crée plusieurs tendances
   */
  @Post('trends/bulk')
  async bulkUpsertTrends(@Body() trendsData: Partial<PopularityTrend>[]) {
    return this.statsService.bulkUpsertTrends(trendsData);
  }

  /**
   * POST /api/stats/initialize
   * Initialise les données par défaut
   */
  @Post('initialize')
  async initializeData() {
    return this.statsService.initializeDefaultData();
  }

  /**
   * POST /api/stats/refresh
   * Force une mise à jour depuis les sources externes
   */
  @Post('refresh')
  async refreshTrends() {
    return this.trendsUpdateService.updateTrendsFromExternalSources();
  }
}
