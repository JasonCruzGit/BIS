# Subscription System Code Examples

## 1. Subscription Middleware

```typescript
// backend/src/middleware/subscription.middleware.ts
import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth.middleware';

const prisma = new PrismaClient();

export const checkSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: {
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    });

    if (!user?.organization) {
      return res.status(403).json({ message: 'No organization assigned' });
    }

    const subscription = user.organization.subscription;

    if (!subscription) {
      return res.status(403).json({ 
        message: 'No active subscription',
        code: 'NO_SUBSCRIPTION'
      });
    }

    // Check subscription status
    const now = new Date();
    const isExpired = subscription.currentPeriodEnd < now;
    const isActive = subscription.status === 'ACTIVE' && !isExpired;

    if (!isActive) {
      return res.status(403).json({ 
        message: 'Subscription expired or inactive',
        code: 'SUBSCRIPTION_EXPIRED',
        subscription: {
          status: subscription.status,
          expiresAt: subscription.currentPeriodEnd
        }
      });
    }

    // Attach subscription info to request
    req.subscription = subscription;
    req.plan = subscription.plan;
    req.organization = user.organization;

    next();
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const checkFeatureAccess = (feature: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.plan) {
        return res.status(403).json({ message: 'No subscription plan found' });
      }

      const features = req.plan.features as any;
      
      if (!features[feature] || features[feature] === false) {
        return res.status(403).json({ 
          message: `Feature '${feature}' not available in your plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          upgradeRequired: true
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };
};

export const checkUsageLimit = (resource: 'residents' | 'users' | 'storage') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.plan || !req.organization) {
        return res.status(403).json({ message: 'Subscription required' });
      }

      const limits = {
        residents: req.plan.maxResidents,
        users: req.plan.maxUsers,
        storage: req.plan.maxStorage
      };

      const limit = limits[resource];
      if (!limit) {
        return next(); // No limit set
      }

      // Get current usage
      let currentUsage = 0;
      switch (resource) {
        case 'residents':
          currentUsage = await prisma.resident.count({
            where: { organizationId: req.organization.id }
          });
          break;
        case 'users':
          currentUsage = await prisma.user.count({
            where: { organizationId: req.organization.id }
          });
          break;
        case 'storage':
          // Calculate storage usage from file sizes
          // Implementation depends on your file storage
          break;
      }

      if (currentUsage >= limit) {
        return res.status(403).json({
          message: `${resource} limit reached`,
          code: 'USAGE_LIMIT_REACHED',
          current: currentUsage,
          limit: limit,
          upgradeRequired: true
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };
};
```

## 2. Subscription Controller

```typescript
// backend/src/controllers/subscription.controller.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        organization: {
          include: {
            subscription: {
              include: {
                plan: true,
                payments: {
                  orderBy: { createdAt: 'desc' },
                  take: 10
                }
              }
            }
          }
        }
      }
    });

    if (!user?.organization?.subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Calculate usage
    const [residentCount, userCount] = await Promise.all([
      prisma.resident.count({
        where: { organizationId: user.organization.id }
      }),
      prisma.user.count({
        where: { organizationId: user.organization.id }
      })
    ]);

    res.json({
      subscription: user.organization.subscription,
      plan: user.organization.subscription.plan,
      usage: {
        residents: {
          current: residentCount,
          limit: user.organization.subscription.plan.maxResidents
        },
        users: {
          current: userCount,
          limit: user.organization.subscription.plan.maxUsers
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upgradeSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { organization: { include: { subscription: true } } }
    });

    if (!user?.organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!newPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Update or create subscription
    const subscription = user.organization.subscription
      ? await prisma.subscription.update({
          where: { id: user.organization.subscription.id },
          data: {
            planId: planId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          }
        })
      : await prisma.subscription.create({
          data: {
            organizationId: user.organization.id,
            planId: planId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        });

    res.json({ subscription, plan: newPlan });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { organization: { include: { subscription: true } } }
    });

    if (!user?.organization?.subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const subscription = await prisma.subscription.update({
      where: { id: user.organization.subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        status: 'CANCELLED'
      }
    });

    res.json({ message: 'Subscription cancelled', subscription });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

## 3. Payment Service (Stripe Example)

```typescript
// backend/src/services/payment.service.ts
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export class PaymentService {
  static async createCheckoutSession(
    subscriptionId: string,
    planId: string,
    organizationId: string
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'php',
            product_data: {
              name: subscription.plan.name,
              description: subscription.plan.description || ''
            },
            unit_amount: Math.round(parseFloat(subscription.plan.price.toString()) * 100), // Convert to cents
            recurring: {
              interval: 'year'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        subscriptionId,
        organizationId,
        planId
      }
    });

    return session;
  }

  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const subscriptionId = session.metadata?.subscriptionId;
    if (!subscriptionId) return;

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        paymentId: session.subscription as string,
        lastPaymentDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.payment.create({
      data: {
        subscriptionId,
        amount: (session.amount_total || 0) / 100,
        status: 'COMPLETED',
        paymentMethod: 'STRIPE',
        transactionId: session.id,
        paidAt: new Date()
      }
    });
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle successful payment
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    // Handle failed payment
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Handle subscription cancellation
  }
}
```

## 4. Frontend Subscription Page

```typescript
// frontend/app/subscription/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '@/lib/api'
import Layout from '@/components/Layout'
import toast from 'react-hot-toast'
import { Check, X, AlertCircle, CreditCard, Calendar } from 'lucide-react'

export default function SubscriptionPage() {
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const { data: subscriptionData, isLoading } = useQuery(
    'subscription',
    async () => {
      const { data } = await api.get('/subscription')
      return data
    }
  )

  const { data: plansData } = useQuery(
    'subscription-plans',
    async () => {
      const { data } = await api.get('/subscription/plans')
      return data
    }
  )

  const upgradeMutation = useMutation(
    async (planId: string) => {
      const { data } = await api.post('/subscription/upgrade', { planId })
      return data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscription')
        toast.success('Subscription upgraded successfully!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to upgrade subscription')
      }
    }
  )

  const subscription = subscriptionData?.subscription
  const plan = subscriptionData?.plan
  const usage = subscriptionData?.usage
  const plans = plansData?.plans || []

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="mt-2 text-gray-600">Manage your subscription and billing</p>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-lg font-semibold text-gray-900">{plan?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  subscription.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Renews On</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Usage Stats */}
            {usage && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Residents</span>
                      <span className="text-sm font-medium">
                        {usage.residents.current} / {usage.residents.limit || '∞'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((usage.residents.current / (usage.residents.limit || 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Users</span>
                      <span className="text-sm font-medium">
                        {usage.users.current} / {usage.users.limit || '∞'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((usage.users.current / (usage.users.limit || 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p: any) => (
              <div
                key={p.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                  plan?.id === p.id
                    ? 'border-primary-500'
                    : 'border-gray-100'
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ₱{parseFloat(p.price.toString()).toLocaleString()}
                  </span>
                  <span className="text-gray-600">/year</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {p.maxResidents ? `Up to ${p.maxResidents} residents` : 'Unlimited residents'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {p.maxUsers ? `Up to ${p.maxUsers} users` : 'Unlimited users'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {p.maxStorage ? `${p.maxStorage}MB storage` : 'Unlimited storage'}
                    </span>
                  </li>
                </ul>
                {plan?.id !== p.id && (
                  <button
                    onClick={() => upgradeMutation.mutate(p.id)}
                    disabled={upgradeMutation.isLoading}
                    className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {upgradeMutation.isLoading ? 'Processing...' : 'Upgrade'}
                  </button>
                )}
                {plan?.id === p.id && (
                  <div className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center">
                    Current Plan
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
```

## 5. Usage in Routes

```typescript
// Example: backend/src/routes/resident.routes.ts
import express from 'express';
import { authenticate, checkSubscription, checkUsageLimit } from '../middleware/auth.middleware';
import { getResidents, createResident } from '../controllers/resident.controller';

const router = express.Router();

// All routes require authentication and active subscription
router.use(authenticate);
router.use(checkSubscription);

// Create resident requires checking usage limit
router.post('/', checkUsageLimit('residents'), createResident);
router.get('/', getResidents);

export default router;
```

