import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Appointment, Patient } from '../types';
import { appointmentApi, patientApi } from '../services/api';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentEdit from '../components/AppointmentEdit';
import AppointmentDetails from '../components/AppointmentDetails';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

const AppointmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

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

  const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await appointmentApi.create(appointment);
      setAppointments([...appointments, newAppointment]);
      setShowAddForm(false);
    } catch (err) {
      console.error('خطأ في إضافة موعد:', err);
      setError('حدث خطأ أثناء إضافة الموعد. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const updatedAppointment = await appointmentApi.update(appointmentId, updates);
      setAppointments(appointments.map(a => a.id === appointmentId ? updatedAppointment : a));
      setIsEditing(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('خطأ في تحديث موعد:', err);
      setError('حدث خطأ أثناء تحديث الموعد. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentApi.delete(appointmentId);
      setAppointments(appointments.filter(a => a.id !== appointmentId));
      setIsViewingDetails(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('خطأ في حذف موعد:', err);
      setError('حدث خطأ أثناء حذف الموعد. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewingDetails(true);
    setIsEditing(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditing(true);
    setIsViewingDetails(false);
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setIsViewingDetails(false);
    setSelectedAppointment(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المواعيد</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          إضافة موعد جديد
        </button>
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
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">لا توجد مواعيد. قم بإضافة موعد جديد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المريض
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوقت
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments
                .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                .map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getPatientName(appointment.patientId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(appointment.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{appointment.startTime} - {appointment.endTime}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="text-indigo-600 hover:text-indigo-900 ml-4"
                      >
                        عرض
                      </button>
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-yellow-600 hover:text-yellow-900 ml-4"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نموذج إضافة موعد جديد */}
      {showAddForm && (
        <AppointmentForm
          patients={patients}
          doctorId={user!.id}
          onSubmit={handleAddAppointment}
          onCancel={handleCloseModal}
        />
      )}

      {/* نموذج تعديل موعد */}
      {isEditing && selectedAppointment && (
        <AppointmentEdit
          appointment={selectedAppointment}
          patients={patients}
          onSubmit={(updates) => handleUpdateAppointment(selectedAppointment.id, updates)}
          onCancel={handleCloseModal}
        />
      )}

      {/* عرض تفاصيل موعد */}
      {isViewingDetails && selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          patientName={getPatientName(selectedAppointment.patientId)}
          onEdit={() => handleEdit(selectedAppointment)}
          onDelete={() => handleDeleteAppointment(selectedAppointment.id)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AppointmentManagement;
