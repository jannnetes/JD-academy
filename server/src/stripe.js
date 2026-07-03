import Stripe from "stripe";

// Payments stay disabled until STRIPE_SECRET_KEY is set (same pattern as
// Mux/Daily/R2 elsewhere in this project) — routes check for `stripe` and
// return 503 instead of crashing the server.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
