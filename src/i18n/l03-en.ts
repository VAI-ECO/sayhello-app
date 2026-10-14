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
