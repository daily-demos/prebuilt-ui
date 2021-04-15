/*
 * Main functions: core call infrastructure, setting up the callframe and event listeners, creating room URL, and joining
 * Event listener callbacks: fired when specified Daily events execute
 * Call panel button functions: participant controls
 */

/* Main functions */
let callFrame, room;

async function createCallframe() {
  const callWrapper = document.getElementsByClassName('wrapper')[0];
  callFrame = await window.DailyIframe.createFrame(callWrapper);

  callFrame
    .on('loaded', showEvent)
    .on('started-camera', showEvent)
    .on('camera-error', showEvent)
    .on('joining-meeting', showLobby)
    .on('joined-meeting', toggleCallPanel)
    .on('error', showEvent)
    .on('left-meeting', toggleCallPanel);

  const roomURL = document.getElementById('url-input');
  const joinButton = document.getElementsByClassName('start-button')[1];
  const createButton = document.getElementsByClassName('start-button')[0];
  roomURL.addEventListener('input', () => {
    if (roomURL.checkValidity()) {
      joinButton.classList.add('valid');
      createButton.classList.add('disabled-button');
    } else {
      joinButton.classList.remove('valid');
    }
  });
}

async function createRoom() {
  // This endpoint is using the proxy as outlined in netlify.toml
  const newRoomEndpoint = `${window.location.origin}/api/rooms`;

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

  // Comment out the above and uncomment the below, using your own URL
  // if you prefer to test with a hardcoded room
  // return {url: "https://your-domain.daily.co/hello"}
}

async function createRoomAndStart() {
  const createAndStartButton = document.getElementsByClassName(
    'start-button'
  )[0];
  const copyUrl = document.getElementById('copy-url');

  createAndStartButton.innerHTML = 'Loading...';

  room = await createRoom();
  copyUrl.value = room.url;

  showDemoCountdown();

  callFrame.join({
    url: room.url,
    showLeaveButton: true,
  });
}

async function joinCall() {
  const url = document.getElementById('url-input');
  const copyUrl = document.getElementById('copy-url');

  await callFrame.join({
    url: url.value,
    showLeaveButton: true,
  });
}

/* Event listener callbacks and helpers */

function showEvent(e) {
  console.log('callFrame event', e);
}

function toggleHomeScreen() {
  const homeScreen = document.getElementsByClassName('start-container')[0];
  homeScreen.classList.toggle('hide');
}

function showLobby() {
  toggleHomeScreen();
}

function toggleCallPanel(e) {
  const callWrapper = document.getElementsByClassName('wrapper')[0];
  const callControls = document.getElementsByClassName(
    'call-controls-wrapper'
  )[0];
  const createAndStartButton = document.getElementsByClassName(
    'start-button'
  )[0];

  createAndStartButton.innerHTML = 'Create room and start';
  callWrapper.classList.toggle('in-call');
  callControls.classList.toggle('hide');
  setInterval(updateNetworkInfoDisplay, 5000);

  if (e.action === 'left-meeting') {
    toggleHomeScreen();
  }
}

/* Call panel button functions */

function copyUrl() {
  const url = document.getElementById('copy-url');
  const copyButton = document.getElementsByClassName('copy-url-button')[0];
  url.select();
  console.log(url);
  document.execCommand('copy');
  copyButton.innerHTML = 'Copied!';
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

function toggleFullscreen() {
  callFrame.requestFullscreen();
}

function toggleLocalVideo() {
  const localVideoButton = document.getElementById('local-video-button');
  const currentlyShown = callFrame.showLocalVideo();
  callFrame.setShowLocalVideo(!currentlyShown);
  localVideoButton.innerHTML = `${
    currentlyShown ? 'Show' : 'Hide'
  } local video`;
}

function toggleParticipantsBar() {
  const participantsBarButton = document.getElementById(
    'participants-bar-button'
  );
  const currentlyShown = callFrame.showParticipantsBar();
  callFrame.setShowParticipantsBar(!currentlyShown);
  participantsBarButton.innerHTML = `${
    currentlyShown ? 'Show' : 'Hide'
  } participants bar`;
}

/* Other helper functions */

// Populates 'network info' with information info from daily-js
async function updateNetworkInfoDisplay() {
  const videoSend = document.getElementById('video-send'),
    videoReceive = document.getElementById('video-receive'),
    packetSend = document.getElementById('packet-send'),
    packetReceive = document.getElementById('packet-receive');

  let statsInfo = await callFrame.getNetworkStats();

  videoSend.innerHTML = `${Math.floor(
    statsInfo.stats.latest.videoSendBitsPerSecond / 1000
  )} kb/s`;

  videoReceive.innerHTML = `${Math.floor(
    statsInfo.stats.latest.videoRecvBitsPerSecond / 1000
  )} kb/s`;

  packetSend.innerHTML = `${Math.floor(
    statsInfo.stats.worstVideoSendPacketLoss * 100
  )}%`;

  packetReceive.innerHTML = `${Math.floor(
    statsInfo.stats.worstVideoRecvPacketLoss * 100
  )}%`;
}

function showRoomInput() {
  const urlClick = document.getElementsByClassName('url-click')[0];
  const urlForm = document.getElementsByClassName('url-form')[0];
  urlClick.classList.remove('show');
  urlClick.classList.add('hide');

  urlForm.classList.remove('hide');
  urlForm.classList.add('show');
}

function showDemoCountdown() {
  const countdownDisplay = document.getElementsByClassName('demo-countdown')[0];

  if (!window.expiresUpdate) {
    window.expiresUpdate = setInterval(() => {
      let exp = room && room.config && room.config.exp;
      if (exp) {
        let seconds = Math.floor((new Date(exp * 1000) - Date.now()) / 1000);
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = Math.floor(seconds % 60);

        countdownDisplay.innerHTML = `Demo expires in ${minutes}:${
          remainingSeconds > 10 ? remainingSeconds : '0' + remainingSeconds
        }`;
      }
    }, 1000);
  }
}
