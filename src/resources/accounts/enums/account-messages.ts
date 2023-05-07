export enum AccountMessages {
  USERNAME_TAKEN = 'The username was taken before.',
  EMAIL_TAKEN = 'The email was taken before.',
  USERNAME_AVAILABLE = 'The username is available.',
  EMAIL_AVAILABLE = 'The email is available.',
  INVALID_EMAIL = 'Invalid email address.',
  INVALID_MOBILE_PHONE = 'Invalid mobil phone number.',
  NOT_FOUND = 'Account not found.',
  FOUND = 'An account found.',
  FOUND_BY_USERNAME = 'Accounts have been found according to the query string.',
  UPDATED = 'Account has been updated.',
  PP_CHANGED = 'User profile picture has been changed.',
  PASSWORD_UPDATED = 'Account password has been changed.',
  EMAIL_ADDED = 'Email added to the account.',
  EMAIL_REMOVED = 'Email removed from account.',
  MOBILE_PHONE_ADDED = 'Mobile phone added to the account.',
  MOBILE_PHONE_REMOVED = 'Mobile phone removed from account.',
  WRONG_PASSWORD = 'Password was wrong.',
  HAS_NOT_MOBILE_PHONE = 'Account has not a mobile phone number.',
  HAS_MOBILE_PHONE = 'Account has already a mobile phone number.',
  HAS_NOT_EMAIL = 'Account has not an email.',
  HAS_EMAIL = 'Account has already an email.',
  MOBILE_PHONE_TAKEN = 'The mobile phone number was taken before.',

  MUST_HAS_PHONE_OR_EMAIL = 'The account must have a phone number or email address.',
}
