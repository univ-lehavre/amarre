import { json, type RequestHandler } from '@sveltejs/kit';

import { signupWithEmail } from '$lib/server/services/authService';
import { validateSignupEmail } from '$lib/validators/server/auth';
import { mapErrorToResponse } from '$lib/errors/mapper';
import type { Models } from 'node-appwrite';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse form data
    const form = await request.formData();
    const unsecuredEmail = String(form.get('email') || '').trim();
    const email = await validateSignupEmail(unsecuredEmail);

    // Perform signup
    const token: Models.Token = await signupWithEmail(email);
    console.log(`Signup token created for email — ${email} — at ${token.$createdAt}`);

    return json({ data: { signedUp: true }, error: null }, { status: 200 });
  } catch (error: unknown) {
    return mapErrorToResponse(error);
  }
};
