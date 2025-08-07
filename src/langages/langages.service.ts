import { Injectable, NotFoundException } from '@nestjs/common';
import { Langage } from './entities/langage.entity';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateLangageDto } from './dto/create-langage.dto/create-langage.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';
import { EventEntity } from '../events/entities/event.entity/event.entity'

@Injectable()
export class LangagesService {


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
