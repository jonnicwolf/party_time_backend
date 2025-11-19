import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Party Time Backend is running');
})

app.post('/create-payment-intent', async (req, res) => {
  try {
    const {
       guests,
      bookingDate,
      venueName,
      price,
      phone,
      total,
      packageType,
      date,
      start,
      end,
    } = req.body;

    if (!guests || !bookingDate || !price || !venueName || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    };

    const session = await stripe.Checkout.SessionsResource.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${packageType} Package`,
              description: `Booking for ${guests} guests on ${date} from ${start} to ${end}`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        guests,
        date,
        start,
        end,
        packageType,
        total
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server is running...'));
