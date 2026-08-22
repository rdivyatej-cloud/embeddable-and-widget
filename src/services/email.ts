export async function sendConfirmationEmail(email: string | undefined, widgetId: string) {
  // Safe side effect - non-critical
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      try {
        if (email === 'fail@example.com') {
          throw new Error('Simulated email failure');
        }
        console.log(`[Email Service] Sent confirmation to ${email || 'unknown'} for widget ${widgetId}`);
        resolve();
      } catch (err) {
        console.error('[Email Service] Failed to send email, but continuing...', err);
        resolve(); // resolve anyway so we don't break main path
      }
    }, 100);
  });
}
