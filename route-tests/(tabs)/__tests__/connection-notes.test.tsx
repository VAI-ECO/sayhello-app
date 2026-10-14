/**
 * CONNECTION NOTES — WIRE against /hellos/:id/notes
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import ConnectionDetailScreen from '../../../app/(tabs)/hellos/[id]';
import { ThemeProvider } from '../../../src/theme';
import {
  getConnectionNotes,
  saveConnectionNote,
  deleteConnectionNote,
} from '../../../src/api/hellos';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({ id: 'h1' })),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

jest.mock('../../../src/api/hellos', () => ({
  getConnectionNotes: jest.fn(),
  saveConnectionNote: jest.fn(),
  deleteConnectionNote: jest.fn(),
}));

describe('Connection notes', () => {
  it('loads the camelCase note payload returned by the real API client', async () => {
    (getConnectionNotes as jest.Mock).mockResolvedValue({
      data: { notes: [{ id: 'n1', helloId: 'h1', userId: 'u1', noteText: 'A real saved note' }] },
    });
    await render(<ThemeProvider><ConnectionDetailScreen /></ThemeProvider>);
    expect(screen.getByDisplayValue('A real saved note')).toBeOnTheScreen();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads notes and saves', async () => {
    (getConnectionNotes as jest.Mock).mockResolvedValue({
      data: {
        notes: [
          {
            id: 'n1',
            hello_id: 'h1',
            user_id: 'u1',
            note_text: 'Met at the cafe',
            content_language: 'en-US',
            created_at: '2026-08-24T00:00:00Z',
            updated_at: '2026-08-24T00:00:00Z',
          },
        ],
      },
    });
    (saveConnectionNote as jest.Mock).mockResolvedValue({
      data: {
        note: {
          id: 'n1',
          hello_id: 'h1',
          user_id: 'u1',
          note_text: 'Met at the cafe',
          content_language: 'en-US',
          created_at: '2026-08-24T00:00:00Z',
          updated_at: '2026-08-24T00:00:00Z',
        },
      },
    });

    render(
      <ThemeProvider>
        <ConnectionDetailScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Met at the cafe')).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByTestId('connection-note-save'));

    await waitFor(() => {
      expect(saveConnectionNote).toHaveBeenCalledWith('h1', 'Met at the cafe');
    });
  });

  it('deletes a note', async () => {
    (getConnectionNotes as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          notes: [
            {
              id: 'n1',
              hello_id: 'h1',
              user_id: 'u1',
              note_text: 'Keep',
              content_language: 'en-US',
              created_at: '2026-08-24T00:00:00Z',
              updated_at: '2026-08-24T00:00:00Z',
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { notes: [] } });
    (deleteConnectionNote as jest.Mock).mockResolvedValue({ data: { message: 'Note deleted' } });

    render(
      <ThemeProvider>
        <ConnectionDetailScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Keep')).toBeOnTheScreen();
    });
    await waitFor(() => {
      expect(screen.getByTestId('connection-note-delete')).toBeOnTheScreen();
    });
    fireEvent.press(screen.getByTestId('connection-note-delete'));
    await waitFor(() => {
      expect(deleteConnectionNote).toHaveBeenCalledWith('h1');
    });
  });
});
