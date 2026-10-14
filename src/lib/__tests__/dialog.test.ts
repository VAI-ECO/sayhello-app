/**
 * @jest-environment jsdom
 */
import { Alert, Platform } from 'react-native';
import { showDialog } from '../dialog';

const setOS = (os: 'ios' | 'web') => jest.replaceProperty(Platform, 'OS', os);

afterEach(() => {
  jest.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('showDialog on native', () => {
  it('delegates to Alert.alert with the same arguments', () => {
    setOS('ios');
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const buttons = [{ text: 'OK' }];
    showDialog('Title', 'Body', buttons);
    expect(alert).toHaveBeenCalledWith('Title', 'Body', buttons);
  });
});

describe('showDialog on web', () => {
  beforeEach(() => setOS('web'));

  it('uses window.alert for a message with no buttons', () => {
    const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    showDialog('Saved', 'Your changes were saved');
    expect(alert).toHaveBeenCalledWith('Saved\n\nYour changes were saved');
  });

  it('runs the action when window.confirm is accepted (cancel + one action)', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const onCancel = jest.fn();
    const onDelete = jest.fn();
    showDialog('Delete?', undefined, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('runs cancel when window.confirm is declined', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    const onCancel = jest.fn();
    const onDelete = jest.fn();
    showDialog('Delete?', undefined, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  describe('three or more buttons (in-app sheet)', () => {
    const threeButtons = (handlers: { a: jest.Mock; b: jest.Mock; cancel: jest.Mock }) => [
      { text: 'Option A', onPress: handlers.a },
      { text: 'Option B', onPress: handlers.b },
      { text: 'Cancel', style: 'cancel' as const, onPress: handlers.cancel },
    ];

    it('renders an accessible modal dialog named by its title and focuses the first button', () => {
      showDialog('Choose', 'Pick one', threeButtons({ a: jest.fn(), b: jest.fn(), cancel: jest.fn() }));
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
      expect(dialog?.getAttribute('aria-label')).toBe('Choose');
      expect(document.activeElement?.textContent).toBe('Option A');
    });

    it('runs the pressed action and removes the sheet', () => {
      const handlers = { a: jest.fn(), b: jest.fn(), cancel: jest.fn() };
      showDialog('Choose', undefined, threeButtons(handlers));
      const buttons = Array.from(document.querySelectorAll('button'));
      buttons.find((b) => b.textContent === 'Option B')?.click();
      expect(handlers.b).toHaveBeenCalledTimes(1);
      expect(handlers.a).not.toHaveBeenCalled();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('Escape closes the sheet and runs the cancel button', () => {
      const handlers = { a: jest.fn(), b: jest.fn(), cancel: jest.fn() };
      showDialog('Choose', undefined, threeButtons(handlers));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(handlers.cancel).toHaveBeenCalledTimes(1);
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('stops listening for Escape once closed (no double cancel)', () => {
      const handlers = { a: jest.fn(), b: jest.fn(), cancel: jest.fn() };
      showDialog('Choose', undefined, threeButtons(handlers));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(handlers.cancel).toHaveBeenCalledTimes(1);
    });

    it('returns focus to the element that was focused before it opened', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();
      showDialog('Choose', undefined, threeButtons({ a: jest.fn(), b: jest.fn(), cancel: jest.fn() }));
      expect(document.activeElement).not.toBe(trigger);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(document.activeElement).toBe(trigger);
    });
  });
});
