import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Subscription, SubscriptionDocument, SubscriptionStatus } from '../subscriptions/schemas/subscription.schema';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { getFirstTuesdayOfYear } from '../subscriptions/proration.util';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private stripe: Stripe | null = null;
  private stripeEnabled: boolean = false;

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    // Initialiser Stripe seulement si la clé est configurée et valide
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');

    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      try {
        this.stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-12-15.clover'
        });
        this.stripeEnabled = true;
        this.logger.log('Stripe initialized successfully for webhooks');
      } catch (error) {
        this.logger.warn('Failed to initialize Stripe for webhooks:', error.message);
        this.stripeEnabled = false;
      }
    } else {
      this.logger.warn('Stripe secret key not configured or invalid - Webhook features disabled');
    }
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (!this.stripeEnabled || !this.stripe) {
      this.logger.warn('Stripe not configured - skipping checkout.session.completed webhook');
      return;
    }

    const userId = session.metadata?.userId;
    const stripeSubscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!userId) {
      this.logger.error('Missing userId in checkout session metadata');
      return;
    }

    // Récupérer les détails de l'abonnement Stripe
    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      stripeSubscriptionId,
    );

    // Calculer la date de fin (premier mardi de l'année prochaine)
    const nextYear = new Date().getFullYear() + 1;
    const endDate = getFirstTuesdayOfYear(nextYear);

    // Créer l'abonnement dans la base de données
    const subscription = new this.subscriptionModel({
      userId: new Types.ObjectId(userId),
      stripeSubscriptionId,
      stripeCustomerId: customerId,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate,
      nextBillingDate: endDate,
      amount: 0.99,
      currency: 'EUR',
      autoRenew: true,
      metadata: {
        proratedAmount: parseFloat(session.metadata?.proratedAmount || '0.99'),
        firstTuesdayRenewal: true,
      },
    });

    await subscription.save();

    // Mettre à jour le rôle de l'utilisateur
    await this.userModel.findByIdAndUpdate(userId, {
      role: Role.Subscriber,
      subscriptionId: subscription._id,
    });

    this.logger.log(`Subscription created for user ${userId}`);
  }

  async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (!subscription) return;

    subscription.status = stripeSubscription.status as SubscriptionStatus;
    subscription.autoRenew = !stripeSubscription.cancel_at_period_end;
    await subscription.save();

    this.logger.log(`Subscription updated: ${subscription._id}`);
  }

  async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (!subscription) return;

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.endDate = new Date();
    await subscription.save();

    // Rétrograder le rôle utilisateur
    await this.userModel.findByIdAndUpdate(subscription.userId, {
      role: Role.Regular,
    });

    this.logger.log(`Subscription cancelled for user ${subscription.userId}`);
  }

  async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionField = (invoice as any).subscription;
    if (!subscriptionField) return;

    const stripeSubscriptionId = typeof subscriptionField === 'string'
      ? subscriptionField
      : subscriptionField.id;

    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId,
    });

    if (!subscription) return;

    // Mettre à jour les dates de facturation
    const nextYear = new Date().getFullYear() + 1;
    const nextBillingDate = getFirstTuesdayOfYear(nextYear);

    subscription.nextBillingDate = nextBillingDate;
    subscription.endDate = nextBillingDate;
    subscription.status = SubscriptionStatus.ACTIVE;
    await subscription.save();

    this.logger.log(`Payment succeeded for subscription ${subscription._id}`);
  }

  async handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionField = (invoice as any).subscription;
    if (!subscriptionField) return;

    const stripeSubscriptionId = typeof subscriptionField === 'string'
      ? subscriptionField
      : subscriptionField.id;

    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId,
    });

    if (!subscription) return;

    subscription.status = SubscriptionStatus.EXPIRED;
    await subscription.save();

    // Rétrograder le rôle utilisateur
    await this.userModel.findByIdAndUpdate(subscription.userId, {
      role: Role.Regular,
    });

    this.logger.log(`Payment failed for subscription ${subscription._id}`);
  }
}
