import React from 'react';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateNote: () => void;
  isFiltered: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNote, isFiltered }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 mb-6">
        <FileText size={48} className="text-blue-600" />
      </div>
      
      {isFiltered ? (
        <>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Bu kriterlere uygun not bulunamadı
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Arama terimlerinizi değiştirmeyi veya filtrelerinizi temizlemeyi deneyin.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Henüz hiç notunuz yok
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            İlk notunuzu oluşturarak başlayın. Fikirlerinizi, görevlerinizi ve önemli bilgilerinizi kaydedin.
          </p>
          <button
            onClick={onCreateNote}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" />
            İlk Notunuzu Oluşturun
          </button>
        </>
      )}
    </div>
  );
};