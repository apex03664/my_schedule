const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();
app.use(bodyParser.json());

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const credentials = require('./credentials.json');
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load or request tokens
function authorize(callback) {
  fs.readFile('token.json', (err, token) => {
    if (err) return getAccessToken(callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(callback) {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this url:', authUrl);
}

// Create GMeet event
app.post('/schedule', (req, res) => {
  const { summary, description, dateTimeStart, dateTimeEnd, email } = req.body;

  authorize((auth) => {
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary,
      description,
      start: { dateTime: dateTimeStart },
      end: { dateTime: dateTimeEnd },
      attendees: [{ email }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      },
    };

    calendar.events.insert(
      {
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      },
      (err, event) => {
        if (err) return res.status(500).send('Error creating event: ' + err);
        const meetLink = event.data.hangoutLink;
        console.log("Meet Scheduled:", meetLink);
        res.send({ message: 'Meet scheduled', meetLink });
      }
    );
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
