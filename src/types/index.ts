export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  image_url: string;
  image_urls?: string[] | null;
  category: string;
  stock: number;
  product_type: "material" | "service";
  sold_count?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  cta_label?: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  shipping_fee: number;
  status: "pending" | "paid" | "shipped" | "delivered";
  created_at: string;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_region?: string | null;
  shipping_notes?: string | null;
  shipping_email?: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface ShippingFee {
  region: string;
  fee: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface RecentWorkItem {
  id: string;
  title: string;
  tag: string;
  image_url: string;
  created_at: string;
}

export interface Capability {
  id: string;
  name: string;
  image_url: string;
  rating: string;
  rating_label: string;
  description: string;
  created_at: string;
}

export interface HeroContent {
  id: number;
  image_url: string;
  headline: string;
  subtext: string;
  cta_label: string;
  cta_href: string;
  updated_at: string;
}
