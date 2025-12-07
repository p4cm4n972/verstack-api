import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import Stripe from 'stripe';
import { WebhooksService } from './webhooks.service';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('api/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private stripe: Stripe | null = null;
  private stripeEnabled: boolean = false;

  constructor(
    private readonly webhooksService: WebhooksService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');

    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      try {
        this.stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2025-11-17.clover'
        });
        this.stripeEnabled = true;
        this.logger.log('Stripe initialized successfully for webhook controller');
      } catch (error) {
        this.logger.warn('Failed to initialize Stripe for webhook controller:', error.message);
        this.stripeEnabled = false;
      }
    } else {
      this.logger.warn('Stripe secret key not configured or invalid - Webhook endpoint disabled');
    }
  }

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!this.stripeEnabled || !this.stripe) {
      this.logger.warn('Stripe not configured - webhook endpoint disabled');
      throw new BadRequestException('Stripe webhooks are not configured');
    }

    const webhookSecret = this.configService.get<string>('stripe.webhookSecret') || '';
    let event: Stripe.Event;

    try {
      // Use rawBody when available (NestJS with rawBody: true), otherwise fallback to body
      const payload = (req as any).rawBody || req.body;
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.webhooksService.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.webhooksService.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'customer.subscription.deleted':
          await this.webhooksService.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.webhooksService.handlePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'invoice.payment_failed':
          await this.webhooksService.handlePaymentFailed(
            event.data.object as Stripe.Invoice,
          );
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`);
      throw new BadRequestException('Webhook handler failed');
    }
  }
}
