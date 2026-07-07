'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  // Always provide a key to prevent 'GoogleReCaptcha Context has not yet been implemented' crash
  // If the key is missing in production, it will gracefully fail during verification.
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'missing_site_key';

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{ async: true, defer: true }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
