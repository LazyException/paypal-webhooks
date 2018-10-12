const express = require('express');
const cors = require('cors');
const paypal = require('paypal-rest-sdk');

// load .env
require('dotenv').config();

console.log(process.env);

// express app
const app = express();
const PORT = process.env.PORT || 3090;

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.get('/', (req, res) => {
  res.send({});
});

// web hooks
app.post('/', async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.headers);
    paypal.configure({
      mode: process.env.PAYPAL_CLIENT_MODE,
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET,
    });
    const headers = {
      'paypal-auth-algo': req.header('paypal-auth-algo'),
      'paypal-cert-url': req.header('paypal-cert-url'),
      'paypal-transmission-id': req.header('paypal-transmission-id'),
      'paypal-transmission-sig': req.header('paypal-transmission-sig'),
      'paypal-transmission-time': req.header('paypal-transmission-time'),
    };
    paypal.notification.webhookEvent.verify(
      headers,
      JSON.stringify(req.body),
      process.env.PAYPAL_WEBHOOK_ID,
      (error, response) => {
        if (error) {
          console.log(error);
        } else {
          console.log(response);
          // Verification status must be SUCCESS
          if (response.verification_status === "SUCCESS") {
            console.log("It was a success.");
          } else {
            console.log("It was a failed verification");
          }
        }
      });
    console.log('200');
    res.sendStatus(200);
  } catch (e) {
    console.log('500: ' + e.message);
    res.sendStatus(500);
  }
});

// http server
app.listen(PORT, () => {
  console.log(`paypal webhooks app listening on port ${PORT}!`);
});