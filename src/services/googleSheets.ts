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
        `${this.baseUrl}/values/${range}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      // Skip header row and convert to objects
      return rows.slice(1).map((row: string[]) => ({
        id: row[0] || '',
        title: row[1] || '',
        content: row[2] || '',
        category: row[3] || '',
        tags: row[4] || '',
        createdAt: row[5] || '',
        updatedAt: row[6] || '',
        isPinned: row[7] || 'false'
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
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
        `${this.baseUrl}/values/${range}:append?valueInputOption=RAW&key=${API_KEY}`,
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

      return response.ok;
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
        console.error('Note not found');
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
        `${this.baseUrl}/values/${range}?valueInputOption=RAW&key=${API_KEY}`,
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

      return response.ok;
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
        console.error('Note not found');
        return false;
      }

      // Row index + 2 (1 for 0-based to 1-based, 1 for header row)
      const actualRowIndex = rowIndex + 2;
      
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
                  sheetId: 0, // Assuming first sheet
                  dimension: 'ROWS',
                  startIndex: actualRowIndex - 1, // 0-based for API
                  endIndex: actualRowIndex
                }
              }
            }]
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  async initializeSheet(): Promise<boolean> {
    try {
      // Check if sheet has headers
      const range = `${SHEET_NAME}!A1:H1`;
      const response = await fetch(
        `${this.baseUrl}/values/${range}?key=${API_KEY}`
      );
      
      const data = await response.json();
      
      // If no data or headers don't match, initialize
      if (!data.values || data.values.length === 0) {
        const headers = [['ID', 'Title', 'Content', 'Category', 'Tags', 'CreatedAt', 'UpdatedAt', 'IsPinned']];
        
        const initResponse = await fetch(
          `${this.baseUrl}/values/${range}?valueInputOption=RAW&key=${API_KEY}`,
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
        
        return initResponse.ok;
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing sheet:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();