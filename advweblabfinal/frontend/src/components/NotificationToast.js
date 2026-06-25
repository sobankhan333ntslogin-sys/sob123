'use client';

import React, { useEffect, useState } from 'react';
import { ChefHat, Star, X, Utensils } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400); // wait for slide-out animation
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  const isReview = notification.type === 'new_review';
  const isRecipe = notification.type === 'new_recipe';

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={10}
        className={i < rating ? 'text-amber-400' : 'text-gray-300'}
        fill={i < rating ? '#fbbf24' : 'none'}
      />
    ));
  };

  return (
    <div
      className={`flex items-start gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 pr-3 max-w-sm w-full transition-all duration-400 ease-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
          isReview
            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
            : 'bg-gradient-to-br from-orange-500 to-red-500'
        }`}
      >
        {isReview ? <Star size={18} fill="white" stroke="white" /> : <ChefHat size={18} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {isReview ? 'New Review' : 'New Recipe'}
          </p>
          {isReview && notification.rating && (
            <div className="flex items-center gap-0.5">
              {renderStars(notification.rating)}
            </div>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {notification.message}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          {new Date(notification.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 400);
        }}
        className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default NotificationToast;
