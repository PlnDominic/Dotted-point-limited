-- ============================================
-- Dotted Point — Construction & Home Improvement
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to re-run: every statement is idempotent.
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'hardware',
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL
);

-- Admins allowlist — who can manage products via the /admin dashboard.
-- Add more admins later with:
--   INSERT INTO admins (email) VALUES ('someone@example.com');
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY
);

INSERT INTO admins (email) VALUES
  ('dominickudom1738@gmail.com'),
  ('dottedpointl@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Helper: is the current request's JWT an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'
  );
$$;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admin users can insert products" ON products;
DROP POLICY IF EXISTS "Admin users can update products" ON products;
DROP POLICY IF EXISTS "Admin users can delete products" ON products;

-- Products: anyone can read; only allowlisted admins can write.
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Admin users can insert products"
  ON products FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin users can update products"
  ON products FOR UPDATE USING (is_admin());

CREATE POLICY "Admin users can delete products"
  ON products FOR DELETE USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can add to their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete from their own cart" ON cart_items;

-- Cart items: users can only see/edit their own
CREATE POLICY "Users can view their own cart"
  ON cart_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart"
  ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON cart_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
  ON cart_items FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Orders: users can only see their own; admins can see/manage all
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;

-- Order items: users can view/create via their orders; admins can view all
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins list is readable by admins" ON admins;

-- Admins table: only admins can read the allowlist (nobody needs to write
-- to it from the app — manage it via the SQL editor).
CREATE POLICY "Admins list is readable by admins"
  ON admins FOR SELECT USING (is_admin());

-- ============================================
-- Storage — product images
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Product images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND is_admin());

-- ============================================
-- Products: homepage material/service fields
-- ============================================
-- The homepage's "Amazing offer" (materials) and "Our Services &
-- Supplies" (services) sections are driven by this same products
-- table, distinguished by product_type. Adding/editing/deleting a
-- product in /admin now shows up on the homepage AND /products.

ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_count TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'material';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cta_label TEXT DEFAULT 'View Service';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_product_type_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_product_type_check
      CHECK (product_type IN ('material', 'service'));
  END IF;
END $$;

-- ============================================
-- Recent Work — homepage portfolio section
-- ============================================

CREATE TABLE IF NOT EXISTS recent_work (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE recent_work ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recent work is viewable by everyone" ON recent_work;
DROP POLICY IF EXISTS "Admins can insert recent work" ON recent_work;
DROP POLICY IF EXISTS "Admins can update recent work" ON recent_work;
DROP POLICY IF EXISTS "Admins can delete recent work" ON recent_work;

CREATE POLICY "Recent work is viewable by everyone"
  ON recent_work FOR SELECT USING (true);
CREATE POLICY "Admins can insert recent work"
  ON recent_work FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update recent work"
  ON recent_work FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete recent work"
  ON recent_work FOR DELETE USING (is_admin());

-- ============================================
-- Capabilities — homepage "What We Do Best" section
-- ============================================

CREATE TABLE IF NOT EXISTS capabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  rating TEXT DEFAULT '',
  rating_label TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Capabilities are viewable by everyone" ON capabilities;
DROP POLICY IF EXISTS "Admins can insert capabilities" ON capabilities;
DROP POLICY IF EXISTS "Admins can update capabilities" ON capabilities;
DROP POLICY IF EXISTS "Admins can delete capabilities" ON capabilities;

CREATE POLICY "Capabilities are viewable by everyone"
  ON capabilities FOR SELECT USING (true);
CREATE POLICY "Admins can insert capabilities"
  ON capabilities FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update capabilities"
  ON capabilities FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete capabilities"
  ON capabilities FOR DELETE USING (is_admin());

-- ============================================
-- Hero content — homepage hero banner (single row, id always 1)
-- ============================================

CREATE TABLE IF NOT EXISTS hero_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  image_url TEXT DEFAULT '',
  headline TEXT DEFAULT '',
  subtext TEXT DEFAULT '',
  cta_label TEXT DEFAULT 'Shop Now',
  cta_href TEXT DEFAULT '/products',
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT hero_content_singleton CHECK (id = 1)
);

ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hero content is viewable by everyone" ON hero_content;
DROP POLICY IF EXISTS "Admins can insert hero content" ON hero_content;
DROP POLICY IF EXISTS "Admins can update hero content" ON hero_content;

CREATE POLICY "Hero content is viewable by everyone"
  ON hero_content FOR SELECT USING (true);
CREATE POLICY "Admins can insert hero content"
  ON hero_content FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update hero content"
  ON hero_content FOR UPDATE USING (is_admin());

-- ============================================
-- Seed data — the site's real current content
-- (each block only runs once, guarded by its own existence check)
-- ============================================

INSERT INTO products (name, description, price, original_price, image_url, category, stock, product_type, sold_count, rating, reviews_count)
SELECT * FROM (VALUES
  ('Modified Blocks', 'Modified concrete blocks for walls and fencing, priced per block.', 25.00, 25.00, '/images/materials/concrete-blocks.jpg', 'concrete-blocks', 500, 'material', '15K+', 4.5, 2034),
  ('Roofing Sheets', 'Aluminium & corrugated roofing sheets, nails and fittings.', 145.00, 210.00, '/images/materials/roofing-sheets.jpg', 'roofing-sheets', 200, 'material', '6.4K+', 4.4, 762),
  ('Floor Tiles', 'Ceramic & porcelain floor tiles, adhesive and grout.', 108.49, 193.99, '/images/materials/floor-tiles.png', 'floor-tiles', 300, 'material', '15K+', 4.6, 1173),
  ('Plumbing Pipes & Fittings', 'PVC pipes, elbows, tees and fittings for water & drainage.', 24.99, 39.99, '/images/materials/plumbing-pipes.jpg', 'plumbing-pipes', 400, 'material', '12K+', 4.5, 1301),
  ('Electrical Cables', 'Wiring cables, conduit and electrical accessories.', 54.78, 98.51, '/images/materials/electrical-cables.jpg', 'electrical-cables', 300, 'material', '15K+', 4.5, 887),
  ('Kitchen Sinks', 'Stainless steel & granite kitchen sinks and taps for sale.', 326.71, 596.80, '/images/services/kitchen-sinks.jpg', 'kitchen-sinks', 80, 'material', '7K+', 4.7, 815),
  ('Bathroom Fittings', 'WC, baths, wash basins and taps for sale.', 435.39, 796.61, '/images/services/bathroom-fittings.jpg', 'bathroom-fittings', 60, 'material', '3.7K+', 4.6, 166),
  ('Water Tanks', 'Polytanks and water storage tanks for homes & sites.', 39.32, 71.02, '/images/materials/water-tanks.jpg', 'water-tanks', 150, 'material', '19K+', 4.1, 769),
  ('Switches & Sockets', 'Wall switches, sockets and electrical accessories.', 18.99, 32.99, '/images/materials/switches-sockets.jpg', 'switches-sockets', 500, 'material', '10K+', 4.4, 640)
) AS seed(name, description, price, original_price, image_url, category, stock, product_type, sold_count, rating, reviews_count)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_type = 'material');

INSERT INTO products (name, description, price, image_url, category, stock, product_type, cta_label)
SELECT * FROM (VALUES
  ('Automated Gates', 'Motorized swing & sliding gates with remote access control.', 0, '/images/services/automated-gates.jpg', 'automated-gates', 0, 'service', 'View Service'),
  ('Garage Roller Shutters', 'Durable roller shutters for garages, shops and warehouses.', 0, '/images/services/roller-shutters.jpg', 'roller-shutters', 0, 'service', 'View Service'),
  ('Iron Mongering', 'Custom wrought iron gates, rails, grilles and fabrication.', 0, '/images/services/iron-mongering.jpg', 'iron-mongering', 0, 'service', 'View Service'),
  ('Plasterboard Ceiling', 'Suspended and plasterboard ceilings with clean, modern finishes.', 0, '/images/services/plasterboard-ceiling.jpg', 'plasterboard-ceiling', 0, 'service', 'View Service'),
  ('Painting & Decoration', 'Interior and exterior painting, finishing and decoration.', 0, '/images/services/painting-decoration.jpg', 'painting-decoration', 0, 'service', 'View Service'),
  ('Kitchen Cabinets', 'Bespoke fitted kitchen cabinets built to your space.', 0, '/images/services/kitchen-cabinets.jpg', 'kitchen-cabinets', 0, 'service', 'View Service')
) AS seed(name, description, price, image_url, category, stock, product_type, cta_label)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_type = 'service');

INSERT INTO recent_work (title, tag, image_url)
SELECT * FROM (VALUES
  ('Automated Gate Installation', 'Residential', '/images/services/automated-gates.jpg'),
  ('Roller Shutter Fit-Out', 'Commercial', '/images/services/roller-shutters.jpg'),
  ('Ornamental Iron Gate', 'Fabrication', '/images/services/iron-mongering.jpg'),
  ('Plasterboard Ceiling', 'Renovation', '/images/services/plasterboard-ceiling.jpg'),
  ('Full Interior Repaint', 'Residential', '/images/services/painting-decoration.jpg'),
  ('Fitted Kitchen Cabinets', 'Interior', '/images/services/kitchen-cabinets.jpg')
) AS seed(title, tag, image_url)
WHERE NOT EXISTS (SELECT 1 FROM recent_work);

INSERT INTO capabilities (name, image_url, rating, rating_label, description)
SELECT * FROM (VALUES
  ('Building & Fabrication', '/images/services/fabrication.jpg', '500+', 'projects built', 'From structural builds to custom metal fabrication, executed to spec and built to last.'),
  ('Interior Finishing & Consulting', '/images/services/kitchen-cabinets.jpg', '10+', 'years experience', 'Full interior fit-outs, building finishing and expert project consulting from start to handover.'),
  ('Gate & Shutter Automation', '/images/services/automated-gates.jpg', '24/7', 'site support', 'Automated gates, roller shutters and access control systems installed, wired and serviced.')
) AS seed(name, image_url, rating, rating_label, description)
WHERE NOT EXISTS (SELECT 1 FROM capabilities);

INSERT INTO hero_content (id, image_url, headline, subtext, cta_label, cta_href)
VALUES (1, '/images/services/hero-main.png', 'Building & Fabrication', 'Gates, roofing sheets, kitchen cabinets & every material to build your home', 'Shop Now', '/products')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Shipping details on orders
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_region TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_notes TEXT;
-- The customer's contact email wasn't captured on the order itself
-- (only used for the magic-link sign-in), so the admin had no way to
-- see it without querying auth.users directly. Store it here too.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email TEXT;

-- ============================================
-- Multiple images per product
-- ============================================
-- image_url stays the cover/thumbnail (first image); image_urls holds
-- the full gallery, including that same cover image as its first entry.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- ============================================
-- Stock decrement on order placement
-- ============================================
-- Customers aren't admins, so they can't UPDATE products directly (see
-- the "Admin users can update products" policy above). This function
-- is SECURITY DEFINER so it can adjust stock on their behalf while
-- doing nothing else — it only ever subtracts, and clamps at 0 so
-- concurrent orders can't drive stock negative.
CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(stock - p_quantity, 0)
  WHERE id = p_product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) TO authenticated;

-- ============================================
-- Wishlist
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can add to their own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON wishlist_items;

CREATE POLICY "Users can view their own wishlist"
  ON wishlist_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
  ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist"
  ON wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Product reviews
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  reviewer_name TEXT NOT NULL DEFAULT 'Customer',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Signed-in users can leave their own review" ON reviews;
DROP POLICY IF EXISTS "Users can update their own review" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own review, admins any" ON reviews;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Signed-in users can leave their own review"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review, admins any"
  ON reviews FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- Delivery fee by region
-- ============================================
-- Flat rate: cheaper within Greater Accra (where Dotted Point is based),
-- flat higher rate everywhere else. This is the source of truth for
-- pricing — place_order() calls it server-side, so the fee can't be
-- forged from the browser console. src/lib/shipping.ts mirrors this
-- schedule client-side purely so checkout can show the fee before the
-- order is placed; keep the two in sync if the schedule ever changes.
CREATE OR REPLACE FUNCTION shipping_fee_for_region(p_region TEXT)
RETURNS DECIMAL(10,2)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE WHEN p_region = 'Greater Accra' THEN 30.00 ELSE 80.00 END;
$$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0;

-- ============================================
-- Security fix: server-computed order pricing + stock
-- ============================================
-- Previously the client inserted orders/order_items directly, supplying
-- its own `total` and `price` values, and called
-- decrement_product_stock() itself with no check that it corresponded
-- to a real purchase. Either could be forged from the browser console.
--
-- place_order() replaces both: it takes only product_id/quantity pairs,
-- prices everything from the live `products` table (client input for
-- price/total is never trusted), and creates the order, its line items,
-- and the stock decrement together, atomically, as the authenticated
-- caller (auth.uid()) — nobody can place an order "as" someone else.
CREATE OR REPLACE FUNCTION place_order(
  p_items JSONB, -- [{ "product_id": "...", "quantity": 2 }, ...]
  p_shipping_email TEXT,
  p_shipping_name TEXT,
  p_shipping_phone TEXT,
  p_shipping_address TEXT,
  p_shipping_city TEXT,
  p_shipping_region TEXT,
  p_shipping_notes TEXT
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_price DECIMAL(10,2);
  v_total DECIMAL(10,2) := 0;
  v_shipping_fee DECIMAL(10,2);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items to order';
  END IF;

  -- Pass 1: validate + total from live prices.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;

    IF v_quantity IS NULL OR v_quantity < 1 THEN
      RAISE EXCEPTION 'Invalid quantity for product %', v_product_id;
    END IF;

    SELECT price INTO v_price FROM products WHERE id = v_product_id;
    IF v_price IS NULL THEN
      RAISE EXCEPTION 'Unknown product %', v_product_id;
    END IF;

    v_total := v_total + (v_price * v_quantity);
  END LOOP;

  v_shipping_fee := shipping_fee_for_region(p_shipping_region);
  v_total := v_total + v_shipping_fee;

  INSERT INTO orders (
    user_id, total, shipping_fee, status,
    shipping_email, shipping_name, shipping_phone,
    shipping_address, shipping_city, shipping_region, shipping_notes
  )
  VALUES (
    auth.uid(), v_total, v_shipping_fee, 'pending',
    p_shipping_email, p_shipping_name, p_shipping_phone,
    p_shipping_address, p_shipping_city, p_shipping_region, p_shipping_notes
  )
  RETURNING * INTO v_order;

  -- Pass 2: line items + stock, priced from the same live lookup.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;

    SELECT price INTO v_price FROM products WHERE id = v_product_id;

    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (v_order.id, v_product_id, v_quantity, v_price);

    UPDATE products
    SET stock = GREATEST(stock - v_quantity, 0)
    WHERE id = v_product_id;
  END LOOP;

  RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION place_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- The client no longer calls this directly (place_order() does the
-- decrement itself, in the same transaction as the order). Revoke the
-- broad grant so a signed-in user can no longer call it standalone to
-- zero out arbitrary products' stock.
REVOKE EXECUTE ON FUNCTION decrement_product_stock(UUID, INTEGER) FROM authenticated;

-- Force all order creation through place_order() (which validates
-- pricing) instead of a direct client insert with self-reported
-- total/price.
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;

-- ============================================
-- Newsletter signups (footer form)
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can remove subscribers" ON newsletter_subscribers;

-- Public signup form: anyone (including anonymous visitors) can insert
-- their own email, but nobody can read the list back except admins —
-- there's no user_id to scope a "your own row" SELECT policy to here,
-- and this is marketing data, not something a visitor should be able
-- to enumerate.
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON newsletter_subscribers FOR SELECT USING (is_admin());

CREATE POLICY "Admins can remove subscribers"
  ON newsletter_subscribers FOR DELETE USING (is_admin());
