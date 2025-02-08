-- Create content reports table
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type content_type NOT NULL,
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status DEFAULT 'PENDING'::report_status NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  reported_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create moderation events table
CREATE TABLE moderation_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action moderation_action NOT NULL,
  moderator_id UUID REFERENCES users(id) NOT NULL,
  report_id UUID REFERENCES content_reports(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create product views table
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  source TEXT
);

-- Create inventory logs table
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  note TEXT
);

-- Create user engagement table
CREATE TABLE user_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  total_logins INTEGER DEFAULT 0 NOT NULL,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0 NOT NULL,
  avg_order_value DECIMAL(10,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sales metrics table
CREATE TABLE sales_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  revenue DECIMAL(10,2) NOT NULL,
  order_count INTEGER NOT NULL,
  avg_order_value DECIMAL(10,2) NOT NULL,
  UNIQUE(seller_id, date)
);

-- Create indexes
CREATE INDEX idx_content_reports_type_content ON content_reports(type, content_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_user_id ON content_reports(user_id);
CREATE INDEX idx_moderation_events_moderator ON moderation_events(moderator_id);
CREATE INDEX idx_moderation_events_report ON moderation_events(report_id);
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_timestamp ON product_views(timestamp);
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_timestamp ON inventory_logs(timestamp);
CREATE INDEX idx_user_engagement_user ON user_engagement(user_id);
CREATE INDEX idx_sales_metrics_seller ON sales_metrics(seller_id);
CREATE INDEX idx_sales_metrics_date ON sales_metrics(date);

-- Enable Row Level Security (RLS)
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Moderators can view all reports" ON content_reports
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('ADMIN', 'MODERATOR')
  ));

CREATE POLICY "Users can create reports" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators can manage moderation events" ON moderation_events
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('ADMIN', 'MODERATOR')
  ));

CREATE POLICY "Sellers can view their product analytics" ON product_views
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM sellers WHERE id IN (
      SELECT seller_id FROM products WHERE id = product_id
    )
  ));

CREATE POLICY "Sellers can view their inventory logs" ON inventory_logs
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM sellers WHERE id IN (
      SELECT seller_id FROM products WHERE id = product_id
    )
  ));

CREATE POLICY "Users can view their own engagement" ON user_engagement
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view their sales metrics" ON sales_metrics
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM sellers WHERE id = seller_id
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_content_reports_updated_at
  BEFORE UPDATE ON content_reports
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_engagement_updated_at
  BEFORE UPDATE ON user_engagement
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create function to update user engagement on order
CREATE OR REPLACE FUNCTION update_user_engagement_on_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_engagement (user_id, total_orders, total_spent, avg_order_value)
  VALUES (
    NEW.user_id,
    1,
    NEW.total_amount,
    NEW.total_amount
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_orders = user_engagement.total_orders + 1,
    total_spent = user_engagement.total_spent + NEW.total_amount,
    avg_order_value = (user_engagement.total_spent + NEW.total_amount) / (user_engagement.total_orders + 1),
    updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_engagement_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE update_user_engagement_on_order();
