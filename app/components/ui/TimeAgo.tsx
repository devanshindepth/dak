'use client';

import { useState, useEffect } from 'react';

function getTimeAgo(date: string | number | Date): string {
  const time = new Date(date).getTime();
  if (isNaN(time)) return '';

  const now = Date.now();
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

interface TimeAgoProps {
  date: string | number | Date;
}

export function TimeAgo({ date }: TimeAgoProps) {
  const [timeAgoStr, setTimeAgoStr] = useState(() => getTimeAgo(date));

  useEffect(() => {
    setTimeAgoStr(getTimeAgo(date));
    const interval = setInterval(() => {
      setTimeAgoStr(getTimeAgo(date));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return <span>{timeAgoStr}</span>;
}
