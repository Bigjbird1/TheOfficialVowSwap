# Supabase Integration Guide

This guide explains how to use Supabase in your Next.js application, covering environment configuration, client initialization, component integration, error handling, and deployment considerations.

## Environment Configuration

The application uses environment variables to securely store Supabase credentials. These are already configured in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Important Notes:
- The `NEXT_PUBLIC_` prefix makes these variables available on the client side
- Never commit the `.env` file to version control
- For production, set these variables in your hosting platform's environment settings

## Supabase Client Initialization

The Supabase client is initialized in `src/lib/supabase.ts`. Key features include:

- Type-safe client creation using generated types
- Automatic session handling
- Error handling
- Helper functions for common operations

### Usage in Server Components:

```typescript
import { supabase } from '@/lib/supabase'

export async function getData() {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
  
  if (error) throw error
  return data
}
```

### Usage in Client Components:

```typescript
'use client'
import { supabase } from '@/lib/supabase'

// Example of real-time subscription
const subscription = supabase
  .channel('table_changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'your_table' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

## Component Integration

See `src/app/components/examples/SupabaseExample.tsx` for a complete example of:
- Fetching data from Supabase
- Real-time subscriptions
- Error handling
- Loading states
- TypeScript integration

### Key Integration Patterns:

1. **Data Fetching:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value')
```

2. **Real-time Subscriptions:**
```typescript
const channel = supabase
  .channel('changes')
  .on('postgres_changes', { event: '*', schema: 'public' }, handler)
  .subscribe()
```

3. **Authentication:**
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
```

## Error Handling

The application implements several layers of error handling:

1. **Client-level Error Handling:**
   - Global error handler in supabase client configuration
   - Automatic retry logic for failed requests

2. **Component-level Error Handling:**
   - Try-catch blocks for async operations
   - Error state management
   - User-friendly error messages

Example:
```typescript
try {
  const { data, error } = await supabase.from('table').select('*')
  if (error) throw error
  // Handle success
} catch (err) {
  // Handle error
  console.error('Error:', err.message)
}
```

## Testing the Integration

1. **Verify Environment Setup:**
   - Check that environment variables are loaded
   - Confirm Supabase client initialization

2. **Test Basic Operations:**
   ```typescript
   // Test connection and basic query
   const { data, error } = await supabase
     .from('profiles')
     .select('*')
     .limit(1)
   ```

3. **Test Real-time Features:**
   - Set up a subscription
   - Make a change to the database
   - Verify that the change event is received

## Deployment Considerations

1. **Environment Variables:**
   - Set up environment variables in your hosting platform
   - Verify that variables are accessible in the deployed environment

2. **Security:**
   - Use Row Level Security (RLS) policies
   - Implement proper authentication flows
   - Use appropriate service roles

3. **Performance:**
   - Implement connection pooling for production
   - Consider edge functions for optimal performance
   - Use appropriate caching strategies

## Troubleshooting

Common issues and solutions:

1. **Connection Issues:**
   - Verify environment variables
   - Check network connectivity
   - Confirm project status in Supabase dashboard

2. **Authentication Issues:**
   - Verify JWT configuration
   - Check RLS policies
   - Confirm user roles and permissions

3. **Real-time Issues:**
   - Verify WebSocket connection
   - Check channel subscription status
   - Confirm database trigger configuration

## Best Practices

1. **Type Safety:**
   - Use generated types for database schema
   - Implement proper error typing
   - Maintain type definitions

2. **Security:**
   - Implement RLS policies
   - Use prepared statements
   - Validate user permissions

3. **Performance:**
   - Optimize queries
   - Implement proper caching
   - Use connection pooling

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Integration Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [TypeScript Support](https://supabase.com/docs/reference/typescript-support)
