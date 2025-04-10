import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Appointment, Patient } from '../types';
import { appointmentApi, patientApi } from '../services/api';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, addDays, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    totalPatients: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // جلب جميع المواعيد
      const allAppointments = await appointmentApi.getAll(user!.id);
      
      // جلب المرضى
      const patientsData = await patientApi.getAll(user!.id);
      setPatients(patientsData);
      
      // فلترة المواعيد اليوم
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      const todayAppts = allAppointments.filter(
        appointment => appointment.date === todayString
      );
      setTodayAppointments(todayAppts);
      
      // فلترة المواعيد القادمة (الأسبوع القادم)
      const nextWeek = addDays(today, 7);
      const upcomingAppts = allAppointments.filter(appointment => {
        const appointmentDate = parseISO(appointment.date);
        return (
          appointmentDate > today && 
          appointmentDate <= nextWeek && 
          appointment.status === 'scheduled'
        );
      });
      setUpcomingAppointments(upcomingAppts);
      
      // حساب الإحصائيات
      setStats({
        totalAppointments: allAppointments.length,
        completedAppointments: allAppointments.filter(a => a.status === 'completed').length,
        cancelledAppointments: allAppointments.filter(a => a.status === 'cancelled').length,
        noShowAppointments: allAppointments.filter(a => a.status === 'no-show').length,
        totalPatients: patientsData.length
      });
      
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
      console.error('خطأ في جلب البيانات:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // تنسيق التاريخ للعرض
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return 'اليوم';
    } else if (isTomorrow(date)) {
      return 'غداً';
    } else {
      return format(date, 'EEEE, d MMMM', { locale: ar });
    }
  };

  // ترجمة حالة الموعد
  const getStatusText = (status: Appointment['status']) => {
    const statusMap = {
      'scheduled': 'مجدول',
      'completed': 'مكتمل',
      'cancelled': 'ملغي',
      'no-show': 'لم يحضر'
    };
    return statusMap[status];
  };

  // تنسيق الوقت
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // الحصول على اسم المريض
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'غير معروف';
  };

  // حساب نسبة الإكمال
  const calculateCompletionRate = () => {
    const { totalAppointments, completedAppointments } = stats;
    if (totalAppointments === 0) return 0;
    return Math.round((completedAppointments / totalAppointments) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <div className="flex space-x-2 space-x-reverse">
          <Link
            to="/appointments"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            إدارة المواعيد
          </Link>
          <Link
            to="/calendar"
            className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            التقويم
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* إجمالي المواعيد */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">إجمالي المواعيد</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          {/* المواعيد المكتملة */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">المواعيد المكتملة</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedAppointments}</p>
              </div>
            </div>
          </div>

          {/* إجمالي المرضى */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">إجمالي المرضى</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          {/* معدل الإكمال */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">معدل الإكمال</p>
                <p className="text-2xl font-semibold text-gray-900">{calculateCompletionRate() }%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مواعيد اليوم */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-semibold text-gray-900">مواعيد اليوم</h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">جاري تحميل البيانات...</p>
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد مواعيد اليوم</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(appointment => (
                    <div key={appointment.id} className="border-r-4 border-indigo-500 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{getPatientName(appointment.patientId)}</h3>
                          <p className="text-sm text-gray-600">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{appointment.notes}</p>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* المواعيد القادمة */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-semibold text-gray-900">المواعيد القادمة</h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">جاري تحميل البيانات...</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد مواعيد قادمة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments
                  .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                  .map(appointment => (
                    <div key={appointment.id} className="border-r-4 border-blue-500 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{getPatientName(appointment.patientId)}</h3>
                          <p className="text-sm text-gray-600">{formatDate(appointment.date)}, {formatTime(appointment.startTime)}</p>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{appointment.notes}</p>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
