# Daily Prebuilt UI demo

This demo highlights [Daily's prebuilt UI](https://www.daily.co/blog/prebuilt-ui/), and how it can be used to embed a video chat widget in a website or app. The demo also illustrates how to use [daily-js methods](https://docs.daily.co/reference#instance-methods) and [events](https://docs.daily.co/reference#events) to build custom interfaces outside of the callframe that control the call.

Check out a live version of the demo [here](https://prebuilt-ui.netlify.app/).

The demo's custom controls use these Daily methods:

- [`.setLocalVideo()`](https://docs.daily.co/reference#%EF%B8%8F-setlocalvideo)
- [`.setLocalAudio()`](https://docs.daily.co/reference#%EF%B8%8F-setlocalaudio)
- [`.startScreenShare()`](https://docs.daily.co/reference#%EF%B8%8F-startscreenshare)
- [`.stopScreenShare()`](https://docs.daily.co/reference#%EF%B8%8F-stopscreenshare)
- [`.startRecording()`](https://docs.daily.co/reference#%EF%B8%8F-startrecording)
- [`.stopRecording()`](https://docs.daily.co/reference#%EF%B8%8F-stoprecording)
- [`.requestFullscreen()`](https://docs.daily.co/reference#requestfullscreen)
- [`.participants()`](https://docs.daily.co/reference#%EF%B8%8F-participants)
- [`.getNetworkStats()`](https://docs.daily.co/reference#%EF%B8%8F-getnetworkstats)
- [`.setSubscribeToTracksAutomatically()`](https://docs.daily.co/reference#%EF%B8%8F-setsubscribetotracksautomatically)

![homescreen](./assets/homescreen.png)
![call ui](./assets/callui.png)

## Prerequisites

- [Sign up for a Daily account](https://dashboard.daily.co/signup) if you'd like to insert your own URL into the Room URL input field.

## How the demo works

The participant either clicks the "Create demo room" button, triggering a helper function that generates a temporary demo room, or enters their own Daily room URL into the input field.

Once a room has been created, the participant can click "Join call." This button calls the Daily [`.join()`](https://docs.daily.co/reference#%EF%B8%8F-join) method, letting the participant into the call. The app listens for this `meeting-joined` event, and displays the control panel when the event fires. Each button in the panel triggers a corresponding Daily method when clicked.

## Running locally

1. Install dependencies `npm i`
2. Start dev server `npm run dev`
3. Then open your browser and go to `http://localhost:8080`

### To use live streaming:

1. Create a Daily room through the [dashboard](https://dashboard.daily.co) or [REST API](https://docs.daily.co/reference/rest-api/rooms/create-room).
2. Create a [meeting token](https://docs.daily.co/reference/rest-api/meeting-tokens/create-meeting-token) for your new room with the [`is_owner` property](https://docs.daily.co/reference/rest-api/meeting-tokens/config#is_owner) set to `true`.
3. From the home screen, click "Enter my room URL" and use the room URL you create in step 1.
   ![home screen with existing room URL](./assets/livestreaming.png)
4. Add your token from step 2 in `index.js` where the `.join()` call happens. There's a `todo` comment included to show you where to add it.
   ![code where token should be added](./assets/token.png)
5. In `index.js` in the `startLiveStreaming()` function, add your RTMP URL. It should be in the following format: `rtmp://RTMP_ENDPOINT/STREAM_KEY` or `rtmps://RTMP_ENDPOINT/STREAM_KEY`

OR...

## Running using Netlify CLI

If you want access to the Daily REST API (using the proxy as specified in `netlify.toml`) as well as a more robust local dev environment, please do the following (in this project's directory):

1. Deploy to your Netlify account
   [![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/daily-demos/prebuilt-ui)

2. Install the Netlify CLI `npm i -g netlify-cli`
3. Login to your account `netlify login`
4. Rename `sample.env` to `.env` and add your API key
5. Start the dev server `netlify dev`

> Note: If the API proxy isn't working locally you may need to run `netlify build` first. This will put API key in the `netlify.toml` file, so make sure you don't commit this change.

## Contributing and feedback

Let us know how experimenting with this demo goes! Reach us any time at `help@daily.co`.

## What's next

This demo shows off the [Daily prebuilt UI](https://www.daily.co/blog/prebuilt-ui/), but it's also possible to build an entirely custom video chat interface using [the Daily call object](https://docs.daily.co/docs/build-a-custom-video-chat-interface). Have a look at our [React tutorial](https://www.daily.co/blog/building-a-custom-video-chat-app-with-react/) to get started.
