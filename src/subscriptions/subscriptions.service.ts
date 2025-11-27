import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Subscription, SubscriptionDocument, SubscriptionStatus } from './schemas/subscription.schema';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { calculateProration } from './proration.util';
import {
  CreateCheckoutSessionDto,
  CancelSubscriptionDto,
  ReactivateSubscriptionDto,
} from './dto';

@Injectable()
export class SubscriptionsService {
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
   * Créer une session Stripe Checkout
   */
  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const user = await this.userModel.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si déjà abonné
    const existingSubscription = await this.subscriptionModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      status: SubscriptionStatus.ACTIVE,
    });

    if (existingSubscription) {
      throw new BadRequestException('Déjà abonné');
    }

    // Calculer le prorata
    const proration = calculateProration(0.99, new Date());
    const amount = dto.prorated ? proration.proratedPrice : 0.99;

    // Créer ou récupérer le client Stripe
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.pseudo,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Créer un coupon de réduction si prorata activé
    let couponId: string | undefined;
    if (dto.prorated && amount < 0.99) {
      const discountPercent = Math.round(((0.99 - amount) / 0.99) * 100);
      const coupon = await this.stripe.coupons.create({
        percent_off: discountPercent,
        duration: 'once',
        name: `Prorata ${proration.daysRemaining} jours`,
      });
      couponId = coupon.id;
    }

    // Récupérer les URLs depuis la config
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://verstack.io';

    // Créer la session de paiement
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: this.configService.get<string>('stripe.priceId'),
          quantity: 1,
        },
      ],
      discounts: couponId ? [{ coupon: couponId }] : undefined,
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          prorated: dto.prorated.toString(),
          proratedAmount: amount.toString(),
          nextRenewalDate: proration.nextRenewalDate.toISOString(),
        },
      },
      success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/subscription`,
      metadata: { userId: user._id.toString() },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      amount,
      prorationDetails: {
        daysRemaining: proration.daysRemaining,
        proratedAmount: proration.proratedPrice,
        fullYearAmount: proration.fullYearPrice,
      },
    };
  }

  /**
   * Récupérer l'abonnement d'un utilisateur
   */
  async getUserSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    if (!subscription) {
      throw new NotFoundException('Aucun abonnement trouvé');
    }

    return subscription;
  }

  /**
   * Annuler un abonnement
   */
  async cancelSubscription(dto: CancelSubscriptionDto) {
    const subscription = await this.subscriptionModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('Abonnement non trouvé');
    }

    if (dto.immediate) {
      await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.endDate = new Date();

      // Rétrograder le rôle utilisateur
      await this.userModel.findByIdAndUpdate(dto.userId, {
        role: Role.Regular,
      });
    } else {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      subscription.autoRenew = false;
    }

    await subscription.save();
    return subscription;
  }

  /**
   * Réactiver un abonnement annulé
   */
  async reactivateSubscription(dto: ReactivateSubscriptionDto) {
    const subscription = await this.subscriptionModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      status: SubscriptionStatus.CANCELLED,
    });

    if (!subscription) {
      throw new NotFoundException('Abonnement non trouvé');
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.autoRenew = true;
    await subscription.save();

    return subscription;
  }

  /**
   * Lister tous les abonnements (admin)
   */
  async getAllSubscriptions(page: number = 1, limit: number = 20, status?: string) {
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.subscriptionModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.subscriptionModel.countDocuments(query),
    ]);

    return { subscriptions, total, page, limit };
  }
}
