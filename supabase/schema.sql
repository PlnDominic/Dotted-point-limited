-- ============================================
-- Dotted Point — Construction & Home Improvement
-- Run this in: Supabase Dashboard → SQL Editor
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

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read, authenticated users can manage
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

-- Admin users can manage products (check email domain or specific email)
CREATE POLICY "Admin users can insert products"
  ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.jwt()->>'email' LIKE '%@dottedpoint.gh');

CREATE POLICY "Admin users can update products"
  ON products FOR UPDATE USING (auth.role() = 'authenticated' AND auth.jwt()->>'email' LIKE '%@dottedpoint.gh%');

-- Cart items: users can only see/edit their own
CREATE POLICY "Users can view their own cart"
  ON cart_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart"
  ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON cart_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
  ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders: users can only see their own
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: users can view via their orders
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
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

-- ============================================
-- Sample Products — Construction & Home Improvement
-- ============================================

INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('DeWalt 20V MAX Cordless Drill', 'Brushless motor, 3-speed transmission, 650 in-lbs torque. Includes 2 batteries and charger.', 179.99, '', 'power-tools', 45),
('Makita 7-1/4" Circular Saw', '15 AMP motor, 5,800 RPM, magnesium shoe. Lightweight at 10.6 lbs for all-day use.', 149.00, '', 'power-tools', 32),
('2x4x8 Stud Lumber (Bundle of 10)', 'Kiln-dried SPF lumber, S-Graded. Ideal for framing, blocking, and general construction.', 42.50, '', 'building-materials', 200),
('Quikrete 80lb Concrete Mix', 'High-strength 4000 PSI. Just add water. For posts, slabs, and structural repairs.', 6.48, '', 'building-materials', 500),
('3M Hard Hat H-700 Series', 'Ratchet adjustment, unvented shell. Meets ANSI Z89.1-2014 Type I, Class E standards.', 24.99, '', 'safety', 120),
('Milwaukee 25 ft Tape Measure', 'Nylon bond blade, 2-point pulse magnets, 2X reach. Double-sided markings.', 29.97, '', 'hardware', 85),
('SharkBite 1/2 in. Push-to-Connect Coupling', 'Brass construction, fits copper/CPVC/PEX. No soldering, crimping, or gluing required.', 8.98, '', 'plumbing-electrical', 300),
('Leviton 15A Decora Outlet (10-Pack)', 'Tamper-resistant, self-grounding. UL Listed, meets NEC requirements.', 18.47, '', 'plumbing-electrical', 150),
('Klein Tools 11-in-1 Multi-Bit Screwdriver', 'Industrial-strength handles, cushion-grip. Includes Phillips, flat, nut drivers, and more.', 19.97, '', 'hardware', 95),
('Gorilla Wood Glue 16 oz.', 'Waterproof formula, 80 PSI strength. Sands and stains easily. 20-min clamp time.', 9.48, '', 'hardware', 175),
('DEWALT Safety Glasses, Clear Lens', 'Anti-fog, scratch-resistant coating. Lightweight with rubber-tipped temples.', 7.98, '', 'safety', 250),
('Oatey 4 in. Floor Drain with Trap', 'ABS construction, 1/2 in. thread connection. Includes removable sediment bucket.', 14.29, '', 'plumbing-electrical', 60);
