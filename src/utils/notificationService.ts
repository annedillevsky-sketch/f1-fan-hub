/**
 * Calendar Sync & Web Notification Service for F1 Fan Hub
 * Supports Google Calendar direct web URL generator, .ics (iCalendar) file downloads,
 * and Interactive Browser Web Notifications API with permission management.
 */

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Format a Date object into Google Calendar ISO 8601 UTC string (YYYYMMDDTHHmmssZ)
 */
export function formatGCalDateTime(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate a direct Google Calendar template URL
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const startStr = formatGCalDateTime(event.startDate);
  const endStr = formatGCalDateTime(event.endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: event.description,
    location: event.location,
    sprop: 'website:f1-fan-hub-apex.live',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate and download an RFC 5545 compliant .ics (iCalendar) file
 * Compatible with Apple Calendar, Google Calendar, Microsoft Outlook, and mobile devices
 */
export function downloadIcsFile(event: CalendarEventData, customFilename?: string): void {
  const startStr = formatGCalDateTime(event.startDate);
  const endStr = formatGCalDateTime(event.endDate);
  const stampStr = formatGCalDateTime(new Date());
  const uid = `f1-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@apex.live`;

  const cleanTitle = event.title.replace(/[,;]/g, ' ');
  const cleanLocation = event.location.replace(/[,;]/g, ' ');
  const cleanDescription = event.description.replace(/\n/g, '\\n').replace(/[,;]/g, ' ');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apex Live//F1 Fan Hub Race Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stampStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'CLASS:PUBLIC',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${cleanTitle} starts in 15 minutes!`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    `DESCRIPTION:F1 Session Alert: 1 hour until ${cleanTitle}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const defaultFilename = `${event.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.ics`;
  link.setAttribute('download', customFilename || defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download an RFC 5545 compliant multi-event .ics file
 * containing all sessions for a full Grand Prix race weekend
 */
export function downloadMultiEventIcsFile(
  weekendTitle: string,
  events: CalendarEventData[],
  customFilename?: string
): void {
  const stampStr = formatGCalDateTime(new Date());

  const eventBlocks = events.map((event, idx) => {
    const startStr = formatGCalDateTime(event.startDate);
    const endStr = formatGCalDateTime(event.endDate);
    const uid = `f1-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}@apex.live`;
    const cleanTitle = event.title.replace(/[,;]/g, ' ');
    const cleanLocation = event.location.replace(/[,;]/g, ' ');
    const cleanDescription = event.description.replace(/\n/g, '\\n').replace(/[,;]/g, ' ');

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stampStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDescription}`,
      `LOCATION:${cleanLocation}`,
      'STATUS:CONFIRMED',
      'CLASS:PUBLIC',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${cleanTitle} starts in 15 minutes!`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Apex Live//F1 Fan Hub ${weekendTitle}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    eventBlocks,
    'END:VCALENDAR',
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const defaultFilename = `${weekendTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_full_weekend.ics`;
  link.setAttribute('download', customFilename || defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Check if the browser supports the Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * Trigger a native browser desktop notification if permission is granted
 */
export function triggerBrowserNotification(
  title: string, 
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.warn('Native notification display failed:', error);
    return null;
  }
}
