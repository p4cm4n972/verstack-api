import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AccessTokenGuard } from '../iam/authentication/guards/access-token/access-token.guard';
import { RolesGuard } from '../iam/authorization/guards/roles/roles.guard';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import {
  CreateCheckoutSessionDto,
  CancelSubscriptionDto,
  ReactivateSubscriptionDto,
} from './dto';

@Controller('api/subscriptions')
@UseGuards(AccessTokenGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('checkout')
  createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    return this.subscriptionsService.createCheckoutSession(dto);
  }

  @Get('user/:userId')
  getUserSubscription(@Param('userId') userId: string) {
    return this.subscriptionsService.getUserSubscription(userId);
  }

  @Post('cancel')
  cancelSubscription(@Body() dto: CancelSubscriptionDto) {
    return this.subscriptionsService.cancelSubscription(dto);
  }

  @Post('reactivate')
  reactivateSubscription(@Body() dto: ReactivateSubscriptionDto) {
    return this.subscriptionsService.reactivateSubscription(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  getAllSubscriptions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.subscriptionsService.getAllSubscriptions(page, limit, status);
  }
}
