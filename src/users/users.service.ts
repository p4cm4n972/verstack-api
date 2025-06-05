import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';

@Injectable()
export class UsersService {
constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    
) {}

    create(createUserDto: CreateUserDto) {
        const user = new this.userModel(createUserDto);
        return user.save();
    }

    findAll(paginationQuery: PaginationQueryDto) {
        const { limit, offset } = paginationQuery;
        return this.userModel.find().skip(offset).limit(limit).exec();
    }

    findByEmail(email: any) {
        return this.userModel.findOne({ email }).exec();
    }

    findOne(id: any) {
        return this.userModel.findOne({ _id: id }).exec();;
    }

    update(id: number, updateUserDto: any) {
        return this.userModel.updateOne({ _id: id }, { $set: updateUserDto }).exec();
    }

    remove(id: number) {
        return this.userModel.deleteOne({ _id: id }).
        exec();
    }

}
