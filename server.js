const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function envValue(name) {
  return (process.env[name] || '').trim();
}

function loadEnvFiles() {
  const candidates = [
    path.join(__dirname, '.env'),
    '/etc/secrets/.env',
  ];

  dotenv.config({ path: path.join(__dirname, '.env') });

  if (!envValue('BREVO_API_KEY')) {
    for (const envPath of candidates) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });
      }
      if (envValue('BREVO_API_KEY')) {
        return envPath;
      }
    }
  }

  const secretKeyFile = '/etc/secrets/BREVO_API_KEY';
  if (!envValue('BREVO_API_KEY') && fs.existsSync(secretKeyFile)) {
    process.env.BREVO_API_KEY = fs.readFileSync(secretKeyFile, 'utf8').trim();
    return secretKeyFile;
  }

  return envValue('BREVO_API_KEY') ? 'process.env' : null;
}

const envSource = loadEnvFiles();

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const BREVO_API_KEY = envValue('BREVO_API_KEY') || null;
const NOTIFY_EMAIL = envValue('BREVO_NOTIFY_EMAIL') || 'manu@optimizemydata.com';
const SENDER_EMAIL = envValue('BREVO_SENDER_EMAIL') || NOTIFY_EMAIL;
const SENDER_NAME = envValue('BREVO_SENDER_NAME') || 'Optimize My Data Website';
const LIST_ID = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null;

app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    brevoConfigured: Boolean(BREVO_API_KEY),
    brevoSource: envSource || 'missing',
  });
});

app.get('/case-study', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study.html'));
});

app.get('/case-study/epc', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'epc.html'));
});

app.get('/case-study/epc/solar', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'epc', 'solar.html'));
});

app.get('/case-study/travel-tourism', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'travel-tourism.html'));
});

app.get('/case-study/travel-tourism/luxury-travel', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'travel-tourism', 'luxury-travel.html'));
});

app.get('/case-study/automobile', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'automobile.html'));
});

app.get('/case-study/automobile/car-dealer', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'automobile', 'car-dealer.html'));
});

app.get('/case-study/food-beverage', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'food-beverage.html'));
});

app.get('/case-study/food-beverage/multi-outlet-restaurant', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'food-beverage', 'multi-outlet-restaurant.html'));
});

app.get('/case-study/event-management', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'event-management.html'));
});

app.get('/case-study/event-management/multi-day-conference', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'event-management', 'multi-day-conference.html'));
});

app.get('/case-study/ecommerce', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'ecommerce.html'));
});

app.get('/case-study/ecommerce/multi-channel-retail', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'ecommerce', 'multi-channel-retail.html'));
});

app.get('/case-study/automotive-parts', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'automotive-parts.html'));
});

app.get('/case-study/automotive-parts/parts-distributor', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'automotive-parts', 'parts-distributor.html'));
});

app.get('/case-study/real-estate', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'real-estate.html'));
});

app.get('/case-study/real-estate/property-management', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'real-estate', 'property-management.html'));
});

app.get('/case-study/logistics', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'logistics.html'));
});

app.get('/case-study/logistics/multi-location-courier', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-study', 'logistics', 'multi-location-courier.html'));
});

app.get('/case-study.html', (req, res) => {
  res.redirect(301, '/case-study');
});

app.get('/consultation', (req, res) => {
  res.sendFile(path.join(__dirname, 'consultation.html'));
});

app.get('/zoho-erp', (req, res) => {
  res.sendFile(path.join(__dirname, 'zoho-erp.html'));
});

app.get('/payment', (req, res) => {
  res.redirect(301, '/consultation');
});

app.use(express.static(path.join(__dirname)));

async function brevoRequest(endpoint, body) {
  const response = await fetch(`https://api.brevo.com/v3${endpoint}`, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  return { ok: response.ok, status: response.status, data };
}

function normalizePhone(phone) {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || fullName,
    lastName: parts.slice(1).join(' '),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

app.post('/api/contact', async (req, res) => {
  if (!BREVO_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. API key is missing.',
    });
  }

  const { name, company, email, phone, message } = req.body || {};

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields: Name, Email, and Phone.',
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  const { firstName, lastName } = splitName(name);
  const safeCompany = company?.trim() || '';
  const safeMessage = message?.trim() || '';
  const normalizedPhone = normalizePhone(phone.trim());

  const contactPayload = {
    email: email.trim(),
    updateEnabled: true,
    attributes: {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      SMS: normalizedPhone,
    },
  };

  if (safeCompany) {
    contactPayload.attributes.COMPANY = safeCompany;
  }

  if (LIST_ID) {
    contactPayload.listIds = [LIST_ID];
  }

  try {
    let contactResult = await brevoRequest('/contacts', contactPayload);

    if (
      !contactResult.ok &&
      contactResult.status === 400 &&
      String(contactResult.data?.message || '').toLowerCase().match(/phone|sms/)
    ) {
      delete contactPayload.attributes.SMS;
      contactResult = await brevoRequest('/contacts', contactPayload);
    }

    if (!contactResult.ok && contactResult.status !== 400) {
      console.error('Brevo contact error:', contactResult.status, contactResult.data);
    }

    const emailPayload = {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: NOTIFY_EMAIL, name: 'Optimize My Data' }],
      replyTo: { email: email.trim(), name: name.trim() },
      subject: `New Website Enquiry from ${name.trim()}`,
      htmlContent: `
        <h2>New Contact Form Enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Company:</strong> ${escapeHtml(safeCompany || 'N/A')}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(safeMessage || 'N/A').replace(/\n/g, '<br>')}</p>
      `,
    };

    const emailResult = await brevoRequest('/smtp/email', emailPayload);

    if (!emailResult.ok) {
      console.error('Brevo email error:', emailResult.status, emailResult.data);
      if (contactResult.ok || contactResult.status === 400) {
        return res.json({
          success: true,
          message: 'Thank you! Your details have been received. Our team will contact you shortly.',
        });
      }
      return res.status(502).json({
        success: false,
        message: 'Unable to submit your enquiry right now. Please try again or email us directly.',
      });
    }

    return res.json({
      success: true,
      message: 'Thank you! Your enquiry has been submitted. We will contact you shortly.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact us at manu@optimizemydata.com.',
    });
  }
});

app.post('/api/consultation-booking', async (req, res) => {
  if (!BREVO_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. API key is missing.',
    });
  }

  const {
    name,
    company,
    email,
    phone,
    requirement,
    currentTools,
    preferredDate,
    preferredTime,
    paymentRef,
  } = req.body || {};

  if (!name || !company || !email || !phone || !requirement || !preferredDate || !preferredTime || !paymentRef) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields including payment reference.',
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  const { firstName, lastName } = splitName(name);
  const normalizedPhone = normalizePhone(phone.trim());

  const contactPayload = {
    email: email.trim(),
    updateEnabled: true,
    attributes: {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      SMS: normalizedPhone,
      COMPANY: company.trim(),
    },
  };

  if (LIST_ID) {
    contactPayload.listIds = [LIST_ID];
  }

  try {
    const contactResult = await brevoRequest('/contacts', contactPayload);

    const emailPayload = {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: NOTIFY_EMAIL, name: 'Optimize My Data' }],
      replyTo: { email: email.trim(), name: name.trim() },
      subject: `Paid Consultation Booking - ${name.trim()} (₹1,250 plus taxes)`,
      htmlContent: `
        <h2>New Paid Consultation Booking</h2>
        <p><strong>Fee:</strong> ₹1,250 plus taxes</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Business Requirement:</strong></p>
        <p>${escapeHtml(requirement).replace(/\n/g, '<br>')}</p>
        <p><strong>Current Tools:</strong> ${escapeHtml(currentTools || 'N/A')}</p>
        <p><strong>Preferred Date:</strong> ${escapeHtml(preferredDate)}</p>
        <p><strong>Preferred Time:</strong> ${escapeHtml(preferredTime)}</p>
        <p><strong>Payment Reference / UTR:</strong> ${escapeHtml(paymentRef)}</p>
      `,
    };

    const emailResult = await brevoRequest('/smtp/email', emailPayload);

    if (!emailResult.ok) {
      console.error('Brevo consultation email error:', emailResult.status, emailResult.data);
      return res.status(502).json({
        success: false,
        message: 'Unable to send your booking right now. Please try again or email manu@optimizemydata.com directly.',
      });
    }

    if (!contactResult.ok && contactResult.status !== 400) {
      console.error('Brevo consultation contact error:', contactResult.status, contactResult.data);
    } else if (
      !contactResult.ok &&
      contactResult.status === 400 &&
      contactResult.data?.message?.toLowerCase().includes('phone')
    ) {
      delete contactPayload.attributes.SMS;
      await brevoRequest('/contacts', contactPayload);
    }

    return res.json({
      success: true,
      message: 'Thank you! Your booking request has been received. We will verify payment and confirm your Zoho Meeting slot by email.',
    });
  } catch (error) {
    console.error('Consultation booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact us at manu@optimizemydata.com.',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Optimize My Data site running at http://localhost:${PORT}`);
  if (BREVO_API_KEY) {
    console.log(`Brevo email integration: configured (${envSource})`);
  } else {
    console.warn('WARNING: BREVO_API_KEY is not set. Contact and consultation forms will fail.');
  }
});
