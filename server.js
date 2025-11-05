import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Party Time Backend is running');
})

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { guests, date, start, end, packageType, total } = req.body;

    const session = await Stripe.Checkout.SessionsResource.create({
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
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server is running...'));
