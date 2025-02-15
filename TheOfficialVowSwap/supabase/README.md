# Supabase Database Setup

This directory contains the SQL migrations for setting up the VowSwap database in Supabase.

## Migration Files

The migrations should be run in the following order:

1. `initial_schema.sql` - Creates the core tables (users, sellers, products, orders)
2. `wedding_services_schema.sql` - Creates tables for wedding services and help center
3. `moderation_analytics_schema.sql` - Creates tables for moderation and analytics

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Run each script separately
5. Verify that all tables were created successfully in the Database section

## Environment Variables

Make sure your `.env` file contains the following Supabase-related variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Structure

### Core Tables
- users
- sellers
- products
- orders
- order_items
- shipping_events

### Wedding Services Tables
- service_categories
- wedding_services
- service_bookings
- portfolio_items
- service_reviews

### Help Center Tables
- help_categories
- help_tags
- help_articles
- help_articles_tags

### Moderation & Analytics Tables
- content_reports
- moderation_events
- product_views
- inventory_logs
- user_engagement
- sales_metrics

## Security

- Row Level Security (RLS) is enabled on all tables
- Each table has appropriate policies for:
  - Public access (where needed)
  - User-specific access
  - Seller-specific access
  - Admin/moderator access

## Automatic Updates

The following features are automatically handled:

- `created_at` timestamps
- `updated_at` timestamps (via triggers)
- User engagement metrics (via triggers)
- UUID generation for IDs
