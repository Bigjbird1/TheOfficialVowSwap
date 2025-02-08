-- Create service categories table
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create wedding services table
CREATE TABLE wedding_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  price_type price_type DEFAULT 'FIXED'::price_type NOT NULL,
  category_id UUID REFERENCES service_categories(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  images TEXT[],
  features TEXT[],
  availability JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  listing_fee DECIMAL(10,2),
  commission DECIMAL(5,2)
);

-- Create service bookings table
CREATE TABLE service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES wedding_services(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  status booking_status DEFAULT 'PENDING'::booking_status NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit DECIMAL(10,2),
  is_paid BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create portfolio items table
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create service reviews table
CREATE TABLE service_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES wedding_services(id) NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create help categories table
CREATE TABLE help_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create help tags table
CREATE TABLE help_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create help articles table
CREATE TABLE help_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  status article_status DEFAULT 'PUBLISHED'::article_status NOT NULL,
  category_id UUID REFERENCES help_categories(id) NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  helpful INTEGER DEFAULT 0 NOT NULL,
  not_helpful INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create help_articles_tags junction table
CREATE TABLE help_articles_tags (
  article_id UUID REFERENCES help_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES help_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create indexes
CREATE INDEX idx_wedding_services_seller_id ON wedding_services(seller_id);
CREATE INDEX idx_wedding_services_category_id ON wedding_services(category_id);
CREATE INDEX idx_service_bookings_service_id ON service_bookings(service_id);
CREATE INDEX idx_service_bookings_seller_id ON service_bookings(seller_id);
CREATE INDEX idx_service_bookings_user_id ON service_bookings(user_id);
CREATE INDEX idx_portfolio_items_seller_id ON portfolio_items(seller_id);
CREATE INDEX idx_service_reviews_service_id ON service_reviews(service_id);
CREATE INDEX idx_service_reviews_seller_id ON service_reviews(seller_id);
CREATE INDEX idx_help_articles_slug ON help_articles(slug);
CREATE INDEX idx_help_articles_category_id ON help_articles(category_id);
CREATE INDEX idx_help_articles_status ON help_articles(status);

-- Enable Row Level Security (RLS)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view service categories" ON service_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view wedding services" ON wedding_services
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage their own services" ON wedding_services
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM sellers WHERE id = seller_id
  ));

CREATE POLICY "Users can view their own bookings" ON service_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view bookings for their services" ON service_bookings
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM sellers WHERE id = seller_id
  ));

CREATE POLICY "Public can view portfolio items" ON portfolio_items
  FOR SELECT USING (true);

CREATE POLICY "Public can view service reviews" ON service_reviews
  FOR SELECT USING (true);

CREATE POLICY "Public can view help content" ON help_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view help tags" ON help_tags
  FOR SELECT USING (true);

CREATE POLICY "Public can view help articles" ON help_articles
  FOR SELECT USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_wedding_services_updated_at
  BEFORE UPDATE ON wedding_services
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at
  BEFORE UPDATE ON service_bookings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_service_reviews_updated_at
  BEFORE UPDATE ON service_reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_help_categories_updated_at
  BEFORE UPDATE ON help_categories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_help_tags_updated_at
  BEFORE UPDATE ON help_tags
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at
  BEFORE UPDATE ON help_articles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
