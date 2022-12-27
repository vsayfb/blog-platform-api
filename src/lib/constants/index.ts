/** SERVICE TOKEN */
export const MANAGE_DATA_SERVICE = 'MANAGE_DATA_SERVICE';
export const CASL_SUBJECT = 'CASL_SUBJECT';

/** ROUTES */
export const ACCOUNTS_ROUTE = '/accounts';
export const LOCAL_ACCOUNTS_ROUTE = ACCOUNTS_ROUTE + '/local';
export const GOOGLE_ACCOUNTS_ROUTE = ACCOUNTS_ROUTE + '/google';
export const LOCAL_ACCOUNTS_CREDENTIALS_ROUTE =
  LOCAL_ACCOUNTS_ROUTE + '/credentials';
export const GOOGLE_ACCOUNTS_CREDENTIALS_ROUTE =
  GOOGLE_ACCOUNTS_ROUTE + '/credentials';
export const PROFILES_ROUTE = '/profiles';
export const AUTH_ROUTE = '/auth';
export const LOCAL_AUTH_ROUTE = '/local' + AUTH_ROUTE;
export const GOOGLE_AUTH_ROUTE = '/google' + AUTH_ROUTE;
export const BOOKMARKS_ROUTE = '/bookmarks';
export const CHATS_ROUTE = '/chats';
export const COMMENTS_ROUTE = '/comments';
export const EXPRESSIONS_ROUTE = '/expressions';
export const FOLLOW_ROUTE = '/follow';
export const MESSAGES_ROUTE = '/messages';
export const POSTS_ROUTE = '/posts';
export const TAGS_ROUTE = '/tags';
export const NOTIFICATIONS_ROUTE = '/notifications';
export const SUBSCRIPTIONS_ROUTE = '/subscriptions';
export const TFA_ROUTE = '/2fa';
export const ACCOUNT_TFA = ACCOUNTS_ROUTE + TFA_ROUTE;
export const LOCAL_ACCOUNT_TFA = '/local_accounts' + TFA_ROUTE;
export const GOOGLE_ACCOUNT_TFA = '/google_accounts' + TFA_ROUTE;
