/**
 * REPORT SCREEN TESTS
 *
 * One flow for the four targets the screen offers (hello, hootza_comment, hootza_chat, hangout_post).
 * The six canonical reasons (RULES §35.19) apply to every target; the payload is POST /safety/report
 * with { reportType, conversationId, reason, details?, reportedUserId?, userAcknowledgedSharing: true }.
 * A private chat message is reported from the chat's own sheet, so 'chat' is not a target here.
 *
 * RNTL v14: ALL async operations (render, fireEvent, etc.) MUST be awaited
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ReportScreen from '../../app/report';
import { ThemeProvider } from '../../src/theme';

const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

const mockPost = jest.fn();
jest.mock('../../src/api/client', () => ({
  api: { post: (...a: unknown[]) => mockPost(...a) },
}));

const HELLO = { type: 'hello', id: 'hello-123', name: 'Marco', context: 'Foxhole · 12 Aug', userId: 'user-9' };
const REASON_LABELS: Record<string, string> = {
  harassment: 'Harassment',
  hate_speech: 'Hate speech',
  spam: 'Spam',
  threat: 'Threat',
  sexual_content: 'Sexual content',
  other: 'Something else',
};

const renderScreen = () => render(<ThemeProvider><ReportScreen /></ThemeProvider>);

describe('Report Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { ...HELLO };
    mockPost.mockResolvedValue({ data: { report: { id: '1', status: 'open' } } });
  });

  describe('Header and Context', () => {
    it('renders Cancel and the Report title', async () => {
      await renderScreen();
      expect(screen.getByText('Cancel')).toBeTruthy();
      expect(screen.getByText('Report')).toBeTruthy();
    });

    it('shows a context card naming the target and who/what is reported', async () => {
      await renderScreen();
      expect(screen.getByText('REPORTING A HELLO')).toBeTruthy();
      expect(screen.getByText('Marco · Foxhole · 12 Aug')).toBeTruthy();
    });

    it.each([
      ['hello', 'REPORTING A HELLO'],
      ['hootza_comment', 'REPORTING A COMMENT'],
      ['hootza_chat', 'REPORTING A MESSAGE'],
      ['hangout_post', 'REPORTING A HELLO HANGOUT POST'],
    ])('labels a %s target as "%s"', async (type, label) => {
      mockParams = { type, id: 'x-1', name: 'Name' };
      await renderScreen();
      expect(screen.getByText(label)).toBeTruthy();
    });

    it('Cancel calls router.back()', async () => {
      await renderScreen();
      await fireEvent.press(screen.getByText('Cancel'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Targets the server does not accept', () => {
    it.each([['pin'], ['chat'], ['person'], ['']])('says there is nothing to report for type "%s" and never posts', async (type) => {
      mockParams = { type, id: 'x-1', name: 'Name' };
      await renderScreen();
      expect(screen.getByText('There is nothing to report here.')).toBeTruthy();
      expect(screen.queryByTestId('report-submit')).toBeNull();
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('says there is nothing to report when the target id is missing', async () => {
      mockParams = { type: 'hello' };
      await renderScreen();
      expect(screen.getByText('There is nothing to report here.')).toBeTruthy();
      expect(screen.queryByTestId('report-submit')).toBeNull();
    });
  });

  describe('Reason Selection (the six canonical reasons, §35.19)', () => {
    it('renders the What\'s the problem section with exactly six reasons, in order', async () => {
      await renderScreen();
      expect(screen.getByText("WHAT'S THE PROBLEM")).toBeTruthy();
      const rows = screen.getAllByRole('radio');
      expect(rows).toHaveLength(6);
      expect(rows.map((r) => r.props.testID)).toEqual(Object.keys(REASON_LABELS).map((k) => `report-reason-${k}`));
      Object.values(REASON_LABELS).forEach((label) => expect(screen.getByText(label)).toBeTruthy());
    });

    it('shows the same six reasons for every target', async () => {
      mockParams = { type: 'hangout_post', id: 'post-1', name: 'Happy hour' };
      await renderScreen();
      expect(screen.getAllByRole('radio')).toHaveLength(6);
      expect(screen.queryByText("The selfie shouldn't be there")).toBeNull();
    });

    it('selecting a reason marks only that row selected', async () => {
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-spam'));
      expect(screen.getByTestId('report-reason-spam').props.accessibilityState.selected).toBe(true);
      expect(screen.getByTestId('report-reason-threat').props.accessibilityState.selected).toBe(false);
      expect(screen.getAllByText('✓')).toHaveLength(1);
      await fireEvent.press(screen.getByTestId('report-reason-threat'));
      expect(screen.getByTestId('report-reason-spam').props.accessibilityState.selected).toBe(false);
      expect(screen.getByTestId('report-reason-threat').props.accessibilityState.selected).toBe(true);
    });

    it('does not send until a reason is chosen', async () => {
      await renderScreen();
      expect(screen.getByTestId('report-submit').props.accessibilityState?.disabled).toBe(true);
      await fireEvent.press(screen.getByTestId('report-submit'));
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('Optional Detail Field', () => {
    it('renders "Tell us more" with the optional label and a placeholder', async () => {
      await renderScreen();
      expect(screen.getByText(/TELL US MORE/)).toBeTruthy();
      expect(screen.getByText(/optional/)).toBeTruthy();
      expect(screen.getByPlaceholderText('Anything that helps us understand.')).toBeTruthy();
    });

    it('accepts text input', async () => {
      await renderScreen();
      const input = screen.getByPlaceholderText('Anything that helps us understand.');
      await fireEvent.changeText(input, 'Additional context here');
      expect(input.props.value).toBe('Additional context here');
    });
  });

  describe('Privacy and Safety Notices', () => {
    it('says the reported person is never told who reported, with the target named', async () => {
      await renderScreen();
      expect(screen.getByText('Sending this lets Say Hello review this Hello. Marco is never told who reported.')).toBeTruthy();
    });

    it.each([
      ['hootza_comment', 'this comment'],
      ['hootza_chat', 'this message'],
      ['hangout_post', 'this post'],
    ])('names what a %s report shares: "%s"', async (type, what) => {
      mockParams = { type, id: 'x-1', name: 'Pat' };
      await renderScreen();
      expect(screen.getByText(`Sending this lets Say Hello review ${what}. Pat is never told who reported.`)).toBeTruthy();
    });

    it('shows the emergency line notice with the Send button', async () => {
      await renderScreen();
      expect(screen.getByText("In danger right now? Call your local emergency number — we can't help fast enough.")).toBeTruthy();
    });
  });

  describe('Submit Functionality', () => {
    it('posts to /safety/report with the target type, id, reason and the sharing acknowledgement', async () => {
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-harassment'));
      await fireEvent.press(screen.getByTestId('report-submit'));
      await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
      expect(mockPost).toHaveBeenCalledWith('/safety/report', {
        reportType: 'hello',
        conversationId: 'hello-123',
        reason: 'harassment',
        details: undefined,
        reportedUserId: 'user-9',
        userAcknowledgedSharing: true,
      });
    });

    it.each([
      ['hootza_comment', 'comment-1'],
      ['hootza_chat', 'msg-1'],
      ['hangout_post', 'post-1'],
    ])('posts a %s report with that id and no reportedUserId', async (type, id) => {
      mockParams = { type, id, name: 'X' };
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-other'));
      await fireEvent.press(screen.getByTestId('report-submit'));
      await waitFor(() => expect(mockPost).toHaveBeenCalled());
      expect(mockPost).toHaveBeenCalledWith('/safety/report', expect.objectContaining({
        reportType: type, conversationId: id, reason: 'other', reportedUserId: undefined, userAcknowledgedSharing: true,
      }));
    });

    it('includes trimmed optional details when provided', async () => {
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-threat'));
      await fireEvent.changeText(screen.getByPlaceholderText('Anything that helps us understand.'), '  Additional context  ');
      await fireEvent.press(screen.getByTestId('report-submit'));
      await waitFor(() => expect(mockPost).toHaveBeenCalledWith('/safety/report', expect.objectContaining({
        reason: 'threat', details: 'Additional context',
      })));
    });

    it('sends only once however many times Send is pressed', async () => {
      mockPost.mockImplementation(() => new Promise((r) => setTimeout(() => r({ data: { report: { id: '1', status: 'open' } } }), 100)));
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-spam'));
      await fireEvent.press(screen.getByTestId('report-submit'));
      await fireEvent.press(screen.getByTestId('report-submit'));
      expect(mockPost).toHaveBeenCalledTimes(1);
      await screen.findByTestId('report-sent');
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('shows the receipt only on success (no outcome, no reporter detail) and Done goes back', async () => {
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-spam'));
      await fireEvent.press(screen.getByTestId('report-submit'));
      expect(await screen.findByTestId('report-sent')).toBeTruthy();
      expect(screen.getByText('Report sent')).toBeTruthy();
      expect(screen.getByText("Thanks. We'll look at it. We won't tell you what we decide.")).toBeTruthy();
      await fireEvent.press(screen.getByTestId('report-done'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('shows the server message when submission fails, stays on the form, and allows a retry', async () => {
      mockPost.mockResolvedValueOnce({ error: { code: 'server_error', message: 'Network error' } });
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-spam'));
      await fireEvent.press(screen.getByTestId('report-submit'));
      expect(await screen.findByText('Network error')).toBeTruthy();
      expect(screen.queryByTestId('report-sent')).toBeNull();
      expect(mockBack).not.toHaveBeenCalled();
      await fireEvent.press(screen.getByTestId('report-submit'));
      expect(await screen.findByTestId('report-sent')).toBeTruthy();
      expect(mockPost).toHaveBeenCalledTimes(2);
    });

    it('says reporting is not available yet when the server returns chat_reporting_unavailable', async () => {
      mockPost.mockResolvedValueOnce({ error: { code: 'chat_reporting_unavailable', message: 'x' } });
      await renderScreen();
      await fireEvent.press(screen.getByTestId('report-reason-spam'));
      await fireEvent.press(screen.getByTestId('report-submit'));
      expect(await screen.findByText('Reporting is not available yet.')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('Cancel is a button and reasons are radios with selected state', async () => {
      await renderScreen();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
      screen.getAllByRole('radio').forEach((r) => expect(r.props.accessibilityState).toEqual(expect.objectContaining({ selected: false })));
    });
  });

  describe('§8.12 Distance Guard', () => {
    it('never shows distance anywhere on screen', async () => {
      const { container } = await renderScreen();
      const text = JSON.stringify(container);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*(mile|mi|km|meter|feet|ft)/);
      expect(text.toLowerCase()).not.toMatch(/\d+\s*away/);
    });
  });
});
