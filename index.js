/*
 * Main functions: core call infrastructure, setting up the callframe and event listeners, creating room URL, and joining
 * Event listener callbacks: fired when specified Daily events execute
 * Call panel button functions: participant controls
 */

/* Main functions */
let callFrame, room;

async function createCallframe() {
  const callWrapper = document.getElementById('wrapper');
  callFrame = await window.DailyIframe.createFrame(callWrapper);

  callFrame
    .on('loaded', showEvent)
    .on('started-camera', showEvent)
    .on('camera-error', showEvent)
    .on('joining-meeting', toggleLobby)
    .on('joined-meeting', handleJoinedMeeting)
    // ADDED TO SHOW PROFILE PIC WHEN VIDEO TURNED OFF
    .on('participant-updated', handleParticipantUpdated)
    .on('left-meeting', handleLeftMeeting);

  const roomURL = document.getElementById('url-input');
  const joinButton = document.getElementById('join-call');
  const createButton = document.getElementById('create-and-start');
  roomURL.addEventListener('input', () => {
    if (roomURL.checkValidity()) {
      joinButton.classList.add('valid');
      joinButton.classList.remove('disabled-button');
      joinButton.removeAttribute('disabled');
      createButton.classList.add('disabled-button');
    } else {
      joinButton.classList.remove('valid');
    }
  });

  roomURL.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      joinButton.click();
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

  // try {
  //   let response = await fetch(newRoomEndpoint, {
  //       method: 'POST',
  //       body: JSON.stringify(options),
  //       mode: 'cors',
  //     }),
  //     room = await response.json();
  //   return room;
  // } catch (e) {
  //   console.error(e);
  // }

  // Comment out the above and uncomment the below, using your own URL
  // if you prefer to test with a hardcoded room
  return { url: 'your-daily-url' };
}

async function createRoomAndStart() {
  const createAndStartButton = document.getElementById('create-and-start');
  const copyUrl = document.getElementById('copy-url');
  const errorTitle = document.getElementById('error-title');
  const errorDescription = document.getElementById('error-description');

  createAndStartButton.innerHTML = 'Loading...';

  room = await createRoom();
  if (!room) {
    errorTitle.innerHTML = 'Error creating room';
    errorDescription.innerHTML =
      "If you're developing locally, please check the README instructions.";
    toggleMainInterface();
    toggleError();
  }
  copyUrl.value = room.url;

  showDemoCountdown();

  try {
    callFrame.join({
      url: room.url,
      showLeaveButton: true,
      token: 'your-token',
    });
  } catch (e) {
    toggleError();
    console.error(e);
  }
}

async function joinCall() {
  const url = document.getElementById('url-input').value;
  const copyUrl = document.getElementById('copy-url');
  copyUrl.value = url;

  try {
    await callFrame.join({
      url: url,
      showLeaveButton: true,
      //TODO: add an owner token to use live streaming
      token: 'your-token',
    });
  } catch (e) {
    if (
      e.message === "can't load iframe meeting because url property isn't set"
    ) {
      toggleMainInterface();
      console.log('empty URL');
    }
    toggleError();
    console.error(e);
  }
}

/* Event listener callbacks and helpers */
function showEvent(e) {
  console.log('callFrame event', e);
}

let localVideoOn = true;
function handleParticipantUpdated(e) {
  let showProfilePic = true;
  const isLocalParticipant = e.participant.local;

  // only worry about the local participant (assuming this is the host of the live stream)
  if (isLocalParticipant) {
    // no video change, return
    if (localVideoOn === e.participant.video) return;

    if (localVideoOn && !e.participant.video) {
      // the video has been turned off so we can show the profile picture
      updateLiveStreaming(showProfilePic);
    } else {
      // if the video is back on, hide the profile pic
      showProfilePic = false;
      updateLiveStreaming(showProfilePic);
    }
  }
}

function toggleHomeScreen() {
  const homeScreen = document.getElementById('start-container');
  homeScreen.classList.toggle('hide');
}

function toggleLobby() {
  const callWrapper = document.getElementById('wrapper');
  callWrapper.classList.toggle('in-lobby');
  toggleHomeScreen();
}

function toggleControls() {
  const callControls = document.getElementById('call-controls-wrapper');
  callControls.classList.toggle('hide');
}

function toggleCallStyling() {
  const callWrapper = document.getElementById('wrapper');
  const createAndStartButton = document.getElementById('create-and-start');
  createAndStartButton.innerHTML = 'Create room and start';
  callWrapper.classList.toggle('in-call');
}

function toggleError() {
  const errorMessage = document.getElementById('error-message');
  errorMessage.classList.toggle('error-message');
  toggleControls();
  toggleCallStyling();
}

function toggleMainInterface() {
  toggleHomeScreen();
  toggleControls();
  toggleCallStyling();
}

function handleJoinedMeeting() {
  toggleLobby();
  toggleMainInterface();
}

function handleLeftMeeting() {
  toggleMainInterface();
}

function resetErrorDesc() {
  const errorTitle = document.getElementById('error-title');
  const errorDescription = document.getElementById('error-description');

  errorTitle.innerHTML = 'Incorrect room URL';
  errorDescription.innerHTML =
    'Meeting link entered is invalid. Please update the room URL.';
}

function tryAgain() {
  toggleError();
  toggleMainInterface();
  resetErrorDesc();
}

/* Call panel button functions */
function copyUrl() {
  const url = document.getElementById('copy-url');
  const copyButton = document.getElementById('copy-url-button');
  url.select();
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

// To use live streaming, the room URL should use the format:
// https://your-daily-domain.daily.co/room-name?t=your-owner-meeting-token
function startLiveStreaming() {
  // This should be in the format rtmp://RTMP_ENDPOINT/STREAM_KEY
  // or rtmps://RTMP_ENDPOINT/STREAM_KEY

  // TODO - add your own
  const rtmpUrl = 'rtmp://RTMP_ENDPOINT/STREAM_KEY';
  callFrame.startLiveStreaming({
    rtmpUrl,
    layout: {
      preset: 'custom',
      composition_params: {
        showImageOverlay: false,
        'image.assetName': 'profilePic',
        'image.fullScreen': true,
      },
      /* optional: sessions assets must be included in startLiveStreaming() even if they aren't used until an updateLiveStreaming() call
      session asset images *must* be a .png
       */
      session_assets: {
        'images/profilePic':
          'https://www.daily.co/blog/content/images/2022/07/Directory-Image--36-.png',
      },
    },
  });
}

function updateLiveStreaming(showProfilePic) {
  console.log('updating!!!');
  callFrame.updateLiveStreaming({
    layout: {
      preset: 'custom',
      composition_params: {
        showImageOverlay: showProfilePic,
      },
    },
  });
}

function stopLiveStreaming() {
  console.log('stopping!!!');
  callFrame.stopLiveStreaming();
}

let toastKey = 0;

function showToast(e) {
  // prevent default form behavior
  e.preventDefault();
  // get input value from form submit event
  const toastText = e.target[0].value;

  // send
  callFrame.updateLiveStreaming({
    layout: {
      preset: 'custom',
      composition_params: {
        'toast.text': toastText,
        'toast.color': 'rgba(215, 50, 110, 0.8)',
        'toast.text.fontFamily': 'Bitter',
        'toast.duration_secs': 3,
        'toast.text.fontSize_pct': 150,
        'toast.text.fontWeight': '400',
        'toast.key': toastKey,
      },
    },
  });
  toastKey++;
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
  const urlInput = document.getElementById('url-input');
  const urlClick = document.getElementById('url-click');
  const urlForm = document.getElementById('url-form');
  urlClick.classList.remove('show');
  urlClick.classList.add('hide');

  urlForm.classList.remove('hide');
  urlForm.classList.add('show');
  urlInput.focus();
}

function showDemoCountdown() {
  const countdownDisplay = document.getElementById('demo-countdown');

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
