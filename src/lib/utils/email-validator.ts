import dns from 'dns';

export async function verifyEmailSafely(email: string): Promise<{ isValid: boolean; reason?: string }> {
  if (!email) {
    return { isValid: false, reason: 'E-posta adresi boş olamaz.' };
  }

  // 1. Regex Syntax Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: 'Geçersiz e-posta formatı.' };
  }

  const [_, domain] = email.split('@');
  if (!domain) {
    return { isValid: false, reason: 'E-posta alan adı (domain) bulunamadı.' };
  }

  // 2. Disposable / Temporary Email Domain Check (Optional basic blocklist)
  const disposableDomains = [
    'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com', 'throwawaymail.com'
  ];
  if (disposableDomains.includes(domain.toLowerCase())) {
    return { isValid: false, reason: 'Geçici e-posta adreslerine izin verilmez.' };
  }

  // 3. DNS MX Record Check
  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, reason: 'Alan adında aktif bir mail sunucusu (MX kaydı) bulunamadı.' };
    }
    
    // Check if valid
    return { isValid: true };
  } catch (error: any) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return { isValid: false, reason: 'Alan adında aktif bir mail sunucusu (MX kaydı) bulunamadı.' };
    }
    // Timeout or other DNS error, we might want to assume valid temporarily to prevent false positives,
    // but in a strict system we block. Let's return true if it's a timeout to avoid blocking real leads on our DNS failure.
    console.error(`DNS MX sorgusu başarısız oldu: ${domain}`, error);
    return { isValid: true };
  }
}
