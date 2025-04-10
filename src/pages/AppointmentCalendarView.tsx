import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Appointment, Patient, CalendarViewType } from '../types';
import { appointmentApi, patientApi } from '../services/api';
import CalendarSidebar from '../components/CalendarSidebar';
import { format, parseISO, startOfWeek, endOfWeek, addDays, isWithinInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

const AppointmentCalendarView: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<CalendarViewType['type']>('day');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedDate, viewType]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // جلب جميع المواعيد
      const appointmentsData = await appointmentApi.getAll(user!.id);
      setAppointments(appointmentsData);
      
      // جلب المرضى
      const patientsData = await patientApi.getAll(user!.id);
      setPatients(patientsData);
      
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
      console.error('خطأ في جلب البيانات:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    if (viewType === 'day') {
      // فلترة المواعيد حسب اليوم المحدد
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const filtered = appointments.filter(
        appointment => appointment.date === dateString
      );
      setFilteredAppointments(filtered);
    } else if (viewType === 'week') {
      // فلترة المواعيد حسب الأسبوع المحدد
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      
      const filtered = appointments.filter(appointment => {
        const appointmentDate = parseISO(appointment.date);
        return isWithinInterval(appointmentDate, { start: weekStart, end: weekEnd });
      });
      
      setFilteredAppointments(filtered);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleViewTypeChange = (type: CalendarViewType['type']) => {
    setViewType(type);
  };

  // تنسيق التاريخ للعرض
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'EEEE, d MMMM yyyy', { locale: ar });
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

  // الحصول على اسم المريض
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'غير معروف';
  };

  // إنشاء عناوين الأيام للعرض الأسبوعي
  const renderWeekDayHeaders = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      days.push(
        <th key={i} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          {format(day, 'EEEE', { locale: ar })}
          <br />
          {format(day, 'd MMM', { locale: ar })}
        </th>
      );
    }
    
    return days;
  };

  // تنظيم المواعيد حسب اليوم للعرض الأسبوعي
  const getAppointmentsByDay = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const appointmentsByDay: { [key: string]: Appointment[] } = {};
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dateString = format(day, 'yyyy-MM-dd');
      appointmentsByDay[dateString] = filteredAppointments.filter(
        appointment => appointment.date === dateString
      );
    }
    
    return appointmentsByDay;
  };

  return (
    <div className="flex h-screen">
      {/* التقويم الجانبي */}
      <div className="w-1/4 bg-white border-l border-gray-200">
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
        />
      </div>
      
      {/* عرض المواعيد */}
      <div className="w-3/4 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {viewType === 'day' 
              ? `مواعيد يوم ${format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ar })}`
              : `مواعيد أسبوع ${format(selectedDate, 'd MMMM yyyy', { locale: ar })}`
            }
          </h1>
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => handleViewTypeChange('day')}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                viewType === 'day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-600 border border-indigo-600'
              }`}
            >
              يوم
            </button>
            <button
              onClick={() => handleViewTypeChange('week')}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                viewType === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-600 border border-indigo-600'
              }`}
            >
              أسبوع
            </button>
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
          <>
            {viewType === 'day' ? (
              // عرض اليوم
              <>
                {filteredAppointments.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">لا توجد مواعيد في هذا اليوم.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الوقت
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المريض
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ملاحظات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppointments
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map(appointment => (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{appointment.startTime} - {appointment.endTime}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{getPatientName(appointment.patientId)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  appointment.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {getStatusText(appointment.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 line-clamp-2">{appointment.notes || '-'}</div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              // عرض الأسبوع
              <>
                {filteredAppointments.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">لا توجد مواعيد في هذا الأسبوع.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {renderWeekDayHeaders()}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            {Object.entries(getAppointmentsByDay()).map(([dateString, dayAppointments]) => (
                              <td key={dateString} className="px-6 py-4 align-top border-r border-gray-200">
                                {dayAppointments.length === 0 ? (
                                  <div className="text-sm text-gray-500 text-center">لا توجد مواعيد</div>
                                ) : (
                                  <div className="space-y-3">
                                    {dayAppointments
                                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                      .map(appointment => (
                                        <div key={appointment.id} className={`p-3 rounded-md text-sm ${
                                          appointment.status === 'completed' ? 'bg-green-50 border-r-4 border-green-500' :
                                          appointment.status === 'cancelled' ? 'bg-red-50 border-r-4 border-red-500' :
                                          appointment.status === 'no-show' ? 'bg-yellow-50 border-r-4 border-yellow-500' :
                                          'bg-blue-50 border-r-4 border-blue-500'
                                        }`}>
                                          <div className="font-medium">{appointment.startTime}</div>
                                          <div>{getPatientName(appointment.patientId)}</div>
                                          <div className="text-xs text-gray-500">{getStatusText(appointment.status)}</div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCalendarView;
