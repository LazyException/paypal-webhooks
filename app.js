const express = require('express');
const cors = require('cors');
const paypal = require('paypal-rest-sdk');

// load .env
require('dotenv').config();

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
    paypal.notification.webhookEvent.verify(
      req.headers,
      req.body,
      process.env.PAYPAL_WEBHOOK_ID,
      (error, response) => {
        if (error) {
          console.error(error);
          throw error;
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
  } catch (e) {
    console.error(e.message);
  }
  res.send(200);
});

// http server
app.listen(PORT, () => {
  console.log(`paypal webhooks app listening on port ${PORT}!`);
});