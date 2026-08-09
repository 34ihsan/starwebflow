export async function subscribeToNewsletters(email: string) {
  const newsletters = [
    {
      name: 'TLDR Tech',
      url: 'https://tldr.tech/api/subscribe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }
  ];

  const results = [];
  for (const nl of newsletters) {
    try {
      console.log(`[Warmup Seed] Subscribing ${email} to ${nl.name}...`);
      const response = await fetch(nl.url, {
        method: nl.method,
        headers: nl.headers,
        body: nl.body
      });
      results.push({ name: nl.name, success: response.ok, status: response.status });
    } catch (err) {
      console.error(`Failed to subscribe to ${nl.name}:`, err);
      results.push({ name: nl.name, success: false, error: err });
    }
  }
  return results;
}

/**
 * Otonom Abonelikten Çıkma (Unsubscribe Engine)
 * E-posta gövdesindeki veya başlığındaki Unsubscribe bağlantısına otonom tıklayarak abonelikten ayrılır.
 */
export async function unsubscribeFromNewsletter(unsubscribeUrlOrEmail: string): Promise<boolean> {
  try {
    if (unsubscribeUrlOrEmail.startsWith('http://') || unsubscribeUrlOrEmail.startsWith('https://')) {
      console.log(`[Warmup Seed] Unsubscribing via HTTP GET: ${unsubscribeUrlOrEmail}`);
      const res = await fetch(unsubscribeUrlOrEmail, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000)
      });
      return res.ok;
    }
    return false;
  } catch (err) {
    console.error(`[Warmup Seed] Failed to unsubscribe from ${unsubscribeUrlOrEmail}:`, err);
    return false;
  }
}

