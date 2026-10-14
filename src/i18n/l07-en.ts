/**
 * Lane 07 (map-feed) strings. Own namespaces so merging with other lanes' en.ts edits stays trivial.
 * No distance, no figure, "Hello Hangout" never shortened (RULES §8.12, §7.18).
 */
export const l07En = {
  // Map pan and zoom controls (no distance; the viewport is never described in miles or kilometres, §8.12/§8.14)
  mapNav: {
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    north: 'Move map north',
    south: 'Move map south',
    west: 'Move map west',
    east: 'Move map east',
  },
  feedViews: {
    label: 'View',
    today: 'Today',
    this_week: 'This week',
    nearest: 'Nearest',
    newest: 'Newest',
    placeTbd: 'Place to come',
    privateResidence: 'Private residence',
    locationNeeded: "Turn on location and we'll show what's nearest.",
    locationBlocked: 'Location is off for Say Hello. You can turn it on in your phone settings.',
    openSettings: 'Open settings',
    comingUp: 'Coming up this week',
    thisWeekEmpty: 'Nothing else is posted yet.',
    openFailed: "That didn't change. Try again.",
    notSwitchedOn: "You're open to Hellos. Meeting people nearby isn't switched on in the app yet.",
    showMore: 'Show more',
  },
};
