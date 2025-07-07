import React from 'react';
import { Check, Star } from 'lucide-react';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';

export interface PricingCardProps {
  title: string;
  price: number;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: () => void;
  loading?: boolean;
  buttonText?: string;
  className?: string;
}

export default function PricingCard({
  title,
  price,
  period = 'month',
  description,
  features,
  isPopular = false,
  isCurrentPlan = false,
  onSelect,
  loading = false,
  buttonText,
  className = ''
}: PricingCardProps) {
  const cardClasses = `
    relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl
    ${isPopular ? 'border-[#6D72CF] ring-2 ring-[#6D72CF] ring-opacity-20' : 'border-gray-200 hover:border-gray-300'}
    ${className}
  `.trim();

  const getButtonText = () => {
    if (buttonText) return buttonText;
    if (isCurrentPlan) return 'Current Plan';
    return 'Select Plan';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline' as const;
    if (isPopular) return 'primary' as const;
    return 'outline' as const;
  };

  return (
    <div className={cardClasses}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="info" className="bg-[#6D72CF] text-white px-4 py-1">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Most Popular
          </Badge>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold text-gray-900">{price}</span>
              <span className="text-xl text-gray-500 ml-1">EGP/{period}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <Button
          variant={getButtonVariant()}
          size="lg"
          fullWidth
          onClick={onSelect}
          loading={loading}
          disabled={isCurrentPlan}
          className={isPopular ? 'bg-[#6D72CF] hover:bg-[#5A5FB8]' : ''}
        >
          {getButtonText()}
        </Button>

        {/* Current Plan Indicator */}
        {isCurrentPlan && (
          <div className="mt-4 text-center">
            <Badge variant="success" size="sm">
              Active Plan
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
} 