(function() {
  const scriptTag = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const url = new URL(scriptTag.src);
  const widgetId = url.searchParams.get('id');
  const apiBase = url.origin;

  if (!widgetId) {
    console.error('Embeddable Widget: Missing id parameter');
    return;
  }

  // Fetch widget config
  fetch(`${apiBase}/api/widgets/${widgetId}/config`)
    .then(res => res.json())
    .then(config => {
      if (config.error) {
        console.error('Embeddable Widget:', config.error);
        return;
      }
      renderWidget(config, apiBase);
    })
    .catch(err => console.error('Embeddable Widget: Failed to load config', err));

  function renderWidget(config, apiBase) {
    const container = document.createElement('div');
    container.style.cssText = 'border: 1px solid #ccc; padding: 20px; max-width: 300px; font-family: sans-serif; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: #fff;';
    
    const title = document.createElement('h3');
    title.textContent = config.title;
    title.style.marginTop = '0';
    container.appendChild(title);

    const form = document.createElement('form');
    
    // Honeypot field (hidden)
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = '_honeypot';
    honeypot.style.display = 'none';
    form.appendChild(honeypot);

    // Name field
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'name';
    nameInput.placeholder = 'Your Name';
    nameInput.style.cssText = 'display: block; width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box;';
    form.appendChild(nameInput);

    // Email field
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.placeholder = 'Your Email';
    emailInput.required = true;
    emailInput.style.cssText = 'display: block; width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box;';
    form.appendChild(emailInput);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = config.button_text || 'Submit';
    submitBtn.style.cssText = 'background: #007bff; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; width: 100%;';
    form.appendChild(submitBtn);

    const message = document.createElement('p');
    message.style.display = 'none';
    message.style.fontSize = '14px';
    container.appendChild(message);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const payload = {
        widget_id: config.id,
        name: nameInput.value,
        email: emailInput.value,
        _honeypot: honeypot.value
      };

      fetch(`${apiBase}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.success) {
          form.style.display = 'none';
          message.textContent = 'Thanks! Your submission has been received.';
          message.style.color = 'green';
          message.style.display = 'block';
        } else {
          throw new Error(data.error || 'Submission failed');
        }
      })
      .catch(err => {
        submitBtn.disabled = false;
        submitBtn.textContent = config.button_text || 'Submit';
        message.textContent = err.message;
        message.style.color = 'red';
        message.style.display = 'block';
      });
    });

    container.appendChild(form);
    scriptTag.parentNode.insertBefore(container, scriptTag.nextSibling);
  }
})();
