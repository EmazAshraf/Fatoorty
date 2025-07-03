/**
 * Subscription Service
 * Handles subscription plans and billing operations securely
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  isPopular?: boolean;
  analyticsIncluded: boolean;
  orderManagement: boolean;
  paymentProcessing: boolean;
  qrOrdering: boolean;
}

export interface CurrentSubscription {
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  paymentMethod?: string;
}

/**
 * Subscription plans configuration
 * These are the available plans for restaurants
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'static-menu',
    name: 'Static Menu',
    price: 15,
    period: 'month',
    description: 'Perfect for traditional restaurants with waiter service',
    features: [
      'Restaurant analytics dashboard',
      'Order management system',
      'QR code for menu display',
      'Waiter takes orders manually',
      'Basic staff management',
      'Email support'
    ],
    analyticsIncluded: true,
    orderManagement: true,
    paymentProcessing: false,
    qrOrdering: false
  },
  {
    id: 'pay-at-table',
    name: 'Pay At Table',
    price: 30,
    period: 'month',
    description: 'Enhanced features with digital ordering capabilities',
    features: [
      'Everything in Static Menu',
      'Digital menu with ordering',
      'Basic payment processing',
      'Customer can browse menu digitally',
      'Waiter assistance for ordering',
      'Advanced analytics',
      'Priority email support'
    ],
    analyticsIncluded: true,
    orderManagement: true,
    paymentProcessing: true,
    qrOrdering: true,
    isPopular: true
  },
  {
    id: 'Order and pay',
    name: 'Pay At Table Pro',
    price: 45,
    period: 'month',
    description: 'Complete self-service solution for modern restaurants',
    features: [
      'Everything in Pay At Table',
      'Full self-service ordering',
      'Complete payment processing',
      'No waiter needed for order-taking',
      'Customers order & pay independently',
      'Advanced analytics & insights',
      '24/7 phone & chat support',
    ],
    analyticsIncluded: true,
    orderManagement: true,
    paymentProcessing: true,
    qrOrdering: true
  }
];

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = (): SubscriptionPlan[] => {
  return SUBSCRIPTION_PLANS;
};

/**
 * Get a specific subscription plan by ID
 */
export const getSubscriptionPlan = (planId: string): SubscriptionPlan | null => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
};

/**
 * Get current subscription (mock for now, will integrate with API later)
 */
export const getCurrentSubscription = async (): Promise<CurrentSubscription | null> => {
  // TODO: Replace with actual API call
  // This is a mock implementation for development
  return null;
};

/**
 * Subscribe to a plan (will integrate with TapPay)
 */
export const subscribeToPlan = async (planId: string): Promise<{
  success: boolean;
  message: string;
  redirectUrl?: string;
}> => {
  // TODO: Integrate with TapPay for secure payment processing
  // For now, return a mock response
  
  const plan = getSubscriptionPlan(planId);
  if (!plan) {
    return {
      success: false,
      message: 'Invalid subscription plan'
    };
  }

  // Mock processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    message: `Successfully initiated subscription to ${plan.name}`,
    redirectUrl: '/restaurant/dashboard' // Redirect after successful subscription
  };
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  // TODO: Integrate with TapPay for subscription cancellation
  
  // Mock processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    message: 'Subscription cancelled successfully'
  };
};

/**
 * Format price for display
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price);
}; 