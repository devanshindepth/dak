'use client';

import React, { useState, useMemo } from 'react';
import { CalendarWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function CalendarWidget({ config }: { config: CalendarWidgetConfig }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfWeek = config.firstDayOfWeek === 'monday' ? 1 : 0;
  
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Fill previous month days
    const startOffset = (firstDayOfMonth.getDay() - firstDayOfWeek + 7) % 7;
    for (let i = startOffset; i > 0; i--) {
      days.push({
        date: new Date(year, month, 1 - i),
        isCurrentMonth: false
      });
    }
    
    // Fill current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Fill next month days
    const endOffset = 42 - days.length; // Ensure 6 rows for consistent height
    for (let i = 1; i <= endOffset; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentDate, firstDayOfWeek]);

  const weekDays = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (firstDayOfWeek === 1) {
      return [...days.slice(1), days[0]];
    }
    return days;
  }, [firstDayOfWeek]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();

  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <WidgetShell title={config.title} titleUrl={config.titleUrl} hideHeader={config.hideHeader}>
      <div className={config.cssClass}>
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Previous Month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="calendar-nav-label">{monthName}</div>
          <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next Month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <div className="calendar-grid">
          {weekDays.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {daysInMonth.map((day, i) => (
            <div 
              key={i} 
              className="calendar-day" 
              data-today={isToday(day.date)}
              data-other-month={!day.isCurrentMonth}
            >
              {day.date.getDate()}
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
