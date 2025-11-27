import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Subscription, SubscriptionDocument, SubscriptionStatus } from '../subscriptions/schemas/subscription.schema';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class SubscriptionCleanupService {
  private readonly logger = new Logger(SubscriptionCleanupService.name);
  private stripe: Stripe;

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('stripe.secretKey') || '',
      { apiVersion: '2025-11-17.clover' },
    );
  }

  /**
   * Vérifier les abonnements expirés
   * S'exécute tous les jours à 1h du matin
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkExpiredSubscriptions() {
    this.logger.log('Checking expired subscriptions...');

    const now = new Date();

    const expiredSubscriptions = await this.subscriptionModel.find({
      status: SubscriptionStatus.ACTIVE,
      endDate: { $lt: now },
      autoRenew: false,
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await subscription.save();

      // Rétrograder le rôle utilisateur
      await this.userModel.findByIdAndUpdate(subscription.userId, {
        role: Role.Regular,
      });

      this.logger.log(
        `Expired subscription ${subscription._id} for user ${subscription.userId}`,
      );
    }

    this.logger.log(`Processed ${expiredSubscriptions.length} expired subscriptions`);
  }

  /**
   * Synchroniser avec Stripe
   * S'exécute toutes les heures
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncWithStripe() {
    this.logger.log('Syncing subscriptions with Stripe...');

    const activeSubscriptions = await this.subscriptionModel.find({
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
    });

    for (const subscription of activeSubscriptions) {
      try {
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId,
        );

        if (stripeSubscription.status !== subscription.status) {
          subscription.status = stripeSubscription.status as SubscriptionStatus;
          await subscription.save();
          this.logger.log(
            `Updated subscription ${subscription._id} status to ${stripeSubscription.status}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error syncing subscription ${subscription._id}: ${error.message}`,
        );
      }
    }

    this.logger.log('Stripe sync completed');
  }
}
