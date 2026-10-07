import { FORM, formBody } from './form.config.js';

// Sends the inquiry to the Pharosline Google Form in the background.
// Google doesn't allow reading the response cross-origin (no-cors), so a resolved
// request means it was sent; a network failure rejects and the form shows an error.
export async function submitInquiry(data) {
  await fetch(FORM.responseUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody(data).toString(),
  });
  return { ok: true };
}
