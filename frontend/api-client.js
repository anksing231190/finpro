/**
 * FinPro API Client
 * Handles all communication with the backend API
 */

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : 'https://finpro-seven-mauve.vercel.app/api';

class FinProAPI {
  constructor() {
    this.token = localStorage.getItem('finpro_token');
    this.user = JSON.parse(localStorage.getItem('finpro_user') || 'null');
  }

  // ============ Authentication ============

  async signup(email, password, fullName, customerType, phone) {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          customerType,
          phone
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      return data; // { userId, message, email, fullName }
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  async sendOtp(email) {
    try {
      const response = await fetch(`${API_BASE}/auth/sendOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send OTP');
      }

      return await response.json(); // { userId, message }
    } catch (error) {
      console.error('❌ SendOTP error:', error);
      throw error;
    }
  }

  async verifyOtp(userId, otp) {
    try {
      const response = await fetch(`${API_BASE}/auth/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'OTP verification failed');
      }

      const data = await response.json();

      // Store token and user info
      localStorage.setItem('finpro_token', data.token);
      localStorage.setItem('finpro_user', JSON.stringify(data.user));

      this.token = data.token;
      this.user = data.user;

      return data; // { token, user, message }
    } catch (error) {
      console.error('❌ VerifyOTP error:', error);
      throw error;
    }
  }

  async getProfile() {
    try {
      if (!this.token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to get profile');
      }

      const data = await response.json();
      this.user = data.user;
      return data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        });
      }
    } catch (error) {
      console.warn('Logout warning:', error);
    } finally {
      localStorage.removeItem('finpro_token');
      localStorage.removeItem('finpro_user');
      localStorage.removeItem('finpro_session');
      this.token = null;
      this.user = null;
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // ============ Assessments ============

  async saveAssessment(assessmentData) {
    try {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save assessment');
      }

      return await response.json(); // { assessmentId, message }
    } catch (error) {
      console.error('❌ Save assessment error:', error);
      throw error;
    }
  }

  async getAssessments() {
    try {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/assessments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get assessments');
      }

      return await response.json(); // { count, assessments }
    } catch (error) {
      console.error('❌ Get assessments error:', error);
      throw error;
    }
  }

  async getAssessment(assessmentId) {
    try {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Assessment not found');
      }

      return await response.json(); // { assessment }
    } catch (error) {
      console.error('❌ Get assessment error:', error);
      throw error;
    }
  }

  async updateAssessment(assessmentId, assessmentData) {
    try {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update assessment');
      }

      return await response.json(); // { assessmentId, message }
    } catch (error) {
      console.error('❌ Update assessment error:', error);
      throw error;
    }
  }

  async deleteAssessment(assessmentId) {
    try {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete assessment');
      }

      return await response.json(); // { message }
    } catch (error) {
      console.error('❌ Delete assessment error:', error);
      throw error;
    }
  }
}

// Create global API instance
const api = new FinProAPI();
window.finproAPI = api;

console.log('✅ FinPro API Client loaded');
console.log(`API Base: ${API_BASE}`);
