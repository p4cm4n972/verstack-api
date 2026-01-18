import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Subscription, SubscriptionDocument, SubscriptionStatus } from './schemas/subscription.schema';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import {
  CreateCheckoutSessionDto,
  CancelSubscriptionDto,
  ReactivateSubscriptionDto,
} from './dto';

@Injectable()
export class SubscriptionsService {
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
      } catch (error) {
        console.warn('Failed to initialize Stripe:', error.message);
        this.stripeEnabled = false;
      }
    } else {
      console.warn('Stripe secret key not configured or invalid - Stripe features disabled');
    }
  }

  /**
   * Prix mensuel de l'abonnement (en euros)
   */
  private readonly MONTHLY_PRICE = 0.99;

  /**
   * Créer une session Stripe Checkout pour abonnement mensuel
   */
  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    if (!this.stripeEnabled || !this.stripe) {
      throw new BadRequestException('Stripe is not configured. Payment features are disabled.');
    }

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

    // Récupérer les URLs depuis la config
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://verstack.io';

    // Créer la session de paiement pour abonnement mensuel
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
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
        },
      },
      success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/subscription`,
      metadata: { userId: user._id.toString() },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      amount: this.MONTHLY_PRICE,
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
    if (!this.stripeEnabled || !this.stripe) {
      throw new BadRequestException('Stripe is not configured. Cannot cancel subscription.');
    }

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
    if (!this.stripeEnabled || !this.stripe) {
      throw new BadRequestException('Stripe is not configured. Cannot reactivate subscription.');
    }

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
