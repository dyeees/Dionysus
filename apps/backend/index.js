require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Catch JSON syntax errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON received:', err.message);
    return res.status(400).send({ error: 'Bad JSON format in request' });
  }
  next();
});

// Root health check route
app.get('/', (req, res) => {
  res.send('Dionysus Backend API is running!');
});

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
if (!XENDIT_SECRET_KEY) {
  console.warn("WARNING: XENDIT_SECRET_KEY is not set in environment variables!");
}
const XENDIT_API_URL = 'https://api.xendit.co';

// Mock in-memory database
const payments = {};

app.post('/api/payment/qr', async (req, res) => {
  try {
    const { reference_id, amount } = req.body;

    // Create a Xendit Invoice (universally supported in Test Mode)
    const response = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: reference_id,
        amount: Math.round(amount), // Ensure integer
        description: 'Dionysus Cinema Ticket',
        currency: 'PHP',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Xendit Error:', data);
      return res.status(response.status).json({ error: 'Failed to generate QR code', details: data });
    }

    payments[reference_id] = { status: 'PENDING', invoice_id: data.id };

    res.json({
      qr_id: data.id,
      qr_string: data.invoice_url, // Use the invoice checkout URL for the QR code
      status: data.status,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/payment/webhook', (req, res) => {
  // In a real app, you would verify the webhook signature here
  const { event, data } = req.body;
  console.log('Received Webhook:', req.body);

  let refId = null;

  // Handling different possible webhook structures for QR or Invoices
  if (data && data.qr_code && data.qr_code.reference_id) {
    refId = data.qr_code.reference_id;
  } else if (data && data.reference_id) {
    refId = data.reference_id;
  } else if (req.body.reference_id) {
    refId = req.body.reference_id;
  } else if (req.body.qr_code && req.body.qr_code.reference_id) {
    refId = req.body.qr_code.reference_id;
  } else if (req.body.external_id) {
    // Xendit Invoices use external_id at the root level
    refId = req.body.external_id;
  }

  if (refId && payments[refId]) {
    payments[refId].status = 'PAID';
    console.log(`Payment confirmed via webhook for reference: ${refId}`);
  }

  res.status(200).send('OK');
});

app.get('/api/payment/status/:id', async (req, res) => {
  const { id } = req.params;
  const payment = payments[id];

  if (!payment) return res.json({ status: 'NOT_FOUND' });
  if (payment.status === 'PAID') return res.json({ status: 'PAID' });

  // Actively poll Xendit since webhooks can't reach localhost without ngrok
  try {
    const response = await fetch(`${XENDIT_API_URL}/v2/invoices/${payment.invoice_id}`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')
      }
    });
    const data = await response.json();
    if (data.status === 'PAID' || data.status === 'SETTLED') {
      payment.status = 'PAID';
      console.log(`Payment confirmed via polling for reference: ${id}`);
    }
  } catch (error) {
    console.error('Polling error:', error);
  }

  res.json({ status: payment.status });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
