/**
 * @jest-environment node
 */

import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const testEmail = 'test@example.com';
const testPassword = 'Test123!';
const testName = 'Test User';

describe('Auth Integration Tests', () => {
  let adminClient: ReturnType<typeof createClient>;

  beforeAll(() => {
    // Create admin client for test cleanup
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  beforeEach(async () => {
    // Clean up test user before each test
    const { data: users } = await adminClient.auth.admin.listUsers();
    const testUser = users?.users.find(user => user.email === testEmail);
    if (testUser) {
      await adminClient.auth.admin.deleteUser(testUser.id);
    }
  });

  describe('Sign Up Flow', () => {
    it('should create a new user successfully', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: testName,
            role: 'SELLER',
          },
        },
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testEmail);
      expect(data.user?.user_metadata.name).toBe(testName);
      expect(data.user?.user_metadata.role).toBe('SELLER');
    });

    it('should prevent duplicate email registration', async () => {
      // First registration
      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      // Attempt duplicate registration
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('already registered');
      expect(data.user).toBeNull();
    });

    it('should validate password requirements', async () => {
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'weak',
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('password');
    });
  });

  describe('Sign In Flow', () => {
    beforeEach(async () => {
      // Create a test user for sign in tests
      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
    });

    it('should sign in with correct credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.user?.email).toBe(testEmail);
    });

    it('should reject invalid credentials', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'wrongpassword',
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Invalid');
    });

    it('should handle non-existent user', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: testPassword,
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Invalid');
    });
  });

  describe('Session Management', () => {
    it('should maintain session after sign in', async () => {
      // Sign in
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      // Check session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      expect(error).toBeNull();
      expect(session).toBeDefined();
      expect(session?.user.email).toBe(testEmail);
    });

    it('should clear session after sign out', async () => {
      // Sign in first
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      // Sign out
      await supabase.auth.signOut();

      // Check session is cleared
      const { data: { session }, error } = await supabase.auth.getSession();
      
      expect(error).toBeNull();
      expect(session).toBeNull();
    });
  });
});
