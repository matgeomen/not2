import { useState, useEffect } from 'react';
import { Note } from '../types/note';
import { googleSheetsService, GoogleSheetsNote } from '../services/googleSheets';

export const useGoogleSheets = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertFromGoogleSheets = (gsNote: GoogleSheetsNote): Note => ({
    id: gsNote.id,
    title: gsNote.title,
    content: gsNote.content,
    category: gsNote.category,
    tags: gsNote.tags ? gsNote.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    createdAt: gsNote.createdAt,
    updatedAt: gsNote.updatedAt,
    isPinned: gsNote.isPinned === 'true'
  });

  const convertToGoogleSheets = (note: Note): GoogleSheetsNote => ({
    id: note.id,
    title: note.title,
    content: note.content,
    category: note.category,
    tags: note.tags.join(', '),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    isPinned: note.isPinned.toString()
  });

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize sheet if needed
      await googleSheetsService.initializeSheet();
      
      const gsNotes = await googleSheetsService.getAllNotes();
      const convertedNotes = gsNotes.map(convertFromGoogleSheets);
      setNotes(convertedNotes);
    } catch (err) {
      setError('Notlar yüklenirken hata oluştu');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      };

      const gsNote = convertToGoogleSheets(newNote);
      const success = await googleSheetsService.addNote(gsNote);
      
      if (success) {
        setNotes(prev => [newNote, ...prev]);
        return true;
      } else {
        setError('Not eklenirken hata oluştu');
        return false;
      }
    } catch (err) {
      setError('Not eklenirken hata oluştu');
      console.error('Error adding note:', err);
      return false;
    }
  };

  const updateNote = async (id: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const existingNote = notes.find(note => note.id === id);
      if (!existingNote) {
        setError('Not bulunamadı');
        return false;
      }

      const updatedNote: Note = {
        ...noteData,
        id,
        createdAt: existingNote.createdAt,
        updatedAt: new Date().toISOString()
      };

      const gsNote = convertToGoogleSheets(updatedNote);
      const success = await googleSheetsService.updateNote(id, gsNote);
      
      if (success) {
        setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
        return true;
      } else {
        setError('Not güncellenirken hata oluştu');
        return false;
      }
    } catch (err) {
      setError('Not güncellenirken hata oluştu');
      console.error('Error updating note:', err);
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const success = await googleSheetsService.deleteNote(id);
      
      if (success) {
        setNotes(prev => prev.filter(note => note.id !== id));
        return true;
      } else {
        setError('Not silinirken hata oluştu');
        return false;
      }
    } catch (err) {
      setError('Not silinirken hata oluştu');
      console.error('Error deleting note:', err);
      return false;
    }
  };

  const togglePin = async (id: string) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return false;

      const updatedNote: Note = {
        ...note,
        isPinned: !note.isPinned,
        updatedAt: new Date().toISOString()
      };

      const gsNote = convertToGoogleSheets(updatedNote);
      const success = await googleSheetsService.updateNote(id, gsNote);
      
      if (success) {
        setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
        return true;
      } else {
        setError('Not güncellenirken hata oluştu');
        return false;
      }
    } catch (err) {
      setError('Not güncellenirken hata oluştu');
      console.error('Error toggling pin:', err);
      return false;
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    refreshNotes: loadNotes
  };
};