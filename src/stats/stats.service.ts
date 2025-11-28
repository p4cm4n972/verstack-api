import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PopularityTrend } from './entities/popularity-trend.entity';

@Injectable()
export class StatsService {
  private readonly years = [
    '2015', '2016', '2017', '2018', '2019', '2020',
    '2021', '2022', '2023', '2024', '2025'
  ];

  constructor(
    @InjectModel(PopularityTrend.name)
    private readonly trendModel: Model<PopularityTrend>,
  ) {}

  /**
   * Récupère toutes les tendances avec métadonnées
   */
  async getTrends() {
    const trends = await this.trendModel.find().exec();

    return {
      data: trends,
      years: this.years,
      metadata: {
        sources: [
          'Stack Overflow API - https://api.stackexchange.com/docs/tags',
          'TIOBE Index - https://www.tiobe.com/tiobe-index/',
          'GitHub Octoverse - https://octoverse.github.com/',
          'Verstack Database - Internal historical data'
        ],
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Récupère les tendances d'un langage spécifique
   */
  async getTrendByLanguage(language: string) {
    return this.trendModel.findOne({
      language: new RegExp(`^${language}$`, 'i')
    }).exec();
  }

  /**
   * Récupère les tendances pour une année spécifique
   */
  async getTrendsByYear(year: string) {
    const yearIndex = this.years.indexOf(year);
    if (yearIndex === -1) {
      return [];
    }

    const allTrends = await this.trendModel.find().exec();

    return allTrends.map(trend => ({
      language: trend.language,
      popularity: trend.popularity[yearIndex] || 0,
      year: year,
    }));
  }

  /**
   * Met à jour ou crée une tendance
   */
  async upsertTrend(trendData: Partial<PopularityTrend>) {
    return this.trendModel.findOneAndUpdate(
      { language: trendData.language },
      {
        $set: {
          ...trendData,
          lastUpdated: new Date(),
        }
      },
      { upsert: true, new: true }
    ).exec();
  }

  /**
   * Met à jour les tendances en masse
   */
  async bulkUpsertTrends(trendsData: Partial<PopularityTrend>[]) {
    const operations = trendsData.map(trend => ({
      updateOne: {
        filter: { language: trend.language },
        update: {
          $set: {
            ...trend,
            lastUpdated: new Date(),
          }
        },
        upsert: true,
      }
    }));

    return this.trendModel.bulkWrite(operations);
  }

  /**
   * Initialise les données par défaut si vide
   */
  async initializeDefaultData() {
    const count = await this.trendModel.countDocuments();

    if (count > 0) {
      return { message: 'Data already initialized', count };
    }

    const defaultTrends: Partial<PopularityTrend>[] = [
      {
        language: 'Python',
        popularity: [5.0, 6.0, 7.5, 9.0, 10.5, 12.0, 13.5, 14.8, 15.6, 16.0, 16.3],
        sources: { stackoverflow: 75, tiobe: 100, github: 95 },
        average: 90,
        trend: 'up',
        metadata: { color: '#3776ab', category: 'General Purpose' },
        lastUpdated: new Date(),
      },
      {
        language: 'JavaScript',
        popularity: [12.5, 13.0, 13.5, 14.0, 14.5, 14.8, 15.0, 15.2, 15.4, 15.6, 15.7],
        sources: { stackoverflow: 95, tiobe: 18, github: 90 },
        average: 67,
        trend: 'stable',
        metadata: { color: '#f7df1e', category: 'Web/Frontend' },
        lastUpdated: new Date(),
      },
      {
        language: 'Java',
        popularity: [16.0, 15.8, 15.5, 15.0, 14.8, 14.5, 14.3, 14.0, 13.9, 13.8, 13.7],
        sources: { stackoverflow: 60, tiobe: 71, github: 68 },
        average: 66,
        trend: 'down',
        metadata: { color: '#007396', category: 'General Purpose' },
        lastUpdated: new Date(),
      },
      {
        language: 'TypeScript',
        popularity: [0.5, 1.0, 1.5, 2.0, 3.0, 4.5, 5.5, 6.5, 7.0, 7.5, 8.0],
        sources: { stackoverflow: 70, tiobe: 0, github: 80 },
        average: 50,
        trend: 'up',
        metadata: { color: '#3178c6', category: 'Web/Frontend' },
        lastUpdated: new Date(),
      },
      {
        language: 'Go',
        popularity: [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 5.5, 6.0, 6.5, 7.0],
        sources: { stackoverflow: 45, tiobe: 15, github: 60 },
        average: 40,
        trend: 'up',
        metadata: { color: '#00add8', category: 'System' },
        lastUpdated: new Date(),
      },
      {
        language: 'Rust',
        popularity: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
        sources: { stackoverflow: 40, tiobe: 13, github: 55 },
        average: 36,
        trend: 'up',
        metadata: { color: '#ce422b', category: 'System' },
        lastUpdated: new Date(),
      },
    ];

    await this.bulkUpsertTrends(defaultTrends);

    return {
      message: 'Default data initialized successfully',
      count: defaultTrends.length
    };
  }
}
