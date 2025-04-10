import React from 'react';
import { Appointment } from '../types';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AppointmentDetailsProps {
  appointment: Appointment;
  patientName: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  appointment,
  patientName,
  onEdit,
  onDelete,
  onClose
}) => {
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

  // تحديد لون الحالة
  const getStatusColor = (status: Appointment['status']) => {
    const colorMap = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status];
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">تفاصيل الموعد</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">المريض</h3>
            <p className="mt-1 text-lg text-gray-900">{patientName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">التاريخ</h3>
            <p className="mt-1 text-lg text-gray-900">{formatDate(appointment.date)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">وقت البداية</h3>
              <p className="mt-1 text-lg text-gray-900">{appointment.startTime}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">وقت النهاية</h3>
              <p className="mt-1 text-lg text-gray-900">{appointment.endTime}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">الحالة</h3>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
            </p>
          </div>
          
          {appointment.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">ملاحظات</h3>
              <p className="mt-1 text-gray-900">{appointment.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              تعديل
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
