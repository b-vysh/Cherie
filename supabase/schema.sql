-- =============================================
-- TABLE DEFINITIONS
-- =============================================

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category_id UUID REFERENCES public.categories(id),
    visible BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0 NOT NULL,
    variants TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create settings table (single-row config)
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number TEXT,
    instagram_url TEXT,
    shipping_text TEXT,
    free_shipping_threshold DECIMAL(10, 2),
    upi_id TEXT,
    payee_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_insta TEXT,
    customer_address TEXT NOT NULL,
    order_notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_utr TEXT,
    payment_proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT status_check CHECK (status IN ('Pending','Processing','Shipped','Completed','Cancelled'))
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
);


-- =============================================
-- INDEXES (reduce DB reads / improve performance)
-- =============================================

-- Products: most common public query is visible=true ordered by featured+created_at
CREATE INDEX idx_products_visible ON public.products (visible, featured DESC, created_at DESC);
-- Products: category filter
CREATE INDEX idx_products_category ON public.products (category_id);
-- Orders: status filter used in admin
CREATE INDEX idx_orders_status ON public.orders (status);
-- Orders: created_at sort
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);
-- Order items: join by order_id
CREATE INDEX idx_order_items_order ON public.order_items (order_id);

-- Prevent duplicate UTR submissions (spam protection)
CREATE UNIQUE INDEX idx_orders_utr ON public.orders (payment_utr)
    WHERE payment_utr IS NOT NULL;


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- --- CATEGORIES ---
-- Anyone can read categories (needed for the shop sidebar)
CREATE POLICY "Public can read categories"
    ON public.categories FOR SELECT
    USING (true);

-- Only authenticated admins can insert/update/delete categories
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- --- PRODUCTS ---
-- Anyone can read visible products (storefront)
CREATE POLICY "Public can read visible products"
    ON public.products FOR SELECT
    USING (visible = true);

-- Authenticated admins can read ALL products (including hidden)
CREATE POLICY "Admins can read all products"
    ON public.products FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated admins can insert/update/delete products
CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- --- SETTINGS ---
-- Public can read settings (needed for announcement bar, shipping, UPI at checkout)
-- Note: upi_id is used for the QR/payment flow. RLS on writes below is what matters most.
CREATE POLICY "Public can read settings"
    ON public.settings FOR SELECT
    USING (true);

-- Only authenticated admins can modify settings (most important - protects UPI ID)
CREATE POLICY "Admins can manage settings"
    ON public.settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- --- ORDERS ---
-- Public can INSERT new orders (checkout flow)
CREATE POLICY "Public can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Public CANNOT read, update, or delete orders (only admin can)
-- Authenticated admins can do everything
CREATE POLICY "Admins can manage orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- --- ORDER ITEMS ---
-- Public can INSERT order items (checkout flow, alongside order insert)
CREATE POLICY "Public can create order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- Only authenticated admins can read/update/delete order items
CREATE POLICY "Admins can manage order items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- =============================================
-- STORAGE BUCKET POLICIES
-- (Apply these in Supabase Dashboard → Storage → Policies)
-- =============================================

-- product-images bucket:
--   Public READ (images shown in storefront)
--   Only authenticated users can UPLOAD / DELETE

-- payment_proofs bucket:
--   Public INSERT (customers upload payment screenshots at checkout)
--   Only authenticated users can READ / DELETE (admin reviews proofs)
