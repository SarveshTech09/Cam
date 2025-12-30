// API service for authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
}

export const authService = {
  async signUp(data: SignUpData): Promise<{ user?: UserData; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Sign up failed' };
      }

      return { user: result };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Network error occurred' };
    }
  },

  async signIn(data: SignInData): Promise<{ user?: UserData; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Sign in failed' };
      }

      return { user: result };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Network error occurred' };
    }
  },

  async getCurrentUser(): Promise<{ user?: UserData; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // In a real implementation, you would include the auth token
          // 'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Failed to get user profile' };
      }

      return { user: result };
    } catch (error) {
      console.error('Get user error:', error);
      return { error: 'Network error occurred' };
    }
  },

  async updateProfile(data: Partial<UserData>): Promise<{ user?: UserData; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // In a real implementation, you would include the auth token
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Failed to update profile' };
      }

      return { user: result };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'Network error occurred' };
    }
  },
};