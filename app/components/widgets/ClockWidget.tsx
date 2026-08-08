'use client';

import React, { useState, useEffect } from 'react';
import { ClockWidgetConfig } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function ClockWidget({ config }: { config: ClockWidgetConfig }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const is12h = config.hourFormat === '12h';
  
  const timeString = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: is12h,
  });

  const [timePart, ampmPart] = timeString.split(' ');
  
  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <WidgetShell title={config.title} titleUrl={config.titleUrl} hideHeader={config.hideHeader}>
      <div className={config.cssClass}>
        <div className="clock-main">
          <div className="clock-time">
            {timePart}
            {is12h && ampmPart && <span className="clock-ampm">{ampmPart}</span>}
          </div>
          <div className="clock-date">{dateString}</div>
        </div>
        {config.timezones && config.timezones.length > 0 && (
          <div className="clock-zones">
            {config.timezones.map((tz, i) => {
              const tzTime = new Intl.DateTimeFormat('en-US', {
                timeZone: tz.timezone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: is12h
              }).format(time);
              
              return (
                <div key={i} className="clock-zone">
                  <div className="clock-zone-label">{tz.label}</div>
                  <div className="clock-zone-time">{tzTime}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
