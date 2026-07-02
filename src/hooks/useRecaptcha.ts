/**
 * useRecaptcha — Google reCAPTCHA v3 için merkezi hook
 * Tüm formlarda tek yerden yönetim sağlar.
 */
'use client';

import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  /**
   * @param action - Form adı (örn: 'login', 'register', 'lead_form')
   * @returns reCAPTCHA token string
   * @throws Error eğer reCAPTCHA hazır değilse
   */
  const getToken = useCallback(
    async (action: string): Promise<string> => {
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA henüz yüklenmedi. Lütfen tekrar deneyin.');
      }
      const token = await executeRecaptcha(action);
      return token;
    },
    [executeRecaptcha]
  );

  return { getToken };
}
