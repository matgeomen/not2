import React, { useState, useEffect } from 'react';
import { Note } from './types/note';
import { useGoogleSheets } from './hooks/useGoogleSheets';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { SearchBar } from './components/SearchBar';
import { EmptyState } from './components/EmptyState';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Plus, BookOpen, Pin, BarChart3 } from 'lucide-react';

function App() {
  const { 
    notes, 
    loading, 
    error, 
    addNote, 
    updateNote, 
    deleteNote, 
    togglePin, 
    refreshNotes 
  } = useGoogleSheets();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Genel', 'İş', 'Kişisel', 'Proje', 'Fikirler', 'Yapılacaklar'];

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      // Update existing note
      await updateNote(editingNote.id, noteData);
    } else {
      // Create new note
      await addNote(noteData);
    }
    
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      await deleteNote(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  // Filter notes based on search term and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort notes: pinned first, then by update date
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const pinnedCount = notes.filter(note => note.isPinned).length;
  const isFiltered = searchTerm || selectedCategory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Not Defterim
          </h1>
          <p className="text-gray-600 text-lg">
            Fikirlerinizi organize edin, hayallerinizi kaydedin
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Not</p>
                <p className="text-2xl font-bold text-gray-800">{notes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                <Pin size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sabitlenmiş</p>
                <p className="text-2xl font-bold text-gray-800">{pinnedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <BookOpen size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kategori</p>
                <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {/* Create Note Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleCreateNote}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={24} className="mr-3" />
            Yeni Not Oluştur
          </button>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={refreshNotes} />
        ) : sortedNotes.length === 0 ? (
          <EmptyState onCreateNote={handleCreateNote} isFiltered={isFiltered} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onTogglePin={togglePin}
              />
            ))}
          </div>
        )}

        {/* Note Modal */}
        <NoteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
          editingNote={editingNote}
          categories={categories}
        />
      </div>
    </div>
  );
}

export default App;