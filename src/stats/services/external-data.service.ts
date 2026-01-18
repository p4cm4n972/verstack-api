import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

interface StackOverflowTag {
  name: string;
  count: number;
}

interface StackOverflowResponse {
  items: StackOverflowTag[];
}

interface GitHubSearchResponse {
  total_count: number;
  items: any[];
}

@Injectable()
export class ExternalDataService {
  private readonly STACKOVERFLOW_API = 'https://api.stackexchange.com/2.3/tags';
  private readonly GITHUB_API = 'https://api.github.com/search/repositories';
  private readonly githubToken?: string;

  // Mapping des noms de langages pour les différentes sources
  private readonly LANGUAGE_MAPPING: Map<string, { stackoverflow: string; github: string }> = new Map([
    ['Python', { stackoverflow: 'python', github: 'python' }],
    ['JavaScript', { stackoverflow: 'javascript', github: 'javascript' }],
    ['Java', { stackoverflow: 'java', github: 'java' }],
    ['C++', { stackoverflow: 'c++', github: 'c++' }],
    ['C#', { stackoverflow: 'c#', github: 'c#' }],
    ['TypeScript', { stackoverflow: 'typescript', github: 'typescript' }],
    ['PHP', { stackoverflow: 'php', github: 'php' }],
    ['R', { stackoverflow: 'r', github: 'r' }],
    ['Go', { stackoverflow: 'go', github: 'go' }],
    ['Rust', { stackoverflow: 'rust', github: 'rust' }],
    ['C', { stackoverflow: 'c', github: 'c' }],
    ['Swift', { stackoverflow: 'swift', github: 'swift' }],
    ['Kotlin', { stackoverflow: 'kotlin', github: 'kotlin' }],
    ['Ruby', { stackoverflow: 'ruby', github: 'ruby' }],
    ['Scala', { stackoverflow: 'scala', github: 'scala' }],
    ['Dart', { stackoverflow: 'dart', github: 'dart' }],
    ['MATLAB', { stackoverflow: 'matlab', github: 'matlab' }],
    ['Shell', { stackoverflow: 'shell', github: 'shell' }],
    ['Objective-C', { stackoverflow: 'objective-c', github: 'objective-c' }],
    ['Perl', { stackoverflow: 'perl', github: 'perl' }],
  ]);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN');
  }

  /**
   * Récupère la popularité depuis Stack Overflow
   * Utilise l'endpoint /tags/{tags}/info pour obtenir les stats des tags
   */
  async getStackOverflowPopularity(languages: string[]): Promise<Map<string, number>> {
    const tagNames = languages
      .map(lang => this.LANGUAGE_MAPPING.get(lang)?.stackoverflow)
      .filter(tag => tag !== undefined)
      .join(';');

    try {
      // Utiliser l'endpoint /tags/{tags}/info avec la liste des tags
      const url = `${this.STACKOVERFLOW_API}/${encodeURIComponent(tagNames)}/info`;
      const params = {
        site: 'stackoverflow',
      };

      const response = await firstValueFrom(
        this.httpService.get<StackOverflowResponse>(url, { params }).pipe(
          map(res => res.data)
        )
      );

      const popularityMap = new Map<string, number>();

      if (!response.items || response.items.length === 0) {
        console.warn('Stack Overflow API returned no items');
        return popularityMap;
      }

      // Trouver le count max pour normaliser
      const maxCount = Math.max(...response.items.map(item => item.count));

      response.items.forEach(item => {
        // Trouver le langage correspondant au tag
        for (const [language, mapping] of this.LANGUAGE_MAPPING.entries()) {
          if (mapping.stackoverflow.toLowerCase() === item.name.toLowerCase()) {
            // Normaliser le score sur 100
            const normalizedScore = (item.count / maxCount) * 100;
            popularityMap.set(language, Math.round(normalizedScore));
            break;
          }
        }
      });

      return popularityMap;
    } catch (error) {
      console.error('Error fetching Stack Overflow data:', error.message || error);
      // Retourner un fallback avec des scores estimés plutôt qu'une exception
      return new Map([
        ['Python', 100],
        ['JavaScript', 95],
        ['Java', 85],
        ['C#', 70],
        ['C++', 45],
        ['PHP', 60],
        ['TypeScript', 55],
        ['C', 35],
        ['R', 25],
        ['Go', 30],
        ['Rust', 20],
        ['Swift', 28],
        ['Kotlin', 25],
        ['Ruby', 35],
        ['Shell', 30],
        ['Scala', 15],
        ['Dart', 18],
        ['MATLAB', 12],
        ['Objective-C', 20],
        ['Perl', 10],
      ]);
    }
  }

  /**
   * Récupère les scores TIOBE en scrapant leur site web
   * Fallback vers des valeurs statiques si le scraping échoue
   */
  async getTIOBEScores(): Promise<Map<string, number>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<string>('https://www.tiobe.com/tiobe-index/', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VerStack/1.0)',
          },
          responseType: 'text' as any,
        }).pipe(map(res => res.data))
      );

      const popularityMap = new Map<string, number>();

      // Mapping des noms TIOBE vers nos noms de langages
      const tiobeMapping: Record<string, string> = {
        'Python': 'Python',
        'C': 'C',
        'C++': 'C++',
        'Java': 'Java',
        'C#': 'C#',
        'JavaScript': 'JavaScript',
        'Go': 'Go',
        'Visual Basic': 'Visual Basic',
        'Fortran': 'Fortran',
        'SQL': 'SQL',
        'Delphi/Object Pascal': 'Delphi',
        'MATLAB': 'MATLAB',
        'PHP': 'PHP',
        'Rust': 'Rust',
        'R': 'R',
        'Ruby': 'Ruby',
        'Scratch': 'Scratch',
        'Swift': 'Swift',
        'Kotlin': 'Kotlin',
        'COBOL': 'COBOL',
        'Assembly language': 'Assembly',
        'Perl': 'Perl',
        'TypeScript': 'TypeScript',
        'Objective-C': 'Objective-C',
        'Dart': 'Dart',
        'Scala': 'Scala',
        'Shell': 'Shell',
      };

      // Parser le HTML pour extraire les pourcentages
      // Le format est: <td>Language</td><td>XX.XX%</td>
      const tableRegex = /<td>([^<]+)<\/td><td>([0-9.]+)%<\/td>/gi;

      let match: RegExpExecArray | null;
      let maxScore = 0;
      const scores: { name: string; score: number }[] = [];

      while ((match = tableRegex.exec(response)) !== null) {
        const languageName = match[1].trim();
        const percentage = parseFloat(match[2]);

        if (!isNaN(percentage) && percentage > 0) {
          scores.push({ name: languageName, score: percentage });
          if (percentage > maxScore) maxScore = percentage;
        }
      }

      // Normaliser sur 100 et mapper vers nos langages
      for (const { name, score } of scores) {
        const normalizedScore = Math.round((score / maxScore) * 100);
        const nameLower = name.toLowerCase().trim();

        // Chercher le mapping correspondant - priorité au match exact
        let matched = false;

        // D'abord essayer un match exact
        for (const [tiobeName, ourName] of Object.entries(tiobeMapping)) {
          if (nameLower === tiobeName.toLowerCase()) {
            popularityMap.set(ourName, normalizedScore);
            matched = true;
            break;
          }
        }

        // Si pas de match exact, essayer un match partiel (pour les noms composés)
        if (!matched) {
          for (const [tiobeName, ourName] of Object.entries(tiobeMapping)) {
            const tiobeLower = tiobeName.toLowerCase();
            // Match partiel seulement si le nom TIOBE est plus long (ex: "Delphi/Object Pascal")
            if (tiobeLower.length > 3 && (nameLower.includes(tiobeLower) || tiobeLower.includes(nameLower))) {
              popularityMap.set(ourName, normalizedScore);
              break;
            }
          }
        }
      }

      // Si on a récupéré des données, les retourner
      if (popularityMap.size > 0) {
        console.log(`TIOBE: Successfully scraped ${popularityMap.size} languages`);
        return popularityMap;
      }

      // Sinon, fallback vers les valeurs statiques
      throw new Error('No TIOBE data scraped');
    } catch (error) {
      console.error('Error scraping TIOBE data, using fallback:', error.message || error);
      // Fallback vers des valeurs estimées basées sur le dernier index TIOBE connu
      return new Map([
        ['Python', 100],
        ['C', 80],
        ['C++', 65],
        ['Java', 71],
        ['C#', 58],
        ['JavaScript', 18],
        ['PHP', 45],
        ['Go', 15],
        ['Rust', 13],
        ['Swift', 20],
        ['R', 40],
        ['TypeScript', 10],
        ['Kotlin', 18],
        ['Ruby', 30],
        ['Scala', 25],
        ['Objective-C', 25],
        ['MATLAB', 35],
        ['Dart', 12],
        ['Perl', 22],
        ['Shell', 15],
      ]);
    }
  }

  /**
   * Récupère la popularité depuis GitHub API
   */
  async getGitHubScores(languages: string[]): Promise<Map<string, number>> {
    const popularityMap = new Map<string, number>();
    const counts: number[] = [];

    try {
      // Récupérer le nombre de repos pour chaque langage
      for (const language of languages) {
        const mapping = this.LANGUAGE_MAPPING.get(language);
        if (!mapping) continue;

        try {
          const params = {
            q: `language:${mapping.github}`,
            per_page: 1,
          };

          const headers: any = {
            'Accept': 'application/vnd.github.v3+json',
          };

          // Ajouter le token si disponible
          if (this.githubToken) {
            headers['Authorization'] = `Bearer ${this.githubToken}`;
          }

          const response = await firstValueFrom(
            this.httpService.get<GitHubSearchResponse>(this.GITHUB_API, {
              params,
              headers
            }).pipe(map(res => res.data))
          );

          counts.push(response.total_count);
          popularityMap.set(language, response.total_count);

          // Petit délai pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching GitHub data for ${language}:`, error.message);
          popularityMap.set(language, 0);
        }
      }

      // Normaliser les scores sur 100
      const maxCount = Math.max(...counts.filter(c => c > 0));
      if (maxCount > 0) {
        for (const [language, count] of popularityMap.entries()) {
          const normalizedScore = (count / maxCount) * 100;
          popularityMap.set(language, Math.round(normalizedScore));
        }
      }

      return popularityMap;
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      // Fallback vers des scores approximatifs en cas d'erreur
      return new Map([
        ['Python', 95],
        ['JavaScript', 90],
        ['Java', 68],
        ['TypeScript', 80],
        ['C++', 50],
        ['C#', 48],
        ['PHP', 35],
        ['Go', 60],
        ['Rust', 55],
        ['Ruby', 35],
        ['Swift', 45],
        ['Kotlin', 40],
        ['C', 30],
        ['R', 25],
        ['Shell', 50],
        ['Scala', 22],
        ['Dart', 28],
        ['MATLAB', 10],
        ['Objective-C', 15],
        ['Perl', 12],
      ]);
    }
  }

  /**
   * Agrège les scores de toutes les sources
   */
  async getAggregatedScores(languages: string[]): Promise<Map<string, { stackoverflow: number; tiobe: number; github: number; average: number }>> {
    // Fetch all sources in parallel for better performance
    const [stackOverflowScores, tiobeScores, githubScores] = await Promise.all([
      this.getStackOverflowPopularity(languages),
      this.getTIOBEScores(),
      this.getGitHubScores(languages),
    ]);

    const aggregated = new Map<string, { stackoverflow: number; tiobe: number; github: number; average: number }>();

    for (const language of languages) {
      const so = stackOverflowScores.get(language) || 0;
      const tiobe = tiobeScores.get(language) || 0;
      const github = githubScores.get(language) || 0;
      const average = Math.round((so + tiobe + github) / 3);

      aggregated.set(language, {
        stackoverflow: so,
        tiobe,
        github,
        average,
      });
    }

    return aggregated;
  }
}
