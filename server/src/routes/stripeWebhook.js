import { stripe } from "../stripe.js";
import { grantCourseEnrollment, grantLiveBooking } from "../fulfillment.js";

// Mounted with express.raw() in index.js — Stripe signature verification
// needs the exact raw request body, not the JSON-parsed one.
export async function stripeWebhookHandler(req, res) {
  if (!stripe) return res.status(503).send("Stripe not configured");

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { type, courseId, studentId, liveSessionId } = session.metadata || {};
    try {
      if (type === "course" && courseId && studentId) {
        await grantCourseEnrollment(courseId, studentId);
      } else if (type === "live" && liveSessionId && studentId) {
        await grantLiveBooking(liveSessionId, studentId);
      }
    } catch (err) {
      console.error("Failed to fulfill Stripe checkout session:", err);
    }
  }

  res.json({ received: true });
}
