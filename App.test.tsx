import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AppointmentManagement from '../pages/AppointmentManagement';
import AppointmentCalendarView from '../pages/AppointmentCalendarView';

// اختبار صفحة تسجيل الدخول
describe('Login Page', () => {
  test('يجب أن تعرض نموذج تسجيل الدخول', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('البريد الإلكتروني')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('كلمة المرور')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /تسجيل الدخول/i })).toBeInTheDocument();
  });

  test('يجب أن تظهر رسالة خطأ عند إدخال بيانات غير صحيحة', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText('البريد الإلكتروني'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('كلمة المرور'), {
      target: { value: 'wrongpassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/بيانات الاعتماد غير صحيحة/i)).toBeInTheDocument();
    });
  });
});

// اختبار لوحة التحكم
describe('Dashboard', () => {
  test('يجب أن تعرض إحصائيات المواعيد', () => {
    // تجاوز AuthContext للاختبار
    const mockAuthContext = {
      user: { id: 'test-doctor-id', name: 'د. أحمد' },
      loading: false,
    };
    
    jest.mock('../context/AuthContext', () => ({
      useAuth: () => mockAuthContext,
    }));
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/لوحة التحكم/i)).toBeInTheDocument();
    expect(screen.getByText(/إجمالي المواعيد/i)).toBeInTheDocument();
    expect(screen.getByText(/المواعيد المكتملة/i)).toBeInTheDocument();
    expect(screen.getByText(/إجمالي المرضى/i)).toBeInTheDocument();
  });
});

// اختبار إدارة المواعيد
describe('Appointment Management', () => {
  test('يجب أن تعرض قائمة المواعيد وزر إضافة موعد جديد', () => {
    // تجاوز AuthContext للاختبار
    const mockAuthContext = {
      user: { id: 'test-doctor-id', name: 'د. أحمد' },
      loading: false,
    };
    
    jest.mock('../context/AuthContext', () => ({
      useAuth: () => mockAuthContext,
    }));
    
    render(
      <BrowserRouter>
        <AppointmentManagement />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/إدارة المواعيد/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /إضافة موعد جديد/i })).toBeInTheDocument();
  });
});

// اختبار عرض التقويم
describe('Calendar View', () => {
  test('يجب أن تعرض التقويم وخيارات التصفية', () => {
    // تجاوز AuthContext للاختبار
    const mockAuthContext = {
      user: { id: 'test-doctor-id', name: 'د. أحمد' },
      loading: false,
    };
    
    jest.mock('../context/AuthContext', () => ({
      useAuth: () => mockAuthContext,
    }));
    
    render(
      <BrowserRouter>
        <AppointmentCalendarView />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/التقويم/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /يوم/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /أسبوع/i })).toBeInTheDocument();
  });
});
