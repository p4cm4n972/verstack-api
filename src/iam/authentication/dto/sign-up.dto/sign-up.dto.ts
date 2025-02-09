import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, MinLength } from "class-validator";
import { CreateUserDto } from "src/users/dto/create-user.dto/create-user.dto";
import { User } from "src/users/entities/user.entity";

export class SignUpDto extends PartialType(CreateUserDto){
   
}
