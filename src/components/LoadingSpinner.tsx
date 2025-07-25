import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600 text-lg">Notlarınız yükleniyor...</p>
    </div>
  );
};