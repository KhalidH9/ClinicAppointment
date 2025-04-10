import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarViewType } from '../types';

interface CalendarSidebarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewType: CalendarViewType['type'];
  onViewTypeChange: (type: CalendarViewType['type']) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onDateChange,
  viewType,
  onViewTypeChange
}) => {
  return (
    <div className="p-4 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">التقويم</h2>
      
      <div className="mb-6">
        <div className="flex space-x-2 space-x-reverse mb-4">
          <button
            onClick={() => onViewTypeChange('day')}
            className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              viewType === 'day'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 border border-indigo-600'
            }`}
          >
            يوم
          </button>
          <button
            onClick={() => onViewTypeChange('week')}
            className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              viewType === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 border border-indigo-600'
            }`}
          >
            أسبوع
          </button>
        </div>
      </div>
      
      <div className="calendar-container">
        {/* استخدام CSS العادي بدلاً من styled-jsx */}
        <style>
          {`
            .calendar-container .react-calendar {
              width: 100%;
              border: none;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            }
            .calendar-container .react-calendar__tile--active {
              background: #4f46e5;
              color: white;
            }
            .calendar-container .react-calendar__tile--now {
              background: #e0e7ff;
            }
            .calendar-container .react-calendar__tile--active.react-calendar__tile--now {
              background: #4f46e5;
            }
            .calendar-container .react-calendar__tile:enabled:hover,
            .calendar-container .react-calendar__tile:enabled:focus {
              background-color: #e0e7ff;
            }
          `}
        </style>
        <Calendar
          onChange={(value) => {
            // تأكد من أن القيمة هي كائن Date
            if (value instanceof Date) {
              onDateChange(value);
            }
          }}
          value={selectedDate}
          locale="ar-SA"
        />
      </div>
      
      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-900 mb-2">مفتاح الألوان</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">مجدول</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">مكتمل</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">ملغي</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded-sm mr-2"></div>
            <span className="text-sm text-gray-600">لم يحضر</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
