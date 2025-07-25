// Google Apps Script Web App URL - Bu URL'yi Google Apps Script'ten alacağız
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzGt5tFG0biXxQ3WwoJ_NJe7lTMA9WMEliaEq_tygLRp1LFn7rubddmsI43UOziZsfXtA/exec';

export interface GoogleSheetsNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
  isPinned: string;
}

class GoogleSheetsService {
  private webAppUrl = WEB_APP_URL;

  async getAllNotes(): Promise<GoogleSheetsNote[]> {
    try {
      const response = await fetch(`${this.webAppUrl}?action=getAllNotes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.notes || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async addNote(note: GoogleSheetsNote): Promise<boolean> {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addNote',
          note: note
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Add note error:', data.error);
        return false;
      }

      return data.success === true;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  }

  async updateNote(noteId: string, updatedNote: GoogleSheetsNote): Promise<boolean> {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateNote',
          noteId: noteId,
          note: updatedNote
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Update note error:', data.error);
        return false;
      }

      return data.success === true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  }

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteNote',
          noteId: noteId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Delete note error:', data.error);
        return false;
      }

      return data.success === true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  async initializeSheet(): Promise<boolean> {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initializeSheet'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Initialize sheet error:', data.error);
        return false;
      }

      return data.success === true;
    } catch (error) {
      console.error('Error initializing sheet:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.webAppUrl}?action=testConnection`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Connection test failed:', response.status);
        return false;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Connection test error:', data.error);
        return false;
      }
      
      console.log('Connected to Google Sheets via Apps Script');
      return data.success === true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();