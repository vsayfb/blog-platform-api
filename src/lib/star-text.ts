export function starMobilePhone(phone: string) {
  phone =
    '*'.repeat(phone.length - 4) +
    phone.substring(phone.length - 4, phone.length);

  return phone;
}

export function starEmail(email: string) {
  const prefix = email.split('@')[0];

  if (prefix.length > 3) {
    email =
      '*'.repeat(prefix.length - 3) +
      prefix.substring(prefix.length - 3, prefix.length) +
      '@' +
      email.split('@')[1];
  } else if (prefix.length == 3) {
    email = '**' + prefix[2] + '@' + email.split('@')[1];
  } else if (prefix.length == 2) {
    email = '*' + prefix[1] + '@' + email.split('@')[1];
  }

  return email;
}
