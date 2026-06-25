import React from 'react';
import { Utensils } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <Utensils size={16} />
            </div>
            <span className="font-bold text-lg text-white">
              Recipe<span className="text-orange-500">Hub</span>
            </span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} RecipeHub. All rights reserved. Built for modern food lovers.
          </p>
          <div className="flex gap-4 text-sm">
            <span className="hover:text-white cursor-pointer transition-colors duration-300">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors duration-300">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors duration-300">Contact Us</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
