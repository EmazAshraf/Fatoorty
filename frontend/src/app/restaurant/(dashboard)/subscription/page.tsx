'use client';

import React, { useState, useEffect } from 'react';
import { PricingCard } from '@/components/ui';
import { 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  subscribeToPlan,
  type SubscriptionPlan,
  type CurrentSubscription 
} from '@/lib/services/subscriptionService';
import { Shield, Zap, Crown, AlertCircle } from 'lucide-react';

/**
 * SubscriptionPlanPage Component
 * 
 * This component displays the subscription plans page for restaurant owners.
 * It allows users to view available subscription plans, compare features,
 * and upgrade/downgrade their current subscription.
 * 
 * Features:
 * - Displays available subscription plans with pricing
 * - Shows current subscription status
 * - Handles plan selection and subscription changes
 * - Provides security information about payment processing
 * - Includes feature comparison table
 */
export default function SubscriptionPlanPage() {
  // State management for subscription plans and current subscription
  const [plans] = useState<SubscriptionPlan[]>(getSubscriptionPlans());
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null); // Track which plan is being processed
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch

  /**
   * Effect hook to fetch current subscription data on component mount
   * This runs once when the component loads to get the user's current subscription status
   */
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const subscription = await getCurrentSubscription();
        setCurrentSubscription(subscription);
      } catch (error) {
        console.error('Failed to fetch current subscription:', error);
        // TODO: Add proper error handling/notification
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSubscription();
  }, []);

  /**
   * Handles subscription plan selection
   * 
   * @param planId - The ID of the selected subscription plan
   * 
   * This function:
   * 1. Prevents duplicate selections or selections of current plan
   * 2. Sets loading state for the selected plan
   * 3. Calls the subscription service
   * 4. Handles success/error responses
   * 5. Clears loading state
   */
  const handleSelectPlan = async (planId: string) => {
    // Prevent action if already loading or selecting current plan
    if (loadingPlanId || currentSubscription?.planId === planId) return;

    setLoadingPlanId(planId);
    
    try {
      const result = await subscribeToPlan(planId);
      
      if (result.success) {
        // TODO: Implement success notification system
        console.log(result.message);
        
        // Redirect to payment gateway if URL is provided
        if (result.redirectUrl) {
          // window.location.href = result.redirectUrl;
          // Currently commented out for development
        }
      } else {
        // TODO: Implement error notification system
        console.error(result.message);
      }
    } catch (error) {
      console.error('Failed to subscribe to plan:', error);
      // TODO: Implement error notification system
    } finally {
      setLoadingPlanId(null);
    }
  };

  /**
   * Returns the appropriate icon for each subscription plan
   * 
   * @param planId - The subscription plan identifier
   * @returns JSX element with the corresponding icon
   */
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'static-menu':
        return <Shield className="w-6 h-6 text-[#6D72CF]" />;
      case 'pay-at-table-basic':
        return <Zap className="w-6 h-6 text-[#6D72CF]" />;
      case 'pay-at-table-premium':
        return <Crown className="w-6 h-6 text-[#6D72CF]" />;
      default:
        return null;
    }
  };

  /**
   * Loading state UI
   * Displays skeleton loading animation while fetching subscription data
   */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 
        Header Section
        Displays the main title and description for the subscription page
      */}
      <div className="bg-white shadow rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your restaurant. Upgrade or downgrade anytime. 
            All plans include our core restaurant management features with secure payment processing.
          </p>
        </div>
      </div>

      {/* 
        Security Notice
        Informs users about secure payment processing through TapPay
        Builds trust and confidence in the payment system
      */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Secure Payment Processing
            </h3>
            <p className="text-sm text-blue-700">
              All payments are processed securely through TapPay, a leading payment gateway in the Gulf region. 
              Your payment information is encrypted and never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* 
        Current Subscription Alert
        Shows information about the user's active subscription
        Only displays if user has an active subscription
      */}
      {currentSubscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Current Active Subscription
              </h3>
              <p className="text-sm text-green-700">
                You have an active subscription. Your next billing date is{' '}
                {currentSubscription.nextBillingDate ? 
                  new Date(currentSubscription.nextBillingDate).toLocaleDateString() : 
                  'N/A'
                }.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 
        Pricing Cards Section
        Displays all available subscription plans in a responsive grid
        Each card shows plan details and allows selection
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            {/* Plan Icon - positioned absolutely above the card */}
            <div className="absolute -top-4 left-8 z-10">
              <div className="bg-white rounded-full p-2 shadow-lg border-2 border-gray-100">
                {getPlanIcon(plan.id)}
              </div>
            </div>
            
            {/* 
              PricingCard Component
              Reusable component that displays plan information
              Handles selection, loading states, and current plan highlighting
            */}
            <PricingCard
              title={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              isCurrentPlan={currentSubscription?.planId === plan.id}
              onSelect={() => handleSelectPlan(plan.id)}
              loading={loadingPlanId === plan.id}
              className="pt-12" // Extra padding top to accommodate the floating icon
            />
          </div>
        ))}
      </div>

      {/* 
        Features Comparison Table
        Provides detailed comparison of features across all subscription plans
        Helps users understand what's included in each plan
      */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Feature Comparison
          </h3>
          <p className="text-gray-600 mt-1">
            Compare what's included in each subscription plan
          </p>
        </div>
        
        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header with Plan Names */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Table Body with Feature Rows */}
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Analytics Dashboard - Available in all plans */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Analytics Dashboard
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-green-500">✓</span>
                  </td>
                ))}
              </tr>
              
              {/* Order Management - Available in all plans */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Order Management
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-green-500">✓</span>
                  </td>
                ))}
              </tr>
              
              {/* Digital QR Ordering - Conditional based on plan features */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Digital QR Ordering
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                    {plan.qrOrdering ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Payment Processing - Conditional based on plan features */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Payment Processing
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                    {plan.paymentProcessing ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 