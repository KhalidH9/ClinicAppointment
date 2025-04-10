export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalHistory?: string;
  doctorId: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  created_at: string;
}

export interface AppointmentWithPatient extends Appointment {
  patient: Patient;
}

export interface CalendarViewType {
  type: 'day' | 'week';
}

export interface AuthState {
  user: Doctor | null;
  loading: boolean;
  error: string | null;
}
