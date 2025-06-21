import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = 4242;

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          // Provide the exact Price ID of the product you want to sell
          // TODO: Replace with your own Price ID
          price: "price_1RcXdVJ7wj3rBCqVVH3Pqa0J",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin}?success=true`,
      cancel_url: `${req.headers.origin}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

app.get("/", (req, res) => {
  res.send("AIBud Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
