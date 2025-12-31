// API service for authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set token in localStorage
const setToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('authToken');
};

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

      // Store token in localStorage if provided by backend
      if (result.token) {
        setToken(result.token);
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

      // Store token in localStorage if provided by backend
      if (result.token) {
        setToken(result.token);
      }

      return { user: result };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Network error occurred' };
    }
  },

  async getCurrentUser(): Promise<{ user?: UserData; error?: string }> {
    try {
      const token = getToken();
      
      if (!token) {
        return { error: 'No authentication token found' };
      }
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include the auth token in the request
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // If token is invalid/expired, remove it
        if (response.status === 401) {
          removeToken();
        }
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
      const token = getToken();
      
      if (!token) {
        return { error: 'No authentication token found' };
      }
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Include the auth token in the request
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // If token is invalid/expired, remove it
        if (response.status === 401) {
          removeToken();
        }
        return { error: result.error || 'Failed to update profile' };
      }

      return { user: result };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'Network error occurred' };
    }
  },
  
  // Sign out function to remove token
  signOut: () => {
    removeToken();
  }
};