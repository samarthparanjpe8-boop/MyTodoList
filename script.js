const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const API_KEY = '';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').onclick = handleAuthClick;
document.getElementById('signout_button').onclick = handleSignoutClick;

// Load GAPI
gapi.load('client', initializeGapiClient);

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
}

// Google OAuth
function handleAuthClick() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      document.getElementById('authorize_button').style.display = 'none';
      document.getElementById('signout_button').style.display = 'inline-block';
    },
  });
  tokenClient.requestAccessToken();
}

function handleSignoutClick() {
  google.accounts.oauth2.revoke(tokenClient.credentials.access_token);
  document.getElementById('authorize_button').style.display = 'inline-block';
  document.getElementById('signout_button').style.display = 'none';
}

// To-Do functionality
document.getElementById("addTask").addEventListener("click", addTask);

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  const li = document.createElement("li");
  li.textContent = taskText;
  document.getElementById("taskList").appendChild(li);

  // Add to Google Calendar
  addToGoogleCalendar(taskText);
  taskInput.value = "";
}

// Add event to Google Calendar
async function addToGoogleCalendar(task) {
  const event = {
    summary: task,
    start: {
      dateTime: new Date().toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hr later
      timeZone: 'Asia/Kolkata',
    },
  };

  try {
    await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    alert("Task added to Google Calendar!");
  } catch (error) {
    console.error(error);
  }
}
