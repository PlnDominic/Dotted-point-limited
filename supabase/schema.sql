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
-- Sample Products — Construction & Home Improvement
-- (skipped automatically if products already exist)
-- ============================================

INSERT INTO products (name, description, price, image_url, category, stock)
SELECT * FROM (VALUES
  ('DeWalt 20V MAX Cordless Drill', 'Brushless motor, 3-speed transmission, 650 in-lbs torque. Includes 2 batteries and charger.', 179.99, '', 'power-tools', 45),
  ('Makita 7-1/4" Circular Saw', '15 AMP motor, 5,800 RPM, magnesium shoe. Lightweight at 10.6 lbs for all-day use.', 149.00, '', 'power-tools', 32),
  ('3M Hard Hat H-700 Series', 'Ratchet adjustment, unvented shell. Meets ANSI Z89.1-2014 Type I, Class E standards.', 24.99, '', 'safety', 120),
  ('Milwaukee 25 ft Tape Measure', 'Nylon bond blade, 2-point pulse magnets, 2X reach. Double-sided markings.', 29.97, '', 'hardware', 85),
  ('SharkBite 1/2 in. Push-to-Connect Coupling', 'Brass construction, fits copper/CPVC/PEX. No soldering, crimping, or gluing required.', 8.98, '', 'plumbing-electrical', 300),
  ('Leviton 15A Decora Outlet (10-Pack)', 'Tamper-resistant, self-grounding. UL Listed, meets NEC requirements.', 18.47, '', 'plumbing-electrical', 150),
  ('Klein Tools 11-in-1 Multi-Bit Screwdriver', 'Industrial-strength handles, cushion-grip. Includes Phillips, flat, nut drivers, and more.', 19.97, '', 'hardware', 95),
  ('Gorilla Wood Glue 16 oz.', 'Waterproof formula, 80 PSI strength. Sands and stains easily. 20-min clamp time.', 9.48, '', 'hardware', 175),
  ('DEWALT Safety Glasses, Clear Lens', 'Anti-fog, scratch-resistant coating. Lightweight with rubber-tipped temples.', 7.98, '', 'safety', 250),
  ('Oatey 4 in. Floor Drain with Trap', 'ABS construction, 1/2 in. thread connection. Includes removable sediment bucket.', 14.29, '', 'plumbing-electrical', 60),
  ('Modified Concrete Block', 'Concrete block modified for construction, price 25 Cedis each', 25.00, '', 'building-materials', 100)
) AS seed(name, description, price, image_url, category, stock)
WHERE NOT EXISTS (SELECT 1 FROM products);
