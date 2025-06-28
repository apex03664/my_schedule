const { google } = require('googleapis');
const calendar = google.calendar('v3');

const key = require('./service-account.json');

const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/calendar']
});

async function createMeetEvent() {
  await auth.authorize();

  const event = {
    summary: '🚀 Space Counseling Session',
    description: 'Let’s talk space careers!',
    start: {
      dateTime: '2025-07-01T19:00:00+05:30',
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: '2025-07-01T19:30:00+05:30',
      timeZone: 'Asia/Kolkata',
    },
    attendees: [{ email: 'parent@example.com' }],
    conferenceData: {
      createRequest: {
        requestId: 'unique-meeting-id-' + Date.now(),
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };

  const response = await calendar.events.insert({
    auth,
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1
  });

  console.log('✅ Meet link:', response.data.hangoutLink);
}

createMeetEvent().catch(console.error);
