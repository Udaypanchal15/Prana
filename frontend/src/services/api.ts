const API_BASE = 'http://localhost:8000';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Patient {
  id: string;
  user_id: string;
  age: number;
  gender: string;
  chronic_conditions: string[];
  doctor_id: string | null;
  emergency_contacts: { name: string; phone: string; relation: string }[];
  name: string;
}

export interface HeartFailureVitals {
  id: string;
  patient_id: string;
  age: number;
  anaemia: number;
  creatinine_phosphokinase: number;
  diabetes: number;
  ejection_fraction: number;
  high_blood_pressure: number;
  platelets: number;
  serum_creatinine: number;
  serum_sodium: number;
  sex: number;
  smoking: number;
  time: number;
  timestamp: string;
}

export interface Prediction {
  patient_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  explanation: string[];
  created_at: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  type: 'warning' | 'emergency';
  message: string;
  sent_to: string[];
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    console.log(`API Request: ${API_BASE}${endpoint}`, options);
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        console.error('API Error:', error);
        throw new Error(error.detail || `Request failed (${response.status})`);
      }

      return response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      throw err;
    }
  }

  // Auth
  async register(name: string, email: string, phone: string, password: string, role: 'patient' | 'doctor'): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, role }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Patients
  async getPatient(patientId: string): Promise<Patient> {
    return this.request(`/patients/${patientId}`);
  }

  async updatePatient(patientId: string, data: Partial<Patient>): Promise<Patient> {
    return this.request(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addEmergencyContact(patientId: string, contact: { name: string; phone: string; relation: string }): Promise<Patient> {
    return this.request('/patients/emergency-contact', {
      method: 'POST',
      body: JSON.stringify({ ...contact, patient_id: patientId }),
    });
  }

  // Vitals
  async submitHeartFailureVitals(vitals: {
    age: number;
    anaemia: number;
    creatinine_phosphokinase: number;
    diabetes: number;
    ejection_fraction: number;
    high_blood_pressure: number;
    platelets: number;
    serum_creatinine: number;
    serum_sodium: number;
    sex: number;
    smoking: number;
    time: number;
  }): Promise<HeartFailureVitals> {
    return this.request('/vitals/heart-failure', {
      method: 'POST',
      body: JSON.stringify(vitals),
    });
  }

  async getHeartFailureVitals(limit: number = 10): Promise<HeartFailureVitals[]> {
    return this.request(`/vitals/heart-failure?limit=${limit}`);
  }

  // Predictions
  async getPredictionHistory(limit: number = 10): Promise<Prediction[]> {
    return this.request(`/predict/history?limit=${limit}`);
  }

  // Alerts
  async getAlerts(limit: number = 50): Promise<Alert[]> {
    return this.request(`/alerts?limit=${limit}`);
  }

  async getPatientAlerts(patientId: string): Promise<Alert[]> {
    return this.request(`/alerts/${patientId}`);
  }
}

export const api = new ApiService();
export type { User, Patient, HeartFailureVitals, Prediction, Alert };