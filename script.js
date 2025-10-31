// Replace this with your own Google OAuth Client ID
const CLIENT_ID = "287636693225-10lsudaso0edl1uj5t82uctmnk1jkpl7.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let accessToken = null;
let gapiInited = false;

// Load Google API client
gapi.load("client", async () => {
  await gapi.client.init({
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
  });
  gapiInited = true;
});

window.onload = () => {
  // Initialize OAuth client
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: handleAuthResponse,
  });

  document.getElementById("signin-btn").onclick = () => tokenClient.requestAccessToken();
  document.getElementById("signout-btn").onclick = handleSignOut;
  document.getElementById("add-btn").onclick = addTask;
};

// Handle login success
async function handleAuthResponse(tokenResponse) {
  if (tokenResponse.access_token) {
    accessToken = tokenResponse.access_token;
    document.getElementById("signin-btn").style.display = "none";
    document.getElementById("signout-btn").style.display = "inline-block";

    // Fetch user info
    const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await userInfo.json();
    document.getElementById("user-info").textContent = `Signed in as ${profile.name} (${profile.email}) ✅`;
  }
}

// Handle logout
function handleSignOut() {
  google.accounts.oauth2.revoke(accessToken);
  accessToken = null;
  document.getElementById("signin-btn").style.display = "inline-block";
  document.getElementById("signout-btn").style.display = "none";
  document.getElementById("user-info").textContent = "";
  document.getElementById("todo-list").innerHTML = "";
}

// Add a new task
async function addTask() {
  const task = document.getElementById("task").value.trim();
  const datetime = document.getElementById("datetime").value;

  if (!task || !datetime) {
    alert("Please enter both task and date/time!");
    return;
  }

  const event = {
    summary: task,
    start: { dateTime: new Date(datetime).toISOString(), timeZone: "Asia/Kolkata" },
    end: {
      dateTime: new Date(new Date(datetime).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: "Asia/Kolkata",
    },
  };

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    const eventId = response.result.id;
    addTaskToUI(task, datetime, eventId);

    document.getElementById("task").value = "";
    document.getElementById("datetime").value = "";
  } catch (error) {
    console.error("Error adding to calendar:", error);
    alert("Please sign in before syncing to Google Calendar.");
  }
}

// Add task in UI
function addTaskToUI(task, datetime, eventId) {
  const li = document.createElement("li");

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("task-info");
  infoDiv.innerHTML = `<span>${task}</span><span class="task-time">${new Date(datetime).toLocaleString()}</span>`;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.classList.add("delete-btn");
  delBtn.onclick = () => deleteTask(li, eventId);

  li.appendChild(infoDiv);
  li.appendChild(delBtn);
  document.getElementById("todo-list").appendChild(li);
}

// Delete task (from list + Google Calendar)
async function deleteTask(li, eventId) {
  try {
    await gapi.client.calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
    li.remove();
  } catch (error) {
    console.error("Failed to delete from calendar:", error);
    li.remove(); // Remove locally anyway
  }
}
