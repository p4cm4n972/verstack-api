import { Injectable, NotFoundException } from '@nestjs/common';
import { Langage } from './entities/langage.entity';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateLangageDto } from './dto/create-langage.dto/create-langage.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';
import { EventEntity } from '../events/entities/event.entity/event.entity'

@Injectable()
export class LangagesService {
  // private langages: Langage[] = [
  //     {
  //       "name": "JavaScript",
  //       "description": "Langage de script principalement utilisé pour le développement web.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
  //       "documentation": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  //       "domain": ["Web", "Frontend", "Backend"],
  //       "currentVersion": "ES2023",
  //       "ltsVersion": "ES2021",
  //       "releaseDate": "1995-12-04",
  //     },
  //     {
  //       "name": "Python",
  //       "description": "Langage polyvalent pour le développement web, l'analyse de données et l'intelligence artificielle.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
  //       "documentation": "https://docs.python.org/3/",
  //       "domain": ["Data Science", "IA", "Web", "DevOps"],
  //       "currentVersion": "3.12.0",
  //       "ltsVersion": "3.11.6",
  //       "releaseDate": "1991-02-20",
  //     },
  //     {
  //       "name": "TypeScript",
  //       "description": "Surcouche de JavaScript permettant une typage statique.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
  //       "documentation": "https://www.typescriptlang.org/docs/",
  //       "domain": ["Frontend", "Backend"],
  //       "currentVersion": "5.2.2",
  //       "ltsVersion": "4.9.0",
  //       "releaseDate": "2012-10-01",
  //     },
  //     {
  //       "name": "Java",
  //       "description": "Langage orienté objet principalement utilisé pour le développement d'applications d'entreprise.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/fr/3/30/Java_programming_language_logo.svg",
  //       "documentation": "https://docs.oracle.com/en/java/",
  //       "domain": ["Entreprise", "Mobile", "Web"],
  //       "currentVersion": "21",
  //       "ltsVersion": "17",
  //       "releaseDate": "1995-05-23"
  //     },
  //     {
  //       "name": "C#",
  //       "description": "Langage développé par Microsoft principalement pour le développement d'applications .NET.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png",
  //       "documentation": "https://learn.microsoft.com/en-us/dotnet/csharp/",
  //       "domain": ["Desktop", "Web", "Jeux vidéo"],
  //       "currentVersion": "12.0",
  //       "ltsVersion": "10.0",
  //       "releaseDate": "2000-01-01"
  //     },
  //     {
  //       "name": "Go",
  //       "description": "Langage performant et simple, développé par Google.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg",
  //       "documentation": "https://golang.org/doc/",
  //       "domain": ["Backend", "Cloud"],
  //       "currentVersion": "1.21.1",
  //       "ltsVersion": "1.19",
  //       "releaseDate": "2009-11-10"
  //     },
  //     {
  //       "name": "PHP",
  //       "description": "Langage populaire pour le développement de sites web dynamiques.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg",
  //       "documentation": "https://www.php.net/docs.php",
  //       "domain": ["Web", "Backend"],
  //       "currentVersion": "8.3.0",
  //       "ltsVersion": "8.1",
  //       "releaseDate": "1995-06-08"
  //     },
  //     {
  //       "name": "Swift",
  //       "description": "Langage d'Apple pour le développement d'applications iOS et macOS.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Swift_logo.svg",
  //       "documentation": "https://swift.org/documentation/",
  //       "domain": ["Mobile", "Apple"],
  //       "currentVersion": "5.9",
  //       "ltsVersion": "5.8",
  //       "releaseDate": "2014-06-02"
  //     },
  //     {
  //       "name": "Kotlin",
  //       "description": "Langage officiel pour le développement Android.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png",
  //       "documentation": "https://kotlinlang.org/docs/home.html",
  //       "domain": ["Mobile", "Backend"],
  //       "currentVersion": "1.9.10",
  //       "ltsVersion": "1.7.20",
  //       "releaseDate": "2011-07-22"
  //     },
  //     {
  //       "name": "Rust",
  //       "description": "Langage moderne mettant l'accent sur la sécurité et la performance.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Rust_programming_language_black_logo.svg",
  //       "documentation": "https://doc.rust-lang.org/",
  //       "domain": ["Backend", "Embedded"],
  //       "currentVersion": "1.72.0",
  //       "ltsVersion": "1.64",
  //       "releaseDate": "2010-07-07"
  //     },
  //     {
  //       "name": "Ruby",
  //       "description": "Langage élégant utilisé notamment avec le framework Ruby on Rails.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg",
  //       "documentation": "https://www.ruby-lang.org/en/documentation/",
  //       "domain": ["Web", "Backend"],
  //       "currentVersion": "3.2.2",
  //       "ltsVersion": "2.7",
  //       "releaseDate": "1995-12-21"
  //     },
  //     {
  //       "name": "C++",
  //       "description": "Langage performant utilisé pour les systèmes embarqués et les jeux vidéo.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg",
  //       "documentation": "https://cplusplus.com/doc/",
  //       "domain": ["Système", "Jeux vidéo"],
  //       "currentVersion": "C++20",
  //       "ltsVersion": "C++17",
  //       "releaseDate": "1985-10-01"
  //     },
  //     {
  //       "name": "C",
  //       "description": "Langage bas-niveau utilisé pour le développement système.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/3/35/The_C_Programming_Language_logo.svg",
  //       "documentation": "https://en.cppreference.com/w/c",
  //       "domain": ["Système", "Embarqué"],
  //       "currentVersion": "C18",
  //       "ltsVersion": "C99",
  //       "releaseDate": "1972-03-01"
  //     },
  //     {
  //       "name": "SQL",
  //       "description": "Langage de requête pour les bases de données relationnelles.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png",
  //       "documentation": "https://dev.mysql.com/doc/",
  //       "domain": ["Bases de données"],
  //       "currentVersion": "SQL:2016",
  //       "ltsVersion": "SQL:2008",
  //       "releaseDate": "1986-01-01"
  //     },
  //     {
  //       "name": "HTML",
  //       "description": "Langage de balisage pour la structuration des pages web.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg",
  //       "documentation": "https://developer.mozilla.org/en-US/docs/Web/HTML",
  //       "domain": ["Frontend", "Web"],
  //       "currentVersion": "HTML5.3",
  //       "ltsVersion": "HTML5",
  //       "releaseDate": "1993-06-30"
  //     },
  //     {
  //       "name": "Dart",
  //       "description": "Langage utilisé pour le développement multiplateforme avec Flutter.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Dart-logo.png",
  //       "documentation": "https://dart.dev/guides",
  //       "domain": ["Mobile", "Web"],
  //       "currentVersion": "3.0",
  //       "ltsVersion": "2.17",
  //       "releaseDate": "2013-05-12"
  //     },
  //     {
  //       "name": "Scala",
  //       "description": "Langage fonctionnel qui s'exécute sur la JVM.",
  //       "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/8/85/Scala_logo.png",
  //       "documentation": "https://docs.scala-lang.org/",
  //       "domain": ["Backend"],
  //       "currentVersion": "3.3.0",
  //       "ltsVersion": "2.13",
  //       "releaseDate": "2003-01-20"
  //     },
  //     ];

  constructor(
    @InjectModel(Langage.name) private readonly langageModel: Model<Langage>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventEntity>,
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.langageModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const langage = await this.langageModel.findOne({ _id: id }).exec();
    if (!langage) {
      throw new NotFoundException(`Langage with id ${id} not found`);
    }
    return langage;
  }

  create(createLangageDto: CreateLangageDto) {
    const langage = new this.langageModel(createLangageDto);
    return langage.save();
  }

  async update(id: string, updateLangageDto: any) {
    const existingLangage = await this.langageModel
      .findOneAndUpdate({ _id: id }, { $set: updateLangageDto }, { new: true })
      .exec();
    if (!existingLangage) {
      throw new NotFoundException(`Langage with id ${id} not found`);
    }
    return existingLangage;
  }

  async remove(id: string) {
    const langage = await this.findOne(id);
    if (!langage) {
      throw new NotFoundException(`Langage with id ${id} not found`);
    }
    return this.langageModel.deleteOne({ _id: id }).exec();
  }

  async recommendLangage(langage: Langage) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      langage.recommendations++;

      const recommendEvent = new this.eventModel({
        name: 'recommend_langage',
        type: 'langage',
        payload: { langageId: langage._id },
      });
      await recommendEvent.save({ session });
      await langage.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  getlogoUrl(id: string) {
    // const langage = this.findOne(id);
    // return langage."logoUrl";
  }

  getAlllogoUrls() {
    // return this.langages.map(langage => langage."logoUrl");
  }
}
