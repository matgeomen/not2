const API_KEY = 'AIzaSyBx5NgAawbwASM4ezlu9VyMxJgYXKKBXis';
const SPREADSHEET_ID = '1TMuX31dbctN4osdQtBvKDV_i8GTOHFr0dz3P9X1cwRo';
const SHEET_NAME = 'notlar';

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
  private baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

  async getAllNotes(): Promise<GoogleSheetsNote[]> {
    try {
      const range = `${SHEET_NAME}!A:H`;
      const response = await fetch(
        `${this.baseUrl}/values/${range}?key=${API_KEY}&majorDimension=ROWS`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      // Skip header row and convert to objects
      return rows.slice(1)
        .filter((row: string[]) => row && row[0]) // Filter out empty rows
        .map((row: string[]) => ({
          id: row[0] || '',
          title: row[1] || '',
          content: row[2] || '',
          category: row[3] || 'Genel',
          tags: row[4] || '',
          createdAt: row[5] || new Date().toISOString(),
          updatedAt: row[6] || new Date().toISOString(),
          isPinned: row[7] || 'false'
        }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  async addNote(note: GoogleSheetsNote): Promise<boolean> {
    try {
      const range = `${SHEET_NAME}!A:H`;
      const values = [[
        note.id,
        note.title,
        note.content,
        note.category,
        note.tags,
        note.createdAt,
        note.updatedAt,
        note.isPinned
      ]];

      const response = await fetch(
        `${this.baseUrl}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Add note error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  }

  async updateNote(noteId: string, updatedNote: GoogleSheetsNote): Promise<boolean> {
    try {
      // First, find the row index
      const notes = await this.getAllNotes();
      const rowIndex = notes.findIndex(note => note.id === noteId);
      
      if (rowIndex === -1) {
        console.error('Note not found for update');
        return false;
      }

      // Row index + 2 (1 for 0-based to 1-based, 1 for header row)
      const actualRowIndex = rowIndex + 2;
      const range = `${SHEET_NAME}!A${actualRowIndex}:H${actualRowIndex}`;
      
      const values = [[
        updatedNote.id,
        updatedNote.title,
        updatedNote.content,
        updatedNote.category,
        updatedNote.tags,
        updatedNote.createdAt,
        updatedNote.updatedAt,
        updatedNote.isPinned
      ]];

      const response = await fetch(
        `${this.baseUrl}/values/${range}?valueInputOption=USER_ENTERED&key=${API_KEY}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update note error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  }

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      // First, find the row index
      const notes = await this.getAllNotes();
      const rowIndex = notes.findIndex(note => note.id === noteId);
      
      if (rowIndex === -1) {
        console.error('Note not found for deletion');
        return false;
      }

      // Row index + 2 (1 for 0-based to 1-based, 1 for header row)
      const actualRowIndex = rowIndex + 2;
      
      // Get sheet ID first
      const sheetInfo = await this.getSheetInfo();
      const sheetId = sheetInfo?.sheetId || 0;
      
      const response = await fetch(
        `${this.baseUrl}:batchUpdate?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex: actualRowIndex - 1, // 0-based for API
                  endIndex: actualRowIndex
                }
              }
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete note error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  async getSheetInfo(): Promise<{ sheetId: number } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}?key=${API_KEY}&fields=sheets(properties(sheetId,title))`
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const sheet = data.sheets?.find((s: any) => s.properties.title === SHEET_NAME);
      
      return sheet ? { sheetId: sheet.properties.sheetId } : null;
    } catch (error) {
      console.error('Error getting sheet info:', error);
      return null;
    }
  }

  async initializeSheet(): Promise<boolean> {
    try {
      // Check if sheet has headers
      const range = `${SHEET_NAME}!A1:H1`;
      const response = await fetch(
        `${this.baseUrl}/values/${range}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        console.error('Error checking sheet headers');
        return false;
      }
      
      const data = await response.json();
      
      // If no data or headers don't match, initialize
      if (!data.values || data.values.length === 0 || !this.hasValidHeaders(data.values[0])) {
        const headers = [['ID', 'Başlık', 'İçerik', 'Kategori', 'Etiketler', 'Oluşturulma', 'Güncellenme', 'Sabitlenmiş']];
        
        const initResponse = await fetch(
          `${this.baseUrl}/values/${range}?valueInputOption=USER_ENTERED&key=${API_KEY}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: headers
            })
          }
        );
        
        if (!initResponse.ok) {
          console.error('Error initializing sheet headers');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing sheet:', error);
      return false;
    }
  }

  private hasValidHeaders(headers: string[]): boolean {
    const expectedHeaders = ['ID', 'Başlık', 'İçerik', 'Kategori', 'Etiketler', 'Oluşturulma', 'Güncellenme', 'Sabitlenmiş'];
    return headers.length >= 8 && (
      headers[0] === 'ID' || 
      headers[0] === 'id' ||
      expectedHeaders.some(h => headers.includes(h))
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}?key=${API_KEY}&fields=properties(title)`
      );
      
      if (!response.ok) {
        console.error('Connection test failed:', response.status);
        return false;
      }
      
      const data = await response.json();
      console.log('Connected to spreadsheet:', data.properties?.title);
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();