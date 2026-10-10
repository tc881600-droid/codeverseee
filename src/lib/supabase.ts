import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hujbibawxjdcdywfmunt.supabase.co';
const supabaseAnonKey = 'sb_publishable_yA_kRdY5c6dncNQVYuHfYQ_ftNOFmk8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });
    return { data, error };
  },

  // Create or update profile in Supabase
  createProfile: async (userId: string, username: string, email: string) => {
    try {
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        console.error('Error checking profile:', checkError);
      }

      const profileData = {
        id: userId,
        username: username,
        email: email,
        display_name: username,
        title: 'New developer',
        bio: 'Just landed in the Verse.',
        hue: Math.floor(Math.random() * 360),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating profile:', error);
          return { data: null, error };
        }
        return { data, error: null };
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (error) {
          console.error('Error creating profile:', error);
          return { data: null, error };
        }
        return { data, error: null };
      }
    } catch (err) {
      console.error('Exception in createProfile:', err);
      return { data: null, error: err };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
