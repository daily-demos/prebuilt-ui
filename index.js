/*
 * Main functions: core call infrastructure, letting setting up the room, event listeners, and joining
 * Event listener callbacks: fired when specified Daily events execute
 * Call panel button functions: participant controls
 */

/* Main functions */

// Creates the callframe
// Defines event listeners on Daily events
// Assigns an event listener to the input field to change the join button color
async function setup() {
  callFrame = await window.DailyIframe.createFrame(
    document.getElementById('callframe'),
    {
      iframeStyle: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '90%',
        border: '0',
      },
    }
  );

  callFrame
    .on('loaded', showEvent)
    .on('started-camera', showEvent)
    .on('camera-error', showEvent)
    .on('joining-meeting', showEvent)
    .on('joined-meeting', showCallDisplay)
    .on('recording-started', showEvent)
    .on('recording-stopped', resetRecordingButton)
    .on('recording-stats', showEvent)
    .on('recording-error', showEvent)
    .on('app-message', showEvent)
    .on('input-event', showEvent)
    .on('error', showEvent)
    .on('participant-joined', updateParticipantInfoDisplay)
    .on('participant-updated', updateParticipantInfoDisplay)
    .on('participant-left', updateParticipantInfoDisplay)
    .on('left-meeting', hideCallDisplay);

  let roomURL = document.getElementById('room-url');
  const joinButton = document.getElementsByClassName('join-call')[0];
  roomURL.addEventListener('input', () => {
    if (roomURL.checkValidity()) {
      joinButton.classList.add('valid');
    } else {
      joinButton.classList.remove('valid');
    }
  });
}

async function createRoom() {
  // This endpoint is using the proxy as outlined in netlify.toml
  const newRoomEndpoint = `https://chrome-ext-daily-phil.netlify.app/api/rooms`;

  // we'll add 30 min expiry (exp) so rooms won't linger too long on your account
  // we'll also turn on chat (enable_chat)
  // see other available options at https://docs.daily.co/reference#create-room
  const exp = Math.round(Date.now() / 1000) + 60 * 30;
  const options = {
    properties: {
      exp: exp,
      enable_chat: true,
    },
  };

  try {
    let response = await fetch(newRoomEndpoint, {
        method: 'POST',
        body: JSON.stringify(options),
        mode: 'cors',
      }),
      room = await response.json();
    return room;
  } catch (e) {
    console.error(e);
  }
}

// Creates a temporary Daily demo room
// Assigns the demo room URL to the input value
// Changes the color of the 'join' button once a room has been created
async function createDemoRoom() {
  const createButton = document.getElementById('create-button');
  const joinButton = document.getElementsByClassName('join-call')[0];
  const roomURL = document.getElementById('room-url');
  createButton.innerHTML = 'Creating room...';
  room = await createRoom();
  // ownerLink = await createMtgLinkWithToken(room, {
  //   is_owner: true,
  //   enable_recording: 'local',
  // });

  roomURL.value = room.url;
  joinButton.classList.toggle('turn-green');
  createButton.innerHTML = 'Copy room link';
  createButton.setAttribute('onclick', 'copyLink()');

  displayDemoRoomTimer();
}

// Joins Daily call
// Passes the value in the 'room-url' input to callFrame.join
async function joinCall() {
  const roomURL = document.getElementById('room-url');
  await callFrame.join({
    url: roomURL.value,
    showLeaveButton: true,
  });
}

/* Event listener callbacks */

// Logs the Daily event to the console
function showEvent(e) {
  console.log('callFrame event', e);
}

// 'joined-meeting'
// Displays the call
// Changes instructional text and button to "copy" instead of "create"
// Hides the join call button
// Calls functions to update network stats and display demo room
function showCallDisplay() {
  const callPanel = document.getElementsByClassName('call-panel')[0],
    joinButton = document.getElementsByClassName('join-call')[0],
    instructionText = document.getElementById('instruction-text');

  showEvent();
  setInterval(updateNetworkInfoDisplay, 5000);

  callPanel.classList.remove('hide');
  callPanel.classList.add('show');

  instructionText.innerHTML = 'Copy and share the URL to invite others';
  joinButton.classList.remove('button');
  joinButton.classList.add('hide');
}

// 'left-meeting'
// Hides the call once the participant has exited
// Changes text back to "create" instead of copy
// Clears input and button values
// Restores join call and create demo buttons
function hideCallDisplay() {
  const expiresCountdown = document.getElementsByClassName(
      'expires-countdown'
    )[0],
    callPanel = document.getElementsByClassName('call-panel')[0],
    instructionText = document.getElementById('instruction-text'),
    topButton = document.getElementById('create-button'),
    joinButton = document.getElementsByClassName('join-call')[0];

  showEvent();

  expiresCountdown.classList.toggle('hide');

  callPanel.classList.remove('show');
  callPanel.classList.add('hide');

  instructionText.innerHTML =
    'To get started, enter an existing room URL or create a temporary demo room';
  joinButton.classList.remove('hide');
  joinButton.classList.add('button');
  topButton.innerHTML = 'Create demo room';
  topButton.setAttribute('onclick', 'createDemoRoom()');
}

// Changes the text on the recording button
function resetRecordingButton() {
  const recordingButton = document.getElementById('recording-button');
  recordingButton.setAttribute('onclick', 'callFrame.startRecording()');
  recordingButton.innerHTML = 'Start recording';
}

/* Call panel button functions */
function copyLink() {
  const link = document.getElementById('room-url');
  link.select();
  document.execCommand('copy');
  console.log('copied');
}

function toggleCamera() {
  callFrame.setLocalVideo(!callFrame.participants().local.video);
}

function toggleMic() {
  callFrame.setLocalAudio(!callFrame.participants().local.audio);
}

function toggleScreenshare() {
  let participants = callFrame.participants();
  const shareButton = document.getElementById('share-button');
  if (participants.local) {
    if (!participants.local.screen) {
      callFrame.startScreenShare();
      shareButton.innerHTML = 'Stop screenshare';
    } else if (participants.local.screen) {
      callFrame.stopScreenShare();
      shareButton.innerHTML = 'Share screen';
    }
  }
}

function toggleRecording() {
  const recordingButton = document.getElementById('recording-button');
  callFrame.startRecording();
  recordingButton.setAttribute('onclick', 'callFrame.stopRecording()');
  recordingButton.innerHTML = 'Stop recording';
}

function updateBackground() {
  const backgrounds = [
    'balloons.jpg',
    'confetti.jpg',
    'dessert.jpg',
    'fireworks.jpg',
    '',
  ];

  document.body.style.backgroundImage = `url('./assets/backgrounds/${
    backgrounds[Math.ceil(Math.random() * (backgrounds.length - 1))]
  }')`;
}

function unsubscribeTracks() {
  callFrame.setSubscribeToTracksAutomatically(false);
  const tracksButton = document.getElementById('tracks-button');
  tracksButton.setAttribute('onclick', 'subscribeTracks()');
  tracksButton.innerHTML = 'Subscribe to video and audio';
}

function subscribeTracks() {
  callFrame.setSubscribeToTracksAutomatically(true);
  const tracksButton = document.getElementById('tracks-button');
  tracksButton.setAttribute('onclick', 'unsubscribeTracks()');
  tracksButton.innerHTML = 'Unsubscribe from video and audio';
}

/* Other helper functions */

// Populates 'network info' with information info from daily-js
async function updateNetworkInfoDisplay() {
  let networkInfo = document.getElementsByClassName('network-info')[0],
    statsInfo = await callFrame.getNetworkStats();
  networkInfo.innerHTML = `
      <li>
        Video send:
        ${Math.floor(statsInfo.stats.latest.videoSendBitsPerSecond / 1000)} kb/s
      </li>
      <li>
        Video recv:
        ${Math.floor(statsInfo.stats.latest.videoRecvBitsPerSecond / 1000)} kb/s
      </li>
      <li>
        Worst send packet loss:
        ${Math.floor(statsInfo.stats.worstVideoSendPacketLoss * 100)}%
      </li>
      <li>Worst recv packet loss:
        ${Math.floor(statsInfo.stats.worstVideoRecvPacketLoss * 100)}%
      </li>
  `;
  document.getElementsByClassName('loading-network')[0].classList.add('hide');
}

// Loops through callFrame.participants() to list participants on the call
function updateParticipantInfoDisplay(e) {
  showEvent(e);
  let meetingParticipantsInfo = document.getElementById(
      'meeting-participants-info'
    ),
    participants = callFrame.participants(),
    participantsList = '';
  for (var id in participants) {
    let p = participants[id];
    participantsList += `
        <li>${p.user_name || 'Guest'}</li>
    `;
  }
  meetingParticipantsInfo.innerHTML = participantsList;
}

// Displays a countdown timer for the demo room if a demo room has been created
function displayDemoRoomTimer() {
  if (!window.expiresUpdate) {
    window.expiresUpdate = setInterval(() => {
      let exp = room && room.config && room.config.exp;
      if (exp) {
        document.getElementsByClassName('expires-countdown')[0].innerHTML = `
           <em>⏳ Heads up! Your demo room expires in
             ${Math.floor((new Date(exp * 1000) - Date.now()) / 1000)}
           seconds ⏳</em>
         `;
      }
    }, 1000);
  }
}
