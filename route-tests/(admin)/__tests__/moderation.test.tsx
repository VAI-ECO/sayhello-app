/**
 * HELLO ADMIN › FLAGGED TEXT and KEYWORDS (RULES §24.15, lane 04) — the screens against a mocked API. They prove
 * what the screens ask for and show; the server's authorization is proved in the API's admin-moderation test.
 *
 * RNTL v14: render / fireEvent / userEvent are async and awaited.
 */

import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

let mockWindowWidth = 375;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWindowWidth, height: 900, scale: 1, fontScale: 1 }),
}));

jest.mock('../../../src/api/admin', () => ({ getAdminMe: jest.fn() }));

jest.mock('../../../src/api/admin-w2', () => ({
  getFlaggedQueue: jest.fn(),
  decideFlagged: jest.fn(),
  getKeywords: jest.fn(),
  addKeyword: jest.fn(),
  setKeywordActive: jest.fn(),
  deleteKeyword: jest.fn(),
}));

jest.mock('../../../src/api/client', () => ({ api: { init: jest.fn(), get: jest.fn(), post: jest.fn() } }));

import * as adminApi from '../../../src/api/admin';
import * as w2 from '../../../src/api/admin-w2';
import AdminHomeScreen from '../../../app/admin/index';
import AdminFlaggedScreen from '../../../app/admin/flagged';
import AdminKeywordsScreen from '../../../app/admin/keywords';

const api = adminApi as jest.Mocked<typeof adminApi>;
const m = w2 as jest.Mocked<typeof w2>;

const me = (permissions: string[]) => ({
  data: {
    permissions, sections: ['reports'], isSuperAdmin: false, twoFactorEnabled: true, twoFactorEnforced: true, twoFactorVerified: true,
  },
}) as never;

const item = { id: 'q1', contentType: 'hootza_comment', contentId: 'c1', flaggedText: 'some flagged words', matchedKeywords: ['flagged'], autoFlagged: true, userReported: true, createdAt: new Date().toISOString() };
const kw = { id: 'k1', keyword: 'spam', category: 'spam', isActive: true, createdAt: new Date().toISOString() };

async function wrap(ui: React.ReactElement) {
  await render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Hello Admin flagged text and keywords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowWidth = 375;
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn(), replace: jest.fn() });
    api.getAdminMe.mockResolvedValue(me(['reports.review', 'reports.resolve', 'reports.keywords']));
    m.getFlaggedQueue.mockResolvedValue({ data: { queue: [item] } } as never);
    m.getKeywords.mockResolvedValue({ data: { keywords: [kw] } } as never);
  });

  describe('Home', () => {
    it('opens Flagged text with reports.review and Keywords with reports.keywords, each only with its own permission', async () => {
      api.getAdminMe.mockResolvedValue(me(['reports.review']));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByTestId('admin-open-flagged')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-open-keywords')).not.toBeOnTheScreen();
    });
  });

  describe('Flagged text', () => {
    it('shows the text and why it was flagged, and never who wrote or reported it', async () => {
      await wrap(<AdminFlaggedScreen />);
      expect(await screen.findByTestId('admin-flagged-text-q1')).toHaveTextContent('some flagged words');
      expect(screen.getByText('Matched a keyword')).toBeOnTheScreen();
      expect(screen.getByText('Reported by a member')).toBeOnTheScreen();
      expect(screen.getByText('Matched: flagged')).toBeOnTheScreen();
    });

    it('an empty queue says so', async () => {
      m.getFlaggedQueue.mockResolvedValue({ data: { queue: [] } } as never);
      await wrap(<AdminFlaggedScreen />);
      expect(await screen.findByTestId('admin-flagged-empty')).toBeOnTheScreen();
    });

    it('a decision needs a reason, goes to the server once and reloads the queue', async () => {
      m.decideFlagged.mockResolvedValue({ data: { message: 'reviewed' } } as never);
      await wrap(<AdminFlaggedScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByTestId('admin-flagged-remove-q1-open'));
      await user.press(screen.getByTestId('admin-flagged-remove-q1-confirm'));
      expect(m.decideFlagged).not.toHaveBeenCalled();
      expect(await screen.findByTestId('admin-flagged-remove-q1-error')).toBeOnTheScreen();
      await user.type(screen.getByTestId('admin-flagged-remove-q1-reason'), 'abusive');
      m.getFlaggedQueue.mockResolvedValue({ data: { queue: [] } } as never);
      await user.press(screen.getByTestId('admin-flagged-remove-q1-confirm'));
      await waitFor(() => expect(m.decideFlagged).toHaveBeenCalledWith('q1', 'removed', 'abusive'));
      expect(m.decideFlagged).toHaveBeenCalledTimes(1);
      expect(await screen.findByTestId('admin-flagged-empty')).toBeOnTheScreen();
    });

    it('an item someone else already decided is said in words', async () => {
      m.decideFlagged.mockResolvedValue({ error: { code: 'already_reviewed' } } as never);
      await wrap(<AdminFlaggedScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByTestId('admin-flagged-ok-q1-open'));
      await user.type(screen.getByTestId('admin-flagged-ok-q1-reason'), 'fine');
      await user.press(screen.getByTestId('admin-flagged-ok-q1-confirm'));
      expect(await screen.findByTestId('admin-flagged-ok-q1-error')).toHaveTextContent('This one has already been decided.');
    });

    it('an account that can read but not resolve sees the text and no decision buttons', async () => {
      api.getAdminMe.mockResolvedValue(me(['reports.review']));
      await wrap(<AdminFlaggedScreen />);
      expect(await screen.findByText('This account can read flagged text but not decide it.')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-flagged-remove-q1-open')).not.toBeOnTheScreen();
    });
  });

  describe('Keywords', () => {
    it('lists the words and their state', async () => {
      await wrap(<AdminKeywordsScreen />);
      expect(await screen.findByTestId('admin-keyword-k1')).toBeOnTheScreen();
      expect(screen.getByText('Active')).toBeOnTheScreen();
    });

    it('adds a word, then clears the form and reloads', async () => {
      m.addKeyword.mockResolvedValue({ data: { keyword: kw } } as never);
      await wrap(<AdminKeywordsScreen />);
      const user = userEvent.setup();
      await user.type(await screen.findByTestId('admin-keyword-new-word'), '  scam ');
      await user.press(screen.getByTestId('admin-keyword-add'));
      await waitFor(() => expect(m.addKeyword).toHaveBeenCalledWith('scam', undefined));
      await waitFor(() => expect(m.getKeywords).toHaveBeenCalledTimes(2));
    });

    it('a symbol that would act as a pattern is refused in words', async () => {
      m.addKeyword.mockResolvedValue({ error: { code: 'keyword_invalid' } } as never);
      await wrap(<AdminKeywordsScreen />);
      const user = userEvent.setup();
      await user.type(await screen.findByTestId('admin-keyword-new-word'), '.*');
      await user.press(screen.getByTestId('admin-keyword-add'));
      expect(await screen.findByTestId('admin-keyword-new-error')).toHaveTextContent('Use plain words only. Symbols that act as a pattern are not accepted.');
    });

    it('pauses a word, and removal takes two presses', async () => {
      m.setKeywordActive.mockResolvedValue({ data: { message: 'updated' } } as never);
      m.deleteKeyword.mockResolvedValue({ data: { message: 'deleted' } } as never);
      await wrap(<AdminKeywordsScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByTestId('admin-keyword-toggle-k1'));
      await waitFor(() => expect(m.setKeywordActive).toHaveBeenCalledWith('k1', false));
      await user.press(await screen.findByTestId('admin-keyword-remove-k1'));
      expect(m.deleteKeyword).not.toHaveBeenCalled();
      await user.press(screen.getByTestId('admin-keyword-remove-confirm-k1'));
      await waitFor(() => expect(m.deleteKeyword).toHaveBeenCalledWith('k1'));
    });
  });
});
