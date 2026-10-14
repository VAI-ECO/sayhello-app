/**
 * CASE TRANSFORMATION TESTS
 *
 * Verifies snake_case ↔ camelCase transformation for API request/response bodies.
 */

import { keysToCamel, keysToSnake } from '../case-transform';

describe('Case Transformation', () => {
  describe('keysToCamel', () => {
    it('transforms snake_case keys to camelCase', () => {
      const input = {
        user_id: '123',
        phone_number: '+15551234567',
        created_at: '2024-01-01T00:00:00Z',
      };

      const expected = {
        userId: '123',
        phoneNumber: '+15551234567',
        createdAt: '2024-01-01T00:00:00Z',
      };

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('handles nested objects', () => {
      const input = {
        user_profile: {
          full_name: 'Alex Chen',
          date_of_birth: '1990-01-01',
        },
      };

      const expected = {
        userProfile: {
          fullName: 'Alex Chen',
          dateOfBirth: '1990-01-01',
        },
      };

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('handles arrays of objects', () => {
      const input = [
        { question_id: '1', question_text: 'What?' },
        { question_id: '2', question_text: 'Why?' },
      ];

      const expected = [
        { questionId: '1', questionText: 'What?' },
        { questionId: '2', questionText: 'Why?' },
      ];

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('preserves primitives', () => {
      expect(keysToCamel('hello')).toBe('hello');
      expect(keysToCamel(123)).toBe(123);
      expect(keysToCamel(null)).toBe(null);
      expect(keysToCamel(true)).toBe(true);
    });

    it('preserves dates', () => {
      const date = new Date('2024-01-01');
      expect(keysToCamel(date)).toBe(date);
    });

    it('preserves arrays of primitives', () => {
      const input = ['one', 'two', 'three'];
      expect(keysToCamel(input)).toEqual(input);
    });
  });

  describe('keysToSnake', () => {
    it('transforms camelCase keys to snake_case', () => {
      const input = {
        userId: '123',
        phoneNumber: '+15551234567',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const expected = {
        user_id: '123',
        phone_number: '+15551234567',
        created_at: '2024-01-01T00:00:00Z',
      };

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('handles nested objects', () => {
      const input = {
        userProfile: {
          fullName: 'Alex Chen',
          dateOfBirth: '1990-01-01',
        },
      };

      const expected = {
        user_profile: {
          full_name: 'Alex Chen',
          date_of_birth: '1990-01-01',
        },
      };

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('handles arrays of objects', () => {
      const input = [
        { questionId: '1', questionText: 'What?' },
        { questionId: '2', questionText: 'Why?' },
      ];

      const expected = [
        { question_id: '1', question_text: 'What?' },
        { question_id: '2', question_text: 'Why?' },
      ];

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('preserves primitives', () => {
      expect(keysToSnake('hello')).toBe('hello');
      expect(keysToSnake(123)).toBe(123);
      expect(keysToSnake(null)).toBe(null);
      expect(keysToSnake(true)).toBe(true);
    });
  });

  describe('Round-trip transformation', () => {
    it('camel → snake → camel preserves structure', () => {
      const original = {
        userId: '123',
        userProfile: {
          fullName: 'Alex',
          contactInfo: {
            phoneNumber: '+1555123',
            emailAddress: 'alex@example.com',
          },
        },
        tagsList: ['one', 'two'],
      };

      const snaked = keysToSnake(original);
      const restored = keysToCamel(snaked);

      expect(restored).toEqual(original);
    });

    it('snake → camel → snake preserves structure', () => {
      const original = {
        user_id: '123',
        user_profile: {
          full_name: 'Alex',
          contact_info: {
            phone_number: '+1555123',
            email_address: 'alex@example.com',
          },
        },
        tags_list: ['one', 'two'],
      };

      const cameled = keysToCamel(original);
      const restored = keysToSnake(cameled);

      expect(restored).toEqual(original);
    });
  });
});
