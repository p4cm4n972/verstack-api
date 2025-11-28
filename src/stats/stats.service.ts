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
   * Initialise les données par défaut (supprime les anciennes données)
   */
  async initializeDefaultData() {
    // Supprimer toutes les données existantes
    await this.trendModel.deleteMany({});

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
        language: 'C++',
        popularity: [7.5, 7.6, 7.8, 8.0, 8.2, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9],
        sources: { stackoverflow: 45, tiobe: 65, github: 50 },
        average: 53,
        trend: 'stable',
        metadata: { color: '#00599c', category: 'System' },
        lastUpdated: new Date(),
      },
      {
        language: 'C#',
        popularity: [8.0, 8.2, 8.5, 8.7, 8.9, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5],
        sources: { stackoverflow: 50, tiobe: 58, github: 48 },
        average: 52,
        trend: 'stable',
        metadata: { color: '#239120', category: 'General Purpose' },
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
        language: 'PHP',
        popularity: [9.0, 8.8, 8.6, 8.5, 8.4, 8.3, 8.2, 8.1, 8.0, 7.9, 7.8],
        sources: { stackoverflow: 40, tiobe: 45, github: 35 },
        average: 40,
        trend: 'down',
        metadata: { color: '#777bb4', category: 'Web/Backend' },
        lastUpdated: new Date(),
      },
      {
        language: 'R',
        popularity: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 8.6],
        sources: { stackoverflow: 30, tiobe: 40, github: 25 },
        average: 32,
        trend: 'up',
        metadata: { color: '#276dc3', category: 'Data Science' },
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
      {
        language: 'C',
        popularity: [14.0, 13.5, 13.0, 12.5, 12.0, 11.5, 11.0, 10.8, 10.6, 10.5, 10.4],
        sources: { stackoverflow: 25, tiobe: 80, github: 30 },
        average: 45,
        trend: 'down',
        metadata: { color: '#a8b9cc', category: 'System' },
        lastUpdated: new Date(),
      },
      {
        language: 'Swift',
        popularity: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 5.8],
        sources: { stackoverflow: 35, tiobe: 20, github: 45 },
        average: 33,
        trend: 'up',
        metadata: { color: '#fa7343', category: 'Mobile' },
        lastUpdated: new Date(),
      },
      {
        language: 'Kotlin',
        popularity: [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
        sources: { stackoverflow: 30, tiobe: 18, github: 40 },
        average: 29,
        trend: 'up',
        metadata: { color: '#7f52ff', category: 'Mobile' },
        lastUpdated: new Date(),
      },
      {
        language: 'Ruby',
        popularity: [6.0, 5.8, 5.5, 5.2, 5.0, 4.8, 4.5, 4.3, 4.1, 4.0, 3.9],
        sources: { stackoverflow: 25, tiobe: 30, github: 35 },
        average: 30,
        trend: 'down',
        metadata: { color: '#cc342d', category: 'Web/Backend' },
        lastUpdated: new Date(),
      },
      {
        language: 'Scala',
        popularity: [3.0, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2],
        sources: { stackoverflow: 20, tiobe: 25, github: 22 },
        average: 22,
        trend: 'stable',
        metadata: { color: '#dc322f', category: 'General Purpose' },
        lastUpdated: new Date(),
      },
      {
        language: 'Dart',
        popularity: [0.0, 0.2, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5],
        sources: { stackoverflow: 22, tiobe: 12, github: 28 },
        average: 21,
        trend: 'up',
        metadata: { color: '#01a14e', category: 'Mobile' },
        lastUpdated: new Date(),
      },
      {
        language: 'MATLAB',
        popularity: [5.5, 5.3, 5.1, 5.0, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.3],
        sources: { stackoverflow: 15, tiobe: 35, github: 10 },
        average: 20,
        trend: 'down',
        metadata: { color: '#0076a8', category: 'Data Science' },
        lastUpdated: new Date(),
      },
      {
        language: 'Shell',
        popularity: [3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5],
        sources: { stackoverflow: 18, tiobe: 15, github: 50 },
        average: 28,
        trend: 'stable',
        metadata: { color: '#4eaa25', category: 'Scripting' },
        lastUpdated: new Date(),
      },
      {
        language: 'Objective-C',
        popularity: [8.0, 7.0, 6.0, 5.0, 4.0, 3.5, 3.0, 2.5, 2.2, 2.0, 1.8],
        sources: { stackoverflow: 10, tiobe: 25, github: 15 },
        average: 17,
        trend: 'down',
        metadata: { color: '#438eff', category: 'Mobile' },
        lastUpdated: new Date(),
      },
      {
        language: 'Perl',
        popularity: [5.0, 4.5, 4.0, 3.5, 3.0, 2.8, 2.6, 2.4, 2.2, 2.0, 1.9],
        sources: { stackoverflow: 8, tiobe: 22, github: 12 },
        average: 14,
        trend: 'down',
        metadata: { color: '#0673a5', category: 'Scripting' },
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
