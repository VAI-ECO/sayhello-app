/**
 * Lane 03 (Hello proof) strings: the Connections list empty state and the connection note screen, moved off hard-coded
 * English. Wording is the text the screens already carried; nothing is new copy except the load-failed/retry lines, which
 * follow the existing account.connections.loadFailed phrasing. No figure appears here.
 */
export const l03En = {
  l03: {
    connections: {
      empty: 'Your connections show up here after you say hello.',
      retry: 'Try again',
    },
    // Venue presence (RULES §9, W-052). No design exists for this screen; the words are proposals in Waverly's plain voice, none states a
    // distance or a figure (§8.12, §27.7), and none explains anyone else (§10.21, §21.1).
    presence: {
      enter: "I'm here — scan the code",
      title: "Scan this place's code",
      body: "Point the camera at the Say Hello code at the counter. It tells Waverly you're here.",
      openCamera: 'Open the camera',
      stopCamera: 'Stop camera',
      openSettings: 'Open camera settings',
      cameraDenied: 'Camera access is off. Turn it on in Settings to scan the code.',
      cameraFailed: 'The camera could not open. Try again.',
      sending: 'One moment…',
      current: "You're counted as here at {{name}} until {{time}}.",
      done: "You're here at {{name}}.",
      count: '{{count}} scanned in here lately.',
      until: 'Counted as here until {{time}}.',
      scanAgain: 'Scan again whenever you like to stay.',
      leave: 'Leave this place',
      unknownCode: "That isn't a Say Hello place code.",
      venueNotActive: "This place isn't open to scan right now.",
      notEligible: "Scanning isn't available for this account.",
      unavailable: "Scanning here isn't available yet.",
      failed: "That didn't go through. Check your connection and try again.",
      back: 'Back',
    },
    note: {
      back: 'Back',
      title: 'Connection note',
      private: 'Private to you. The other person does not see this.',
      placeholder: 'Add a note',
      save: 'Save note',
      saving: 'Saving…',
      delete: 'Delete note',
      loadFailed: "Your note didn't load. Check your connection and try again.",
      saveFailed: "Your note didn't save. Check your connection and try again.",
    },
  },
};
