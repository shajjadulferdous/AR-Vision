import React, { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><div className="max-w-3xl mx-auto px-4 py-8">Loading Checkout…</div></div>}>
      <CheckoutClient />
    </Suspense>
  );
}