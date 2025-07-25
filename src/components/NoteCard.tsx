import React from 'react';
import { Note } from '../types/note';
import { Calendar, Edit3, Trash2, Pin, PinOff, Tag } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onTogglePin }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-white/40 ${note.isPinned ? 'ring-2 ring-yellow-400/50' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 line-clamp-2 flex-1 mr-3">
          {note.title}
        </h3>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onTogglePin(note.id)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              note.isPinned 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {note.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {note.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
            {note.category}
          </span>
          {note.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {note.tags.slice(0, 2).join(', ')}
                {note.tags.length > 2 && '...'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <Calendar size={14} className="mr-1" />
          {formatDate(note.updatedAt)}
        </div>
      </div>
    </div>
  );
};