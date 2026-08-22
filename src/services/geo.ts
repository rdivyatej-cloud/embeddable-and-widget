export async function getGeoLocation(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (ip === '127.0.0.1' || ip === '::1' || !ip) {
    return { country: 'Local', city: 'Localhost' };
  }

  // Provider A: ip-api.com
  try {
    const resA = await fetch(`http://ip-api.com/json/${ip}`);
    if (resA.ok) {
      const data = await resA.json();
      if (data.status === 'success') {
        return { country: data.country, city: data.city };
      }
    }
  } catch (err) {
    console.error('Geo Provider A failed:', err);
  }

  // Provider B: ipapi.co (Fallback)
  try {
    const resB = await fetch(`https://ipapi.co/${ip}/json/`);
    if (resB.ok) {
      const data = await resB.json();
      if (!data.error) {
        return { country: data.country_name, city: data.city };
      }
    }
  } catch (err) {
    console.error('Geo Provider B failed:', err);
  }

  // Fallback if all down
  return { country: null, city: null };
}
