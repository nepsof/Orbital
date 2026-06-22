import api from './api';

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  // Register new user
  register: (userData: RegisterData) => 
    api.post<AuthResponse>('/api/auth/register', userData),

  // Login user
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/api/auth/login', credentials),

  // Get current user profile
  getProfile: () => 
    api.get<{ data: User }>('/api/auth/profile'),

  // Update user profile
  updateProfile: (updateData: Partial<User>) => 
    api.put<{ data: User }>('/api/auth/profile', updateData),

  // Change password
  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => 
    api.put('/api/auth/change-password', passwordData),

  // Logout user
  logout: () => 
    api.post('/api/auth/logout', {}),

  // Store token in localStorage
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;
    
    try {
      // Simple token validation (you might want to add more sophisticated validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  // Get user from token
  getUserFromToken: (): User | null => {
    const token = authService.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        fullName: '', // This would come from the profile endpoint
        email: payload.email,
        username: payload.username,
        createdAt: '',
        updatedAt: '',
        isActive: true
      };
    } catch {
      return null;
    }
  }
};

export default authService;
