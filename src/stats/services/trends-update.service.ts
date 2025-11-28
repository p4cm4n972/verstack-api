import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PopularityTrend } from '../entities/popularity-trend.entity';
import { ExternalDataService } from './external-data.service';

@Injectable()
export class TrendsUpdateService {
  private readonly logger = new Logger(TrendsUpdateService.name);

  private readonly SUPPORTED_LANGUAGES = [
    'Python', 'JavaScript', 'Java', 'C++', 'C#',
    'Go', 'Rust', 'TypeScript', 'PHP', 'R',
    'C', 'Swift', 'Kotlin', 'Ruby', 'Scala',
    'Dart', 'MATLAB', 'Shell', 'Objective-C', 'Perl'
  ];

  private readonly LANGUAGE_COLORS: Map<string, string> = new Map([
    ['Python', '#3776ab'],
    ['JavaScript', '#f7df1e'],
    ['Java', '#007396'],
    ['C++', '#00599c'],
    ['C#', '#239120'],
    ['Go', '#00add8'],
    ['Rust', '#ce422b'],
    ['TypeScript', '#3178c6'],
    ['PHP', '#777bb4'],
    ['R', '#276dc3'],
    ['C', '#a8b9cc'],
    ['Swift', '#fa7343'],
    ['Kotlin', '#7f52ff'],
    ['Ruby', '#cc342d'],
    ['Scala', '#dc322f'],
    ['Dart', '#01a14e'],
    ['MATLAB', '#0076a8'],
    ['Shell', '#4eaa25'],
    ['Objective-C', '#438eff'],
    ['Perl', '#0673a5'],
  ]);

  private readonly LANGUAGE_CATEGORIES: Map<string, string> = new Map([
    ['Python', 'General Purpose'],
    ['JavaScript', 'Web/Frontend'],
    ['Java', 'General Purpose'],
    ['C++', 'System'],
    ['C#', 'General Purpose'],
    ['Go', 'System'],
    ['Rust', 'System'],
    ['TypeScript', 'Web/Frontend'],
    ['PHP', 'Web/Backend'],
    ['R', 'Data Science'],
    ['C', 'System'],
    ['Swift', 'Mobile'],
    ['Kotlin', 'Mobile'],
    ['Ruby', 'Web/Backend'],
    ['Scala', 'General Purpose'],
    ['Dart', 'Mobile'],
    ['MATLAB', 'Data Science'],
    ['Shell', 'Scripting'],
    ['Objective-C', 'Mobile'],
    ['Perl', 'Scripting'],
  ]);

  constructor(
    @InjectModel(PopularityTrend.name)
    private readonly trendModel: Model<PopularityTrend>,
    private readonly externalDataService: ExternalDataService,
  ) {}

  /**
   * Cron job qui s'exécute le 1er de chaque mois à 2h du matin
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyUpdate() {
    this.logger.log('Starting monthly trends update...');
    try {
      await this.updateTrendsFromExternalSources();
      this.logger.log('Monthly trends update completed successfully');
    } catch (error) {
      this.logger.error('Failed to update trends:', error);
    }
  }

  /**
   * Met à jour les tendances depuis les sources externes
   */
  async updateTrendsFromExternalSources(): Promise<{ updated: number; message: string }> {
    this.logger.log('Fetching data from external sources...');

    try {
      // Récupérer les scores agrégés
      const aggregatedScores = await this.externalDataService.getAggregatedScores(
        this.SUPPORTED_LANGUAGES
      );

      let updatedCount = 0;

      // Mettre à jour chaque langage
      for (const language of this.SUPPORTED_LANGUAGES) {
        const scores = aggregatedScores.get(language);
        if (!scores) {
          this.logger.warn(`No scores found for ${language}`);
          continue;
        }

        // Récupérer la tendance existante
        const existingTrend = await this.trendModel.findOne({ language }).exec();

        if (existingTrend) {
          // Ajouter le nouveau score de popularité à l'historique
          const currentYear = new Date().getFullYear().toString();
          const currentYearIndex = existingTrend.popularity.length - 1; // Dernière année

          // Mettre à jour le score de l'année en cours
          existingTrend.popularity[currentYearIndex] = scores.average;

          // Mettre à jour les sources
          existingTrend.sources = {
            stackoverflow: scores.stackoverflow,
            tiobe: scores.tiobe,
            github: scores.github,
          };

          // Mettre à jour la moyenne
          existingTrend.average = scores.average;

          // Calculer la tendance (up/down/stable)
          if (existingTrend.popularity.length >= 2) {
            const previousScore = existingTrend.popularity[currentYearIndex - 1];
            const currentScore = existingTrend.popularity[currentYearIndex];
            const diff = currentScore - previousScore;

            if (diff > 5) {
              existingTrend.trend = 'up';
            } else if (diff < -5) {
              existingTrend.trend = 'down';
            } else {
              existingTrend.trend = 'stable';
            }
          }

          existingTrend.lastUpdated = new Date();
          await existingTrend.save();
          updatedCount++;
        } else {
          // Créer une nouvelle tendance si elle n'existe pas
          await this.trendModel.create({
            language,
            popularity: [scores.average], // Commence avec le score actuel
            sources: {
              stackoverflow: scores.stackoverflow,
              tiobe: scores.tiobe,
              github: scores.github,
            },
            average: scores.average,
            trend: 'stable',
            metadata: {
              color: this.LANGUAGE_COLORS.get(language),
              category: this.LANGUAGE_CATEGORIES.get(language),
            },
            lastUpdated: new Date(),
          });
          updatedCount++;
        }

        this.logger.log(`Updated ${language}: ${scores.average} (SO: ${scores.stackoverflow}, TIOBE: ${scores.tiobe}, GitHub: ${scores.github})`);
      }

      return {
        updated: updatedCount,
        message: `Successfully updated ${updatedCount} language trends`
      };
    } catch (error) {
      this.logger.error('Error updating trends:', error);
      throw error;
    }
  }
}
