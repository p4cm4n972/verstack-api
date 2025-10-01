import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../../users/entities/user.entity";
import { MailService } from "../../../mail.service";

@Injectable()
export class EmailConfirmationService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService
  ) {}

  async sendVerificationLink(user: User) {
    const payload = { sub: user._id, email: user.email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.EMAIL_CONFIRMATION_SECRET,
      expiresIn: '1d',
    });

    await this.mailService.sendConfirmationEmail(user.email, token);
  }


}
