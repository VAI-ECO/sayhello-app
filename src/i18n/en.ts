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
      subtitle: "Nothing nearby yet. Here's what's on this week a little further out.",
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
    retry: 'Try again',
    comeBackLater: 'Come back to it later',
  },

  // Hootzas
  hootzas: {
    common: {
      back: '←',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading…',
      empty: 'Nothing here yet',
      hootza: 'Hootza',
      newHootza: 'New Hootza',
      stepOf: '{{current}} of {{total}}',
      next: 'Next',
      postIt: 'Post it',
      host: 'Host',
      hostedBy: 'Hosted by {{name}}',
      retry: 'Try again',
      unknown: '…',
      notAvailable: '—',
      submitComment: '↑',
    },
    venue: {
      publicPlace: 'Public place',
      publicPlaceHint: 'A bar, a park, a shop, a lot',
      privateResidence: 'Private residence',
      privateResidenceHint: 'A house, a flat, a yard',
      required: 'Required',
      pickOne: 'Pick one. Everybody who sees this will see which it is.',
      privateBannerTitle: 'You picked private residence',
      privateBannerBody:
        "Your page will say so, up top, before anyone taps going. Your address only shows to people who RSVP.",
      addressLabel: 'Address',
      addressPlaceholder: 'Search or drop a pin',
      privateBeforeRsvp: "Someone's home. The address shows once you say you're going.",
    },
    status: {
      live: 'Live',
      ended: 'Ended',
      cancelled: 'Cancelled',
      endedAt: 'Finished {{time}}',
      cancelledNotice: '{{host}} cancelled this on {{date}}. Everyone going was told.',
      wasScheduled: 'was {{time}}',
    },
    page: {
      goingCount: '{{count}} going',
      imGoing: "I'm going",
      youreGoing: "You're going",
      tapAgain: 'Tap it again if something comes up.',
      turnUpPoint: 'Turning up is worth a point.',
      rsvpClosed: 'RSVP closed',
      thisOnesOver: "This one's over",
      overNote: 'No countdown, no next time prompt.',
      coverCharge: '{{amount}} at the door',
      coverCollect: '{{host}} collects it. Not through the app.',
      chatRow: 'Chat · read only',
      chatClosedEnded: 'Closed when the Hootza ended',
      chatClosedCancelled: 'Closed on cancellation',
      chatLive: 'Chat · {{count}} messages',
      chatAudience: "Everyone who's going",
      checkedIn: 'checked in',
      hellosSaid: 'Hellos said here',
      whoCame: 'Who came',
      postAgain: 'Post it again',
      postAgainHint: 'Host only · opens a new Hootza with these details',
      fromHost: 'From the host',
      pageStaysUp:
        'The page stays up so anyone who saw it earlier finds out what happened rather than finding nothing.',
      onThisWeekInstead: 'On this week instead',
    },
    create: {
      whatLabel: 'What is it',
      whatHint: 'A run club, a book group, a tailgate, coffee. Coffee counts.',
      whenLabel: 'When',
      dateLabel: 'Date',
      startsLabel: 'Starts',
      monthLimit: 'Nothing further out than a month — a month is the limit.',
      endLabel: 'Roughly when it wraps',
      graceNote: '+1 hour grace',
      endHint:
        "A backstop, not a bell. You end it yourself when it's over; if you forget, this does it an hour later.",
      detailsLabel: 'Anything they should know',
      coverLabel: 'Charging at the door',
      optional: 'optional',
      youCollect: 'You collect it',
      coverHint:
        "We print the number on your page so nobody's surprised. Say Hello never takes it and never handles it.",
      chatToggle: 'A chat for everyone going',
      chatToggleHint:
        'Off unless you turn it on. One room, everyone in it, closes when the Hootza does.',
      adultsToggle: 'Adults only',
      adultsToggleHint: "Only turn this on if it matters for yours. Most don't need it.",
      expiryNote: 'It comes down after the event night. No renewing.',
      postAgainBannerTitle: 'Same as last time',
      postAgainBannerBody: "Everything's filled in except the date. Change whatever you like.",
      calledLabel: 'Called',
      validationTitle: 'Give it a name first',
      validationVenue: 'Pick public place or private residence',
      validationWhen: 'Pick when it starts and when it wraps',
    },
    howItRuns: {
      title: 'How it runs',
      hostModeToggle: 'Host Mode windows',
      hostModeToggleHint:
        'You nudge the room to open up for a while. Your call how often, and how long.',
      every: 'Every',
      openFor: 'Open for',
      minutes: 'min',
      posting: 'Posting…',
    },
    host: {
      title: "You're hosting",
      liveNow: 'Live now',
      startedBackstop: 'Started {{start}} · backstop {{end}}',
      checkedIn: 'checked in',
      saidGoing: 'said going',
      pointsSoFar: 'points so far',
      hostModeTitle: 'Host Mode windows',
      hostModeHint:
        'You nudge the room to open up for a while. Your call how often, and how long.',
      every: 'Every',
      openFor: 'Open for',
      nextWindow: 'Next window at {{time}}. Ends when the Hootza does.',
      checkInCode: 'Check-in code',
      scannedIn: '{{count}} scanned in',
      whosHere: "Who's here",
      attendeeList: 'Attendee list',
      wrapTitle: "That's a wrap",
      wrapHint:
        'Stops the windows and the code. The page stays up, marked finished. Nobody gets a notification.',
      endButton: 'End the Hootza',
      cancelInstead: 'Calling it off instead?',
      cancelHint: 'All {{count}} people get told. Different thing entirely.',
      cancelLink: 'Cancel this Hootza',
      hostingPointsPending: "{{base}} for hosting lands when it's over.",
      perAttendeePoints: '+{{count}}',
      perAttendeeLabel: 'points, no cap',
      holdItUp: 'Hold it up. They scan it.',
      tableNote: 'Or leave the phone on the table by the door. Same thing.',
    },
    checkIn: {
      youreIn: "You're in",
      checkedInAt: 'Checked in at {{title}}.',
      hostAsking: "{{host}}, who's hosting, is asking",
      hostModeAsk:
        'Can we open you up to Hellos for a few stretches tonight?',
      hostModeExplain:
        "A few times during the night your phone will let you know the room is open. That's all it does. You can turn yours off whenever you like, and it all stops when the Hootza does.",
      acceptHostMode: 'Yeah, go on',
      declineHostMode: 'Not tonight',
      eitherWay: "Either way you're checked in and the point's yours.",
      scanPrompt: 'Enter the code from the host screen',
      submit: 'Check in',
    },
    hostModeWindow: {
      appName: 'Say Hello',
      notificationCopy: "The room's open at {{title}}. Next ten minutes.",
      oneNotification: 'One notification for the window. Not one per person here.',
      youreOpen: "You're open",
      timeLeft: '{{minutes}} min left',
      roomOpen: "{{host}}'s got the room open for a bit. If somebody near you is open too, you'll both know.",
      sitOut: 'Sit this one out',
      sitOutHint: 'No windows for now. Turn it back on whenever you like',
      whenItStops: 'When it stops',
      whenItStopsBody:
        "At {{endTime}}, when the Hootza ends — or the second {{host}} ends it. Walking out early doesn't switch it off, so switch it off yourself if you'd rather.",
    },
    endVsCancel: {
      title: 'Two different words',
      endTitle: 'End',
      endLead: "It happened, and it's over.",
      endPointsStay: 'Points already earned stay',
      endPinsStay: 'Pins on the map stay',
      endNoNotify: 'Nobody is notified',
      endPage: 'Page reads Ended, chat goes read-only',
      endFallback: 'Happens by itself an hour after the backstop if you forget.',
      cancelTitle: 'Cancel',
      cancelLead: "It isn't going to happen.",
      cancelNotify: 'Everyone going is told',
      cancelReason: 'Your reason goes on the page',
      cancelPage: 'Page stays up, marked Cancelled',
      cancelNoUndo: "Can't be undone",
      cancelOnlyYou: 'Only you can do this, and only before it ends.',
      placement:
        'Never on the same row, never the same colour, never one tap apart. End lives at the top of host controls; Cancel lives at the bottom of Edit.',
    },
    cancelConfirm: {
      title: "Tell the {{count}} it's off?",
      body: 'They get a notification straight away. The page stays up with your reason on it, so anyone who saw it earlier finds out what happened.',
      reasonLabel: "What happened",
      reasonVisible: "they'll see this",
      confirm: 'Cancel it and tell them',
      keep: 'Keep it on',
    },
    edit: {
      title: 'Edit',
      goingBanner: "{{count}} people said they're going",
      goingHint:
        'Change the time or the place and they all get told. Everything else you can fix quietly.',
      toldHeader: "They'll be told",
      quietHeader: "They won't",
      startsLabel: 'Starts',
      whereLabel: 'Where',
      calledLabel: 'Called',
      detailsLabel: 'Anything they should know',
      doorLabel: 'At the door',
      change: 'Change',
      readOnlyNote: 'Saving changes to a live Hootza needs a backend update that is not live yet.',
      cancelLink: 'Cancel this Hootza',
    },
    comments: {
      title: 'Comments',
      subtitle: 'Anyone can read these',
      placeholder: 'Ask something',
      footer: 'Comments are public. The chat is for people going.',
      empty: 'No comments yet. Be the first to ask something.',
    },
    whosHere: {
      title: "Who's here",
      subtitle: '{{checkedIn}} checked in of {{going}} going',
      privacy:
        "Only you see this list, and only while it's on. It's for counting the room, not for keeping.",
      notScannedHeader: 'Said going, not scanned',
      notScannedBody:
        "{{count}} people. We don't list them — plenty turn up without scanning, and a list of no-shows isn't a thing this app makes.",
      clearsAtEnd: 'The list clears when the Hootza ends.',
      unavailable: 'Attendee names are not available from the API yet. Counts update live.',
    },
    postAgain: {
      back: '← Back',
    },
    empty: {
      title: 'Nothing on in {{area}} today',
      areaDefault: 'nearby',
      body: 'There are {{count}} this week, and you can always start one yourself.',
      seeWeek: 'See this week',
      startOne: 'Start one',
    },
    postError: {
      title: "That didn't go through",
      body: "Your Hootza is saved exactly as you left it. Nothing's lost.",
    },
    discount: {
      title: 'New Discount',
      preview: 'Preview',
      slotsBanner:
        "{{count}} free post left this month. Resets {{date}}. Only counts if you put it in What's Happening.",
      slotsBannerGeneric:
        "Free posts reset each month. Only counts if you put it in What's Happening.",
      offerLabel: 'The offer',
      twoClocks: 'Two clocks · whichever runs out first',
      dealRuns: 'Your deal runs',
      from: 'From',
      until: 'Until',
      dealHint: 'You set these. We never guess them.',
      feedShelf: 'It sits in the feed 7 days',
      feedDrop: "Every post gets a week. Yours drops out of What's Happening on {{date}}.",
      reconciliation: 'So: in the feed till {{feedDate}}, then on your own page till {{dealDate}}. Your page never expires.',
      feedOption: "Put it in What's Happening",
      feedOptionHint: 'Everyone nearby sees it. Uses one of your posts.',
      pageOption: 'Just put it on our page',
      pageOptionHint: 'Free, as many as you like. People find it when they look you up or check the map.',
      postFree: 'Post it — free',
      usesLastFree: "Uses your last free post this month. Switch to page-only and it's free.",
      outOfPostsTitle: 'Your posts',
      outOfPostsUsed: '{{used}} of {{total}} used',
      outOfPostsBody:
        "Two free posts a month, three if you're a Founding Hello Hangout. They don't roll over, and an expired post has still been used.",
      liveNow: 'Live now',
      feedTill: 'Feed till {{feed}} · deal till {{deal}}',
      beforeChange: 'Before you change one',
      editingFree: 'Editing is free',
      editingFreeBody: 'Change the wording, the dates, the picture. Same post, same slot.',
      deleteCosts: 'Deleting and reposting costs one',
      deleteCostsBody: "The slot goes with it. Letting one expire doesn't give it back either.",
      postAnother: 'Post another — $10',
      postAnotherHint: 'One-off. Same seven days, same two clocks.',
      paymentNotReady: 'Paid posts need payment setup that is not live yet.',
      missingHangout: 'This screen needs a Hello Hangout id to post.',
    },
  },

  // MA-05 figures — change here without touching layout
  figures: {
    ma05Disclaimer:
      'Illustration only — results depend on your effort. Not typical or guaranteed.',
    annual: '$100',
    routeBYearOne: '$50',
    influencerFlat: '$20',
    foundingPrice: '$199',
    regularPrice: '$349',
    deferredPrice: '$249',
    extraPost: '$10',
    referralPoints: '100',
  },

  ambassador: {
    common: {
      back: '←',
      loading: 'Loading…',
      retry: 'Try again',
      empty: 'Nothing here yet',
      potential: 'Potential',
      notAvailable: '—',
      backendUnavailable:
        'This part needs a backend update that is not live yet. The screen is here; saving or loading live data is not.',
      helloHangout: 'Hello Hangout',
      foundingHelloHangout: 'Founding Hello Hangout',
    },
    earnedBuilding: {
      title: 'Ambassador',
      earnedLabel: 'Earned · paid to you',
      earnedSub: 'Across {{count}} complete Hello Hangouts',
      buildingLabel: 'Building',
      pitch:
        'Real money now. A business building for the future. The more it grows, the more it is worth — and that is up to you.',
      signedPaid: 'Signed them up · paid',
      waitingVisit: 'Waiting on a visit',
      claimCta: 'Go claim {{amount}}',
      payableNote:
        'Payable commissions look different from ones still building. Nothing moves until the Hello Hangout pays Say Hello.',
    },
    hangouts: {
      title: 'My Hello Hangouts',
      tabNeedsVisit: 'Needs a visit · {{count}}',
      tabComplete: 'Complete · {{count}}',
      checkInHere: 'Check in here',
      paidOn: 'Paid {{date}}',
      neverVisited: 'never visited',
      awaitingPayment: 'Awaiting payment — nothing to claim yet',
      visitedOn: 'Visited {{date}}',
      renews: 'renews {{date}}',
      completeSection: 'Complete',
      unavailable: 'Portfolio list needs GET /ambassador/hangouts, which is not live yet.',
    },
    queue: {
      offeredToYou: 'Offered to you',
      worthYearOne: 'Worth to you, year one',
      signedBy: 'Signed by',
      anotherAmbassador: 'Another Ambassador',
      renewalYears: 'Renewal years',
      renewalYearsValue: '{{amount}} each',
      yourHolds: 'Your holds',
      accept: 'Accept',
      pass: 'Pass',
      ineligibleTitle: 'Offers paused',
      emptyTitle: 'Nothing offered right now',
      emptyBody: 'When a released Hello Hangout is yours, it shows up here — one at a time.',
    },
    visitCheckIn: {
      atVenue: "You're at {{name}}",
      representationDone: 'Representation, done.',
      completeBody:
        "That's {{name}} complete for the year — {{amount}} for looking after it. See you back here in about six months.",
      done: 'Done',
      leaveNote: 'Leave a note about the visit',
      scanTitle: 'Scan their stand',
      scanBody:
        "A visit needs a live scan of that Hello Hangout's own code. No photo of a code, no screenshot, no typing a number in.",
      whyExists:
        'This check exists so your work is provable — GPS plus the scan at the door. It is how you get paid, not surveillance.',
      unavailable:
        'POST /ambassador/visits/check-in is not live yet. The scanner UI is ready; submission stays disabled.',
      submitScan: 'Scan now',
    },
    visitHistory: {
      title: 'Visit history',
      lead:
        'This page is your evidence, not ours. We are not tracking you between visits — each row is a visit you chose to log.',
      windowsOpen: 'Window open now',
      windowsClear: 'Nothing due',
      whatYouDid: "What you've done",
      scanned: 'Scanned',
      atDoor: 'At the door',
      counted: 'Counted',
      scanProof: 'Their stand · {{code}}',
      unavailable: 'GET /ambassador/visits is not live yet.',
    },
    commissions: {
      title: 'Commissions',
      paidToYou: 'Paid to you',
      building: 'Building',
      buildingSub: 'Not yours yet. Some of it may never be.',
      annualCol: 'Per Hello Hangout · {{amount}}',
      annualSub: 'DEFAULT — see MONEY.md',
      routeBNote: 'Already signed and paid when you picked it up: {{amount}} in year one, then full rate.',
      statusPaid: 'Paid',
      statusBuilding: 'Building',
      unavailable: 'GET /ambassador/commissions is not live yet.',
    },
    payouts: {
      title: 'Payouts',
      ready: 'Ready to withdraw',
      settling: 'Settling',
      settlingSub: 'Clears 30 days after the business pays',
      reversed: 'Reversed',
      howTitle: 'How a withdrawal works',
      howBody:
        "You can withdraw once you're at {{minimum}}. We review requests before they're sent, so it isn't instant — you'll see it move to Sent when it's approved.",
      recent: 'Recent',
      withdraw: 'Withdraw {{amount}}',
      w9Required: 'Tax form required before your first withdrawal.',
      emptyHistory: 'No withdrawals yet.',
      statusSent: 'Sent',
      statusReview: 'In review',
    },
    signup: {
      title: 'Set up how you get paid.',
      body: 'Stripe handles your W-9 and your bank details. Your Social Security number goes to Stripe and never touches our database — we do not have it and cannot see it.',
      stepAccount: 'Account created',
      stepAccountSub: 'Free, and it stays free',
      stepPhone: 'Phone verified',
      stepTax: 'Tax form & payout account',
      stepTaxSub: 'About four minutes, with Stripe',
      stepUnlock: 'Ambassador tab unlocks',
      stepUnlockSub: 'Offers start arriving',
      anyone: "Anyone can be an Ambassador. There's no application to pass and no waiting list.",
      continueStripe: 'Continue to Stripe',
      returnNote: "You'll come right back here when you're done",
      markW9: 'Mark tax form complete',
      stripeNotReady: 'Stripe onboarding is not wired yet. W-9 stub exists on the server.',
    },
    store: {
      title: 'Ambassador gear',
      headline: 'A uniform, not merch.',
      body: 'Sold at what it costs us. Walking into a business in this makes the conversation easier — that is the whole point of it.',
      unavailable: 'Ambassador store needs Shopify integration that is not live yet.',
    },
    findBusiness: {
      title: 'Find the business',
      searchPlaceholder: 'Search or drop a pin',
      unavailable: 'Business search and signup need backend routes that are not live yet.',
    },
    confirmDetails: {
      title: 'Confirm details',
      unavailable: 'Hello Hangout signup needs backend routes that are not live yet.',
    },
    photo: {
      title: 'Photo of the place',
      takeNow: 'Take one now',
      chooseLibrary: 'Choose from library',
      signCta: 'Sign {{name}}',
      signingNote: "Signing isn't earning — your {{amount}} lands when they pay.",
      unavailable: 'Photo upload and signup need backend routes that are not live yet.',
    },
  },

  refer: {
    hangout: {
      title: 'Refer a Hello Hangout',
      headline: 'Where do you already go?',
      body: "Name a place you'd want to run into someone. We'll ask them about becoming a Hello Hangout.",
      searchPlaceholder: 'Search places',
      ifTheySign: 'If they sign up',
      pointsLabel: 'points',
      pointsBody: 'Points spend in the store, and keep your balance from resetting.',
      boundary:
        "Members don't earn money on Hello Hangouts — that's an Ambassador's job, and you can sign up to be one any time.",
      send: 'Send it to us',
      unavailable: 'Member Hello Hangout referrals need a backend route that is not live yet.',
    },
  },

  hangout: {
    common: {
      helloHangout: 'Hello Hangout',
      foundingHelloHangout: 'Founding Hello Hangout',
      regular: 'Regular',
      perYear: '/ year',
      chooseFounding: 'Choose Founding',
      chooseRegular: 'Choose regular',
      nothingDue:
        "You don't pay anything to get started.",
      billingNote:
        "Billing begins after our first national prize drawing. You'll be told before anything is charged.",
      lockFiveYears: 'Your price is locked for five years',
      goldenIcon: 'The golden Hello Hangout icon on your listing',
      everythingRegular: 'Everything in the regular tier',
    },
    signup: {
      title: 'Become a Hello Hangout.',
      unavailable: 'Hello Hangout self-signup and payment need backend routes that are not live yet.',
    },
    dashboard: {
      onMap: 'People with you on their map',
      hellosHere: 'Hellos here',
      dealsUsed: 'Deals used',
      yourPosts: 'Your posts',
      ambassadorVisit: '{{name}} came by {{date}}',
      ambassadorNext: 'Your Ambassador · next visit around {{when}}',
      postSomething: 'Post something',
      unavailable: 'getBusinessDashboard is not live in the API yet.',
    },
    createPost: {
      title: 'Create a post',
    },
    directory: {
      title: 'Hello Hangout directory',
      unavailable: 'Directory listing needs backend routes that are not live yet.',
    },
    listing: {
      title: 'Hello Hangout listing',
      unavailable: 'Directory detail needs backend routes that are not live yet.',
    },
    redeem: {
      title: 'Deal redemption',
      scanPrompt: "Scan the member's code",
      unavailable: 'Deal redemption needs backend routes that are not live yet.',
    },
  },

  influencer: {
    common: {
      creditNotCoupon: 'Codes carry credit, never price. Nothing here is a coupon or a discount.',
      flatRate: '{{amount}} a year for every Hello Hangout on your code, however it got there.',
      neverPercent: 'Flat rate. Never a percentage.',
    },
    earnings: {
      title: "What you've earned",
      paidToYou: 'Paid to you',
      owedToYou: 'Owed to you',
      building: 'Building',
      buildingSub: 'Signed, not yet paid us',
      streamA: 'Stream A',
      streamATitle: 'Businesses you signed up yourself',
      streamB: 'Stream B · your busiest Ambassadors',
      streamBTitle: 'Ambassadors on your code',
      unavailable: 'Influencer earnings dashboard needs GET /influencer/earnings, which is not live yet.',
    },
    pickCode: {
      title: 'Pick a code',
      available: 'Nobody has this one. It is yours if you take it.',
      howUsed: 'How people will use it',
      takeCode: 'Take this code',
      twoThings: 'Two things to know',
    },
    codeTaken: {
      title: 'That one is taken',
      tryAnother: 'Try another',
      freeNow: 'Free right now',
      takeThis: 'Take this code',
      taken: 'Already in use',
    },
  },
} as const;

export type Translations = typeof en;
