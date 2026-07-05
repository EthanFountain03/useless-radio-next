// Stripe Checkout for the merch store (replaces the old Bluehost checkout.php).
// STRIPE_SECRET_KEY is set in Vercel env vars — never committed.

const PRICES: Record<string, number> = {
  'FRESH': 35,
  'GOD IS ALIVE': 35,
  'SOBER 25': 35,
  'ANTI-SHIRT': 35,
  'GOT ANY WEED?': 35,
  'SOBER SELEBRITY': 35,
  '[USELESS RADIO]': 35,
  'CHIPPY BEAVER': 35,
  'WEBPAGE': 35,
  '2046': 35,
};

const SIZES = new Set(['S', 'M', 'L', 'XL', '2XL']);

interface CartItem {
  title?: unknown;
  size?: unknown;
  quantity?: unknown;
}

export async function POST(request: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return Response.json({ error: 'Store not configured', message: 'Checkout is temporarily unavailable.' }, { status: 500 });
  }

  let cart: CartItem[];
  try {
    const body = await request.json();
    cart = Array.isArray(body?.cart) ? body.cart : [];
  } catch {
    cart = [];
  }
  if (cart.length === 0 || cart.length > 50) {
    return Response.json({ error: 'Cart is empty', message: 'Cart is empty.' }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const fields = new URLSearchParams({
    'mode': 'payment',
    'payment_method_types[]': 'card',
    'success_url': `${origin}/store/?success=1`,
    'cancel_url': `${origin}/store/`,
    'shipping_address_collection[allowed_countries][]': 'US',
  });

  for (let i = 0; i < cart.length; i++) {
    const title = String(cart[i].title ?? '').trim();
    const size = String(cart[i].size ?? '').trim();
    const quantity = Math.floor(Number(cart[i].quantity));
    // Prices come from the server-side list, never from the client
    const price = PRICES[title];
    if (!price || !SIZES.has(size) || !Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return Response.json({ error: 'Invalid item', message: `Invalid cart item: ${title || 'unknown'}` }, { status: 400 });
    }
    fields.set(`line_items[${i}][price_data][currency]`, 'usd');
    fields.set(`line_items[${i}][price_data][unit_amount]`, String(price * 100));
    fields.set(`line_items[${i}][price_data][product_data][name]`, `${title} — Size ${size}`);
    fields.set(`line_items[${i}][quantity]`, String(quantity));
  }

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: fields.toString(),
  });
  const session = await resp.json();

  if (resp.ok && session?.url) {
    return Response.json({ url: session.url });
  }
  return Response.json(
    { error: 'Stripe error', message: session?.error?.message ?? 'Unknown error' },
    { status: 500 },
  );
}
