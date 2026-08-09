/**
 * SAY HELLO ENGLISH LOCALE
 *
 * ⚠️ All user-facing strings go through the locale layer from the first line.
 * No literals in components.
 *
 * 🔒 LOCKED VOCABULARY (never vary):
 * - Hello Hangout (never bare "Hangout")
 * - Hootza (never "Hootsa")
 * - Icebreakers (never "survey")
 * - Waverly (never "the Hello Hand", "the logo", "the mark")
 * - Portfolio (never "book of business")
 * - Hello (never "Hi")
 * - Building (never "guaranteed" or "money in the bank")
 *
 * 🚫 "Hookup" appears NOWHERE
 *
 * ❌ NO NEGATION STACKING
 * Say what IS, not what isn't.
 */

export const en = {
  // Auth
  auth: {
    phone: {
      title: 'Your phone number',
      placeholder: '+1 (555) 000-0000',
      terms: 'By continuing, you agree to our Terms of Service and Privacy Policy. You must be 18 or older to use Say Hello.',
      continue: 'Continue',
    },
    otp: {
      title: 'Enter your code',
      subtitle: 'We sent a code to {{phone}}',
      resend: 'Resend code',
      verify: 'Verify',
    },
    name: {
      title: 'What should we call you?',
      placeholder: 'Your name',
      continue: 'Continue',
    },
    birthday: {
      title: "When's your birthday?",
      subtitle: 'You must be 18 or older to use Say Hello',
      continue: 'Continue',
    },
    photo: {
      title: 'Add a photo',
      subtitle: 'Photos appear when you both say yes',
      skip: 'Skip for now',
      continue: 'Continue',
    },
    color: {
      title: 'Pick your color',
      subtitle: 'Your color appears on your pin, in nudges, and with Waverly',
    },
    permissions: {
      location: {
        title: 'Find nearby Hello Hangouts',
        subtitle: 'Say Hello uses your location to show nearby Hello Hangouts and place pins when you meet someone',
        allow: 'Allow Location',
        skip: 'Not now',
      },
      notifications: {
        title: "Get nudges when someone's nearby",
        subtitle: 'Nudges let you know when someone nearby wants to meet',
        allow: 'Allow Notifications',
        skip: 'Not now',
      },
    },
  },

  // Tabs
  tabs: {
    whatsHappening: "What's Happening",
    map: 'Map',
    hellos: 'Hellos',
    points: 'Points',
    profile: 'Profile',
  },

  // Placeholders
  placeholder: {
    title: '{{screen}} coming soon',
    subtitle: 'This screen will be built in a later run',
  },

  // Common
  common: {
    continue: 'Continue',
    skip: 'Skip',
    done: 'Done',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
  },

  // Errors
  error: {
    generic: 'Something went wrong. Please try again.',
    network: 'Check your connection and try again.',
    notFound: "We couldn't find what you're looking for.",
  },
} as const;

export type Translations = typeof en;
