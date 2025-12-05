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
  private stripe: Stripe | null = null;
  private stripeEnabled: boolean = false;

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');

    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      try {
        this.stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-11-17.clover',
        });
        this.stripeEnabled = true;
        this.logger.log('Stripe initialized successfully');
      } catch (error) {
        this.logger.warn('Failed to initialize Stripe:', error.message);
        this.stripeEnabled = false;
      }
    } else {
      this.logger.warn('Stripe secret key not configured or invalid - Stripe sync disabled');
      this.stripeEnabled = false;
    }
  }

  /**
   * Vérifier les abonnements expirés
   * S'exécute tous les jours à 1h du matin
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkExpiredSubscriptions() {
    this.logger.log('Checking expired subscriptions...');

    try {
      const now = new Date();
      const BATCH_SIZE = 100;
      let processed = 0;
      let skip = 0;

      while (true) {
        const expiredSubscriptions = await this.subscriptionModel
          .find({
            status: SubscriptionStatus.ACTIVE,
            endDate: { $lt: now },
            autoRenew: false,
          })
          .limit(BATCH_SIZE)
          .skip(skip)
          .exec();

        if (expiredSubscriptions.length === 0) {
          break;
        }

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

        processed += expiredSubscriptions.length;
        skip += BATCH_SIZE;

        // Si on a traité moins que BATCH_SIZE, c'est la dernière page
        if (expiredSubscriptions.length < BATCH_SIZE) {
          break;
        }
      }

      this.logger.log(`Processed ${processed} expired subscriptions`);
    } catch (error) {
      this.logger.error('Error checking expired subscriptions:', error.message);
    }
  }

  /**
   * Synchroniser avec Stripe
   * S'exécute toutes les heures
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncWithStripe() {
    if (!this.stripeEnabled || !this.stripe) {
      this.logger.debug('Stripe sync skipped - Stripe not configured');
      return;
    }

    this.logger.log('Syncing subscriptions with Stripe...');

    try {
      const BATCH_SIZE = 100;
      let processed = 0;
      let skip = 0;

      while (true) {
        const activeSubscriptions = await this.subscriptionModel
          .find({
            status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
          })
          .limit(BATCH_SIZE)
          .skip(skip)
          .exec();

        if (activeSubscriptions.length === 0) {
          break;
        }

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
            // Si l'abonnement n'existe pas dans Stripe, le marquer comme annulé
            if (error.message && error.message.includes('No such subscription')) {
              this.logger.warn(
                `Subscription ${subscription.stripeSubscriptionId} not found in Stripe - marking as cancelled in database`,
              );
              subscription.status = SubscriptionStatus.CANCELLED;
              subscription.endDate = new Date();
              await subscription.save();

              // Rétrograder le rôle utilisateur si nécessaire
              try {
                await this.userModel.findByIdAndUpdate(subscription.userId, {
                  role: Role.Regular,
                });
              } catch (updateError) {
                this.logger.error(
                  `Failed to update user role for subscription ${subscription._id}: ${updateError.message}`,
                );
              }
            } else {
              // Autre type d'erreur, juste logger
              this.logger.error(
                `Error syncing subscription ${subscription._id}: ${error.message}`,
              );
            }
          }
        }

        processed += activeSubscriptions.length;
        skip += BATCH_SIZE;

        // Si on a traité moins que BATCH_SIZE, c'est la dernière page
        if (activeSubscriptions.length < BATCH_SIZE) {
          break;
        }
      }

      this.logger.log(`Stripe sync completed - processed ${processed} subscriptions`);
    } catch (error) {
      this.logger.error('Error during Stripe sync:', error.message);
    }
  }
}
