import { createClient } from '@supabase/supabase-js';
import { Doctor, Appointment, Patient } from '../types';

// يجب استبدال هذه القيم بقيم حقيقية من لوحة تحكم Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey) ;

// واجهات برمجة التطبيق للأطباء
export const doctorApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (doctorError) throw doctorError;
      
      return doctorData;
    }
    
    return null;
  },
  
  getProfile: async (doctorId: string) => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single();
    
    if (error) throw error;
    
    return data;
  },
  
  updateProfile: async (doctorId: string, updates: Partial<Doctor>) => {
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', doctorId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  }
};

// واجهات برمجة التطبيق للمواعيد
export const appointmentApi = {
  getAll: async (doctorId: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return data.map(appointment => ({
      id: appointment.id,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: appointment.date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.created_at
    }));
  },
  
  getByDate: async (doctorId: string, date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', formattedDate)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return data.map(appointment => ({
      id: appointment.id,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: appointment.date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.created_at
    }));
  },
  
  getByDateRange: async (doctorId: string, startDate: Date, endDate: Date) => {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return data.map(appointment => ({
      id: appointment.id,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: appointment.date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.created_at
    }));
  },
  
  create: async (appointment: Omit<Appointment, 'id'>) => {
    // تحويل أسماء الحقول من camelCase إلى snake_case
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointment.patientId,
        doctor_id: appointment.doctorId,
        date: appointment.date,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        status: appointment.status,
        notes: appointment.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      notes: data.notes,
      created_at: data.created_at
    };
  },
  
  update: async (appointmentId: string, updates: Partial<Appointment>) => {
    // تحويل أسماء الحقول من camelCase إلى snake_case
    const updateData: any = {};
    
    if (updates.patientId) updateData.patient_id = updates.patientId;
    if (updates.doctorId) updateData.doctor_id = updates.doctorId;
    if (updates.date) updateData.date = updates.date;
    if (updates.startTime) updateData.start_time = updates.startTime;
    if (updates.endTime) updateData.end_time = updates.endTime;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      notes: data.notes,
      created_at: data.created_at
    };
  },
  
  delete: async (appointmentId: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    return true;
  }
};

// واجهات برمجة التطبيق للمرضى
export const patientApi = {
  getAll: async (doctorId: string) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return data.map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.date_of_birth,
      gender: patient.gender,
      address: patient.address,
      medicalHistory: patient.medical_history,
      doctorId: patient.doctor_id,
      created_at: patient.created_at
    }));
  },
  
  getById: async (patientId: string) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      address: data.address,
      medicalHistory: data.medical_history,
      doctorId: data.doctor_id,
      created_at: data.created_at
    };
  },
  
  create: async (patient: Omit<Patient, 'id'>) => {
    // تحويل أسماء الحقول من camelCase إلى snake_case
    const { data, error } = await supabase
      .from('patients')
      .insert({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        medical_history: patient.medicalHistory,
        doctor_id: patient.doctorId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      address: data.address,
      medicalHistory: data.medical_history,
      doctorId: data.doctor_id,
      created_at: data.created_at
    };
  },
  
  update: async (patientId: string, updates: Partial<Patient>) => {
    // تحويل أسماء الحقول من camelCase إلى snake_case
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;
    if (updates.gender) updateData.gender = updates.gender;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.medicalHistory !== undefined) updateData.medical_history = updates.medicalHistory;
    
    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', patientId)
      .select()
      .single();
    
    if (error) throw error;
    
    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      address: data.address,
      medicalHistory: data.medical_history,
      doctorId: data.doctor_id,
      created_at: data.created_at
    };
  },
  
  delete: async (patientId: string) => {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);
    
    if (error) throw error;
    
    return true;
  }
};
