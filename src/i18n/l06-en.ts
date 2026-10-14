/**
 * Lane 06 (organizations and Hootzas) strings. Kept in their own file so the shared en.ts takes one import and one spread.
 * No business figure appears here; counts and limits come from the server.
 */
export const l06En = {
  l06: {
    hootza: {
      orgNote: 'Whoever turns up says Hello on their own account. Waverly never nudges on behalf of a group, and the group earns nothing from anybody meeting here.',
    },
    code: {
      try: 'Try {{code}}',
      tooManyGroups: 'Your account already has as many groups as are allowed. Close one to set up another.',
    },
    page: {
      finished: 'Finished',
      came: '{{n}} came',
      share: 'Share',
      shareMessage: '{{name}} on Say Hello: {{link}}',
    },
    // "Posting as" on the create flow (CANON-RL-01-SN-75). The split rows state the three facts the design note names.
    posting: {
      title: 'Posting as',
      you: 'You',
      splitTitle: 'Posting as the group means',
      checkInsLabel: 'Check-ins go to', checkInsValue: 'The group',
      pointsLabel: 'Points go to', pointsValue: 'You, personally',
      nameLabel: 'Your name is on it', nameValue: 'In the record',
      quotaLeft: '{{perMonth}} free posts a month for the group, and yours are separate. {{left}} left this month. There is nothing to buy either way.',
      quotaNone: '{{perMonth}} free posts a month for the group, and they are used this month. It will live on the group’s page. There is nothing to buy.',
      quotaLoading: 'Checking the group’s free posts…',
      quotaUnknown: 'Could not read the group’s free posts. It will live on the group’s page.',
      feedTitle: 'Put it on the feed',
      feedBody: 'Uses one of the group’s free posts this month. Without it, the Hootza lives on the group’s page.',
    },
    comments: {
      remove: 'Remove',
      removeTitle: 'Remove this comment?',
      removeBody: 'It disappears from the list for everyone. It is kept on record for moderation.',
      removeKeep: 'Keep it',
      removeFailed: "Couldn't remove that comment. Try again.",
    },
    leads: {
      tooMany: 'That is a lot of lookups for now. Try again in a little while.',
      invalidPhone: 'That does not look like a phone number. Include the country code.',
    },
    host: {
      awardNotYours: "This group earns no points. Any points for this Hootza go to the lead it is posted under, not to you.",
    },
    events: {
      publicNeedsPlace: 'A public Hootza of a group that meets at a home needs its own place. The group’s address is never copied in.',
      postAgain: 'Post again',
      postAgainNote: 'Copied from your earlier Hootza. Pick a new date and time; Hootzas are posted one at a time.',
      postAgainFailed: "Couldn't copy the earlier Hootza. You can still fill this in by hand.",
      closedGroup: 'This group is closed, so it cannot post new Hootzas.',
    },
  },
} as const;
