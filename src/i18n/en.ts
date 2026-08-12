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
  // Sign In
  signIn: {
    phone: {
      title: 'Welcome back.',
      subtitle: "Your number is your account. We'll text you six digits.",
      disclaimer: "Changed your number? Sign in on the old one first if you still have it, or get in touch — a person will help.",
      button: 'Send the code',
      newUser: 'New here? Start from the beginning',
    },
    code: {
      title: 'Check your phone.',
      subtitle: "If there's an account on {{phone}}, a code is on its way.",
      resendLabel: "Didn't arrive? Send another in {{seconds}}",
      resendAvailable: "Didn't arrive? Send another",
      expiryNote: 'The code lasts ten minutes. After that, ask for a new one.',
    },
    locked: {
      title: "Let's slow down a second.",
      subtitle: "That's five wrong codes. We'll open it back up in fifteen minutes.",
      tryAgain: 'Try again at {{time}}',
      reassurance: "Nothing's wrong with your account",
      whyLink: 'Why this happens',
      helpLink: 'Get help instead',
      disclaimer: 'A person reads these.',
    },
  },

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
    under18: {
      title: 'Come back and see us.',
      body1: "Say Hello is built for people 18 and up, so we can't set up an account today. Nothing you entered has been saved.",
      body2: 'If you got the date wrong, you can go back and fix it.',
      goBack: 'Go back',
      closeApp: 'Close the app',
    },
  },

  // Encounter
  encounter: {
    nudge: {
      headline: "It's time to Say Hello.",
      body: "Go ahead, it's just one word.",
      accept: 'Accept',
      decline: 'Not right now',
    },
    accepted: {
      points: '+25',
      pointsLabel: 'points',
      body: 'Waverly will point you at them.',
      continue: 'Show me',
    },
    arrow: {
      headline: "Waverly's pointing. Go Say Hello.",
    },
    scan: {
      headline: 'Scan the QR code and Say Hello.',
      body: 'Hold their code in the frame. It logs itself — you keep talking.',
    },
    selfiePrompt: {
      title: 'Waverly wants to remember this one.',
      subtitle: 'Take one together.',
      points: '+25',
      pointsLabel: 'points, each of you',
      button: 'Take the selfie',
      disclosure: 'The first one counts. You can always take a better one.',
    },
    selfieReview: {
      saved: 'Saved.',
      looksGood: 'Looks good',
      retake: 'Retake',
      disclaimer: "Take another if you want. We'll keep the best one.",
    },
    pinDrop: {
      title: "Waverly just dropped a pin. Right where you're standing. It stays.",
    },
    countdown: {
      header: "Waverly's holding something for you.",
      until: 'until Waverly hands it over',
    },
    reveal: {
      header: "Waverly's back. Here's what she wrote.",
      moreBelow: 'Seven more of hers below',
    },
    missedConnection: {
      header: 'Waverly thought you might want to know who you missed today.',
      points: 'The 25 points stand.',
      moreBelow: 'Four more of his below',
    },
  },

  // What's Happening
  whatsHappening: {
    header: {
      openToHellos: "You're open to Hellos",
      toggleOn: 'On',
      toggleOff: 'Off',
    },
    filters: {
      all: 'All',
      hootzas: 'Hootzas',
      discounts: 'Discounts',
      hollas: 'Hollas',
    },
    quietDay: {
      title: 'Quiet around here today',
      subtitle: "Nothing posted within a mile. Here's what's on this week a little further out.",
      postCta: {
        title: 'Start one yourself',
        body: 'A Hootza is just a time and a place. Coffee counts.',
        button: 'Post a Hootza',
      },
    },
    helloTakeover: {
      title: "It's time to",
      subtitle: "You'll both find out who a few hours from now.",
      accept: "Go ahead, it's just one word",
      decline: 'Not right now',
    },
    feedItem: {
      tonight: 'Tonight',
      join: 'Join',
      discount: 'Discount',
      ends: 'ends',
      holla: 'Holla',
      hootza: 'Hootza',
      going: 'going',
    },
  },

  // Hello Map
  map: {
    search: {
      placeholder: 'Search a city, state or country',
      cancel: 'Cancel',
      sectionsPlaces: 'Places',
      sectionsHangouts: 'Hello Hangouts',
      sectionsRecent: 'Recent',
    },
    filters: {
      nearMe: 'Near me',
      mine: 'Mine',
      helloHangouts: 'Hello Hangouts',
      thisYear: 'This year',
    },
    browsing: {
      hellosCount: '{{count}} Hellos',
      coachMark: 'Pins are people. Squares are places. Rings are happening now.',
      scrollHint: 'Scroll a pin to see the selfie behind it.',
    },
    pinSheet: {
      labelWhere: 'Where',
      labelWhen: 'When',
      labelPinNumber: 'Pin number',
      permanence: 'This pin is permanent. Both of them chose to put it here.',
      share: 'Share',
      report: 'Report',
    },
    place: {
      statsThisMonth: 'This month',
      statsHangouts: 'Hello Hangouts',
      statsYours: 'Yours',
      sectionRecent: 'Most recent',
      openOnMap: 'Open on the map',
    },
    empty: {
      title: 'No pins here yet',
      body: 'Somebody has to be first. If you\'re in {{city}}, that\'s a fun thing to be.',
      turnOnHello: 'Turn on Hello mode',
    },
  },

  // Tabs
  tabs: {
    whatsHappening: "What's Happening",
    map: 'Map',
    hellos: 'Hellos',
    prizes: 'Prizes',
    you: 'You',
  },

  // Icebreakers
  icebreakers: {
    title: 'Icebreakers',
    headerDefault: 'Your answers',
    headerCount: '{{count}} answered',
    emptyTitle: 'Questions to answer in your own words',
    emptyBody: "These show up after you've both said Hello. Answer three to share at the reveal.",
    questionUnanswered: 'Tap to answer',
    questionAnswered: 'Tap to edit',
    fieldPlaceholder: 'Your answer…',
    fieldLabel: 'Your answer',
    backButton: 'Back',
    doneButton: 'Done',
  },

  // Reveal Gate
  revealGate: {
    title: 'Three answers to share',
    body: "Icebreakers show up after you've both said Hello. Answer three questions so they have something to see.",
    answerButton: 'Answer Icebreakers',
    skipButton: 'Skip for now',
  },

  // Settings
  settings: {
    sectionTheApp: 'The app',
    sectionWhatYouShare: 'What you share',
    sectionPeople: 'People',
    sectionSmallPrint: 'The small print',
    notifications: {
      label: 'Notifications',
      value: 'Most on',
    },
    hostMode: {
      label: 'Host Mode',
      value: 'Ask each time',
    },
    icebreakers: {
      label: 'Your Icebreakers',
      value: '{{count}} answered',
    },
    blocked: {
      label: 'Blocked',
      value: '{{count}}',
    },
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    drawingRules: 'Drawing rules',
    signOut: 'Sign out',
    deleteAccount: 'Delete my account',
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
