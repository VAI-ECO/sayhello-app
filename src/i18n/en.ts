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
  // Onboarding
  onboarding: {
    value1: {
      title: 'Say Hello at local places',
      body: 'Meet people at Hello Hangouts around you',
    },
    value2: {
      title: 'Get nudges when nearby',
      body: 'Waverly finds compatible people and lets you both know',
    },
    value3: {
      title: 'Win prizes for meeting people',
      body: 'Monthly drawings. More people you meet, more entries you earn',
    },
    phone: {
      title: 'Your phone number',
      placeholder: '+1 (555) 000-0000',
      terms: 'By continuing, you agree to our Terms of Service and Privacy Policy. You must be 18 or older to use Say Hello.',
      continue: 'Continue',
      error: 'Enter a valid phone number',
    },
    otp: {
      title: 'Enter your code',
      subtitle: 'We sent a code to {{phone}}',
      resend: 'Resend code',
      verify: 'Verify',
      error: 'Invalid code. Try again.',
    },
    name: {
      title: 'What should we call you?',
      placeholder: 'Your name',
      continue: 'Continue',
      error: 'Enter your name',
    },
    birthday: {
      title: "When's your birthday?",
      subtitle: 'You must be 18 or older to use Say Hello',
      month: 'Month',
      day: 'Day',
      year: 'Year',
      continue: 'Continue',
      error: 'You must be 18 or older to use Say Hello',
    },
    photo: {
      title: 'Add a photo',
      subtitle: 'Photos appear when you both say yes',
      takePhoto: 'Take a photo',
      choosePhoto: 'Choose from library',
      skip: 'Skip for now',
      continue: 'Continue',
    },
    color: {
      title: 'Pick your color',
      subtitle: 'Tap any color to see Waverly wearing it',
      confirm: 'Waverly looks good in {{color}}. Change it any time.',
      continue: 'Continue',
    },
    location: {
      title: 'Find nearby Hello Hangouts',
      subtitle: 'Say Hello uses your location to show nearby Hello Hangouts and place pins when you meet someone',
      note: 'While using the app only',
      allow: 'Allow Location',
      skip: 'Not now',
    },
    notifications: {
      title: "Get nudges when someone's nearby",
      subtitle: 'Nudges let you know when someone nearby wants to meet',
      allow: 'Allow Notifications',
      skip: 'Not now',
    },
    welcome: {
      title: 'Welcome to Say Hello',
      subtitle: 'Ready to start meeting people',
      point1: 'Visit Hello Hangouts to meet nearby people',
      point2: 'Accept nudges to connect',
      point3: 'Earn points and entries with every hello',
      getStarted: "Let's go",
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
