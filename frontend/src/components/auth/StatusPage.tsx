'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, XCircle, AlertTriangle, CheckCircle, Mail, Phone } from 'lucide-react';

interface StatusAction {
  label: string;
  href?: string;
  onClick?: () => void;
  primary: boolean;
}

interface StatusPageProps {
  type: 'pending' | 'rejected' | 'suspended' | 'success';
  title: string;
  message: string;
  details?: string[];
  actions?: StatusAction[];
  restaurantName?: string;
  showActions?: boolean;
}

export default function StatusPage({ 
  type, 
  title, 
  message, 
  details = [],
  actions = [],
  restaurantName,
  showActions = true 
}: StatusPageProps) {
  const getStatusConfig = () => {
    switch (type) {
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          textColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          secondaryButtonColor: 'border-blue-200 text-blue-700 hover:bg-blue-50'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          secondaryButtonColor: 'border-red-200 text-red-700 hover:bg-red-50'
        };
      case 'suspended':
        return {
          icon: <AlertTriangle className="w-16 h-16 text-orange-500" />,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconBg: 'bg-orange-100',
          textColor: 'text-orange-800',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          secondaryButtonColor: 'border-orange-200 text-orange-700 hover:bg-orange-50'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          textColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          secondaryButtonColor: 'border-green-200 text-green-700 hover:bg-green-50'
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-gray-500" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          textColor: 'text-gray-800',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          secondaryButtonColor: 'border-gray-200 text-gray-700 hover:bg-gray-50'
        };
    }
  };

  const config = getStatusConfig();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/restaurant/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`bg-white rounded-2xl shadow-xl border ${config.borderColor} p-8`}>
          {/* Status Icon */}
          <div className="text-center mb-6">
            <div className={`mx-auto w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
              {config.icon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            {restaurantName && (
              <p className="text-gray-600 text-sm">Restaurant: {restaurantName}</p>
            )}
          </div>

          {/* Status Message */}
          <div className={`${config.bgColor} rounded-xl p-4 mb-6`}>
            <p className={`text-center ${config.textColor} font-medium mb-3`}>
              {message}
            </p>
            {details.length > 0 && (
              <ul className={`text-sm ${config.textColor} space-y-1`}>
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Custom Actions */}
          {showActions && actions.length > 0 && (
            <div className="space-y-3 mb-6">
              {actions.map((action, index) => (
                action.href ? (
                  <Link 
                    key={index}
                    href={action.href} 
                    className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-colors ${
                      action.primary 
                        ? `${config.buttonColor} text-white` 
                        : `border-2 ${config.secondaryButtonColor}`
                    }`}
                  >
                    {action.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                      action.primary 
                        ? `${config.buttonColor} text-white` 
                        : `border-2 ${config.secondaryButtonColor}`
                    }`}
                  >
                    {action.label}
                  </button>
                )
              ))}
              
              {/* Always show logout button */}
              <button
                onClick={handleLogout}
                className="w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Need help? Contact our support team:
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="mailto:support@fatoorty.com" 
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 