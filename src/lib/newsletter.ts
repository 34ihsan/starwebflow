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
      console.log(`[Warmup] Subscribing ${email} to ${nl.name}...`);
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
