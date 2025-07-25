// Google Apps Script Web App URL - Bu URL'yi Google Apps Script'ten alacağız
const WEB_APP_URL = '';

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

  private isValidUrl(): boolean {
    return this.webAppUrl && 
           this.webAppUrl.startsWith('https://script.google.com/macros/s/') && 
           this.webAppUrl.endsWith('/exec');
  }

  async getAllNotes(): Promise<GoogleSheetsNote[]> {
    if (!this.isValidUrl()) {
      throw new Error('Google Apps Script Web App URL ayarlanmamış. Lütfen README talimatlarını takip edin.');
    }

    try {
      const response = await fetch(`${this.webAppUrl}?action=getAllNotes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 200)}`);
      }
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
      }
      
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
    if (!this.isValidUrl()) {
      throw new Error('Google Apps Script Web App URL ayarlanmamış. Lütfen README talimatlarını takip edin.');
    }

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
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 200)}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
      }
      
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
    if (!this.isValidUrl()) {
      throw new Error('Google Apps Script Web App URL ayarlanmamış. Lütfen README talimatlarını takip edin.');
    }

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
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 200)}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
      }
      
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
    if (!this.isValidUrl()) {
      throw new Error('Google Apps Script Web App URL ayarlanmamış. Lütfen README talimatlarını takip edin.');
    }

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
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 200)}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
      }
      
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
    if (!this.isValidUrl()) {
      throw new Error('Google Apps Script Web App URL ayarlanmamış. Lütfen README talimatlarını takip edin.');
    }

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
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text.substring(0, 200)}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
      }
      
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
    if (!this.isValidUrl()) {
      console.error('Google Apps Script Web App URL ayarlanmamış');
      return false;
    }

    try {
      const response = await fetch(`${this.webAppUrl}?action=testConnection`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Connection test failed:', response.status, text.substring(0, 200));
        return false;
      }
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text.substring(0, 200));
        return false;
      }
      
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