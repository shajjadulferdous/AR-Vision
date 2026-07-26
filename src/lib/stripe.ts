import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    // Do not throw here to keep dev server running; log a warning instead.
    console.warn('Missing STRIPE_SECRET_KEY environment variable. Stripe calls will fail.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
});
