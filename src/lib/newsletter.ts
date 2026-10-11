export async function subscribeToNewsletters(email: string) {
  const newsletters = [
    {
      name: 'TLDR Tech',
      url: 'https://tldr.tech/api/subscribe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    },
    {
      name: 'TLDR AI',
      url: 'https://tldr.tech/api/subscribe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, topic: 'ai' })
    },
    {
      name: 'TLDR Founders',
      url: 'https://tldr.tech/api/subscribe',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, topic: 'founders' })
    },
    {
      name: 'Dense Discovery',
      url: 'https://www.densediscovery.com/subscribe/',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}`
    },
    {
      name: 'Hacker Newsletter',
      url: 'https://hackernewsletter.com/subscribe',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}`
    }
  ];

  const results = [];
  // Pick 2-3 random newsletters per call to avoid spamming all APIs at once
  const shuffled = newsletters.sort(() => 0.5 - Math.random()).slice(0, 3);

  for (const nl of shuffled) {
    try {
      console.log(`[Warmup Seed] Subscribing ${email} to ${nl.name}...`);
      const response = await fetch(nl.url, {
        method: nl.method,
        headers: nl.headers,
        body: nl.body,
        signal: AbortSignal.timeout(6000)
      });
      results.push({ name: nl.name, success: response.ok, status: response.status });
    } catch (err: any) {
      console.error(`Failed to subscribe to ${nl.name}:`, err?.message || err);
      results.push({ name: nl.name, success: false, error: err?.message });
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

