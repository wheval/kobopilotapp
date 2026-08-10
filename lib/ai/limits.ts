/** Shared by the composer and the route so both agree. Kept dependency-free so the
 *  client bundle doesn't pull in zod just to read a number. */

/** Longest single message the API accepts. The composer enforces the same cap. */
export const MAX_MESSAGE_CHARS = 1000;

/** Turns of history forwarded to the model. Older turns are dropped, not rejected. */
export const MAX_HISTORY_MESSAGES = 16;

/** Matches the holdings cap in the request schema. */
export const MAX_SNAPSHOT_HOLDINGS = 20;
