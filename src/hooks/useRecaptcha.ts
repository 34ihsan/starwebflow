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
        console.warn('reCAPTCHA hook is not initialized properly or context is missing.');
        return '';
      }
      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (err) {
        console.warn('executeRecaptcha failed, proceeding without token:', err);
        return '';
      }
    },
    [executeRecaptcha]
  );

  return { getToken };
}
