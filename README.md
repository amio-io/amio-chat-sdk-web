# Amio Chat SDK for Web

JavaScript client library for Amio Chat.

- [Installation](#installation)
- [Quickstart](#quickstart)
- [Best Practices](#best-practices)
  - [Quick Replies](#quick-replies)
- [API](#api)
  - [connect(config)](#connectconfig)
  - [disconnect()](#disconnect)
  - [isConnected()](#isconnected)
  - [getSessionId()](#getsessionid)
  - [files.upload(fileName, mimeType, binaryData)](#filesuploadfilename-mimetype-binarydata)
  - [messages.send(content, metadata)](#messagessendcontent-metadata)
  - [messages.sendText(text, metadata)](#messagessendtexttext-metadata)
  - [messages.sendImage(url, metadata)](#messagessendimageurl-metadata)
  - [messages.sendFile(url, metadata)](#messagessendfileurl-metadata)
  - [messages.sendQuickReply(text, quickReplyPayload, metadata)](#messagessendquickreplytext-quickreplypayload-metadata)
  - [messages.list(nextCursor, max)](#messageslistnextcursor-max)
  - [notifications.send(payload)](#notificationssendpayload)
  - [notifications.sendMessagesRead()](#notificationssendmessagesread)
  - [postbacks.send(postbackPayload)](#postbackssendpostbackpayload)
- [Events](#events)
  - [events.onMessageReceived(func)](#eventsonmessagereceivedfunc)
  - [events.onMessageEcho(func)](#eventsonmessageechofunc)
  - [events.onNotificationReceived(func)](#eventsonnotificationreceivedfunc)
  - [events.onConnectionStateChanged(func)](#eventsonconnectionstatechangedfunc)
- [Tests](#tests)
- [License](#license)

## Installation

```bash
npm install amio-chat-sdk-web --save
```

## Quickstart

The library should work in all JS environments, including ES6, ES5 and (common) browsers.

You can find your Channel ID in [Amio administration](https://app.amio.io/administration/channels).

#### ES5
```js
var amioChat = require('amio-chat-sdk-web')

amioChat.connect({
  channelId: '6495613231087502282'
})
```

#### ES6
```js
import {amioChat} from 'amio-chat-sdk-web'

amioChat.connect({
  channelId: '6495613231087502282'
})
```

#### Browser (script tag)
Minified version available [amio-chat-sdk-web.min.js](lib/amio-chat-sdk-web.min.js) (will be available in CDN in the future).

```html
<html>
  <head>
    <script src="path/to/amio-chat-sdk-web.min.js" type="text/javascript"></script>
  </head>
  <body>
    <script type="text/javascript">
        amioChat.connect({
          channelId: '6495613231087502282'
        });
    </script>
  </body>
</html>
```

## Best Practices

### Quick Replies
Quick Replies are buttons with a set of pre-defined short replies. Their look and feel are subject to front-end implementation, but certain design aspects should always be true:
- Quick Reply buttons are displayed above the user input
- When a Quick Reply button is clicked, its `title` is rendered as a text message and, at the same time, a call to Amio Chat server is made (see below)
- All of the Quick Reply buttons are dismissed as soon as user clicks one or replies using text input
- Quick Replies can be attached to any message type (text, image...)
- Text input can be disabled (if desirable) when Quick Reply buttons are displayed

#### Quick Replies API
When a message is received via [events.onMessageReceived(func)](#eventsonmessagereceivedfunc) callback, the message's `content` can have a `quick_replies` field indicating that one or more Quick Reply buttons should be displayed.

```json
{
"content": {
  "type": "{{MESSAGE TYPE}}",
  "payload": "{{MESSAGE PAYLOAD}}",
  "quick_replies": [
    {
      "type": "text",
      "title": "Yes",
      "payload": "QR_YES"
    },
    {
      "type": "text",
      "title": "No",
      "payload": "QR_NO"
    }
  ]
}
```

Parameters:
- **quick_replies** - Array of up to 11 Quick Reply buttons.
  - **type** - Button type. Only `text` is supported.
  - **title** - Button's title text. Maximum 20 characters.
  - **payload** - Button's payload is used to identify which button was pressed. Maximum 1000 characters.
  - **image_url** - Optional. URL of an image that would be used as a button icon.


When user clicks on one of the Quick Reply buttons, use [messages.send(content, metadata)](#messagessendcontent-metadata) function to notify Amio Chat server (or use shortcut [messages.sendQuickReply(text, quickReplyPayload, metadata)](#messagessendquickreplytext-quickreplypayload-metadata)). The `content` must be a text message with Quick Reply's title as a `payload` and `quick_reply` field with Quick Reply's `payload`:

```json
{
"content": {
  "type": "text",
  "payload": "Yes",
  "quick_reply": {
    "payload": "QR_YES"
  }
}
```


## API

### connect(config)
Connects to Amio Chat server.

Parameters:
- **config** - Configuration object. Currently supported params are:
  - **channelId** - ID of your Amio Chat channel.
  - **storageType** - (optional) Allows to choose if session data will be stored in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) or [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage). Default value is `'local'`. Allowed values are:
    - `'local'` - use localStorage
    - `'session'` - use sessionStorage

```js
amioChat.connect({
  channelId: '6495613231087502282',
  storageType: 'local'
})
.then(() => {
  console.log('Connection successful')
})
.catch(err => {
  console.log('Connection error:', err)
})
```

### disconnect()
Disconnects from Amio Chat server.

### isConnected()
Returns `true` if the client is successfully connected to Amio Chat server.

### getSessionId()
It returns session ID of the client connected to Amio Chat server. Returns `null` if the connection was not successful. 

### files.upload(fileName, mimeType, binaryData)
Uploads the specified file and returns URL of the uploaded file. Can be used in combination with [messages.sendFile(url, metadata)](#messagessendfileurl-metadata) to implement sending of local files through Amio Chat. 

Parameters:
- **fileName** - Name of the file.
- **mimeType** - MIME type of the file.
- **binaryData** - Binary data of the file. Accepts all formats that are accepted by [Buffer.from](https://nodejs.org/api/buffer.html#buffer_static_method_buffer_from_array).

Response format:
- **text** - Text transcription of the audio recording.

```js
amioChat.files.uploadVoice('audio/webm', buffer)
.then((response) => {
  console.log('File uploaded successfully')

  // Now let's send the file through Amio Chat
  amioChat.messages.sendFile(response.url)
})
.catch(err => {
  console.log('Error while uploading file:', err)
})
```

### files.uploadVoice(mimeType, binaryData)
Uploads a voice recording for voice-to-text recognition. This function is recommended for transcripting longer recordings in a request-response manner.

Parameters:
- **mimeType** - MIME type of the audio.
- **binaryData** - Binary data of the audio. Accepts all formats that are accepted by [Buffer.from](https://nodejs.org/api/buffer.html#buffer_static_method_buffer_from_array).

Response format:
- **url** - URL of the uploaded file.

```js
amioChat.files.upload('test.txt', 'text/plain', 'test')
.then((response) => {
  console.log('File uploaded successfully')

  // Now let's send the file through Amio Chat
  amioChat.messages.sendFile(response.url)
})
.catch(err => {
  console.log('Error while uploading file:', err)
})
```

### messages.send(content, metadata)
Sends a message.

Parameters:
- **content** - Message content. See [Amio documentation](https://docs.amio.io/v1.0/reference#messages-send-message) for details about the format.
- **metadata** - Optional. Add [metadata](https://docs.amio.io/v1.0/reference#messages-metadata) to the message. Metadata has to be an object and can carry whatever data needed to be sent along with the message.

```js
amioChat.messages.send({
  type: 'text',
  payload: 'Hello world'
}, {
  any: "arbitrary data"
})
.then(() => {
  console.log('Message sent successfully')
})
.catch(err => {
  console.log('Error while sending message:', err)
})
```

### messages.sendText(text, metadata)
Sends a text message. This is just a handy shortcut for `messages.send({type: 'text', payload: '...'}, metadata)`

Parameters:
- **text** - The content of the text message.
- **metadata** - Optional. Add [metadata](https://docs.amio.io/v1.0/reference#messages-metadata) to the message. Metadata has to be an object and can carry whatever data needed to be sent along with the message.

### messages.sendImage(url, metadata)
Sends an image message. This is just a handy shortcut for `messages.send({type: 'image', payload: '...'}, metadata)`

Parameters:
- **url** - The URL of the image.
- **metadata** - Optional. Add [metadata](https://docs.amio.io/v1.0/reference#messages-metadata) to the message. Metadata has to be an object and can carry whatever data needed to be sent along with the message.

### messages.sendFile(url, metadata)
Sends an file message. This is just a handy shortcut for `messages.send({type: 'file', payload: '...'}, metadata)`

Parameters:
- **url** - The URL of the file.
- **metadata** - Optional. Add [metadata](https://docs.amio.io/v1.0/reference#messages-metadata) to the message. Metadata has to be an object and can carry whatever data needed to be sent along with the message.

### messages.sendQuickReply(text, quickReplyPayload, metadata)
Sends a text message with Quick Reply payload, indicating that user pressed the Quick Reply button. This is just a handy shortcut for `messages.send({type: 'text', payload: '...', quick_reply: {payload: '...'}}, metadata)`

Parameters:
- **text** - The content of the text message.
- **quickReplyPayload** - Payload indicates which Quick Reply button has been pressed.
- **metadata** - Optional. Add [metadata](https://docs.amio.io/v1.0/reference#messages-metadata) to the message. Metadata has to be an object and can carry whatever data needed to be sent along with the message.

### messages.list(nextCursor, max)
Loads messages from message history. Can be called multiple times to move further back in history.

Parameters:
- **nextCursor** - Reference point (message id) indicating where to start loading messages in history. If set to `null`, messages will be read from the beginning (newest first).
- **max** - Number of messages to load. Should be between 1 and 100 (default is 10).

Response format:
- **messages** - Array of messages, sorted from newest to oldest.
- **cursor.next** - Cursor pointing to subsequent messages. Use this cursor in the next call of `messages.list()`.
- **cursor.has_next** - False if there are no more messages in the history, true otherwise.
```json
{ 
  "messages": [ 
    { 
      "id": "6500763984087564228",
      "direction": "received",
      "sent": "2019-02-11T16:35:12.163Z",
      "delivered": null,
      "read": null,
      "content": {
        "type": "text",
        "payload": "World"
      },
      "metadata": {
        "any": "arbitrary data"
      }
    },
    { 
      "id": "6500754972885466525",
      "direction": "received",
      "sent": "2019-02-11T15:59:23.722Z",
      "delivered": null,
      "read": null,
      "content": {
        "type": "text",
        "payload": "Hello"
      }
     },
  ],
  "cursor": {
    "next": "6500754972885466525",
    "has_next": true
  } 
}
```

Example usage:
```js
var nextCursor = null
amioChat.messages.list(nextCursor, 5)
.then(response => {
  console.log('First 5 messages loaded:', response.messages)
  nextCursor = response.cursor.next //save the cursor so we can load more messages later

  amioChat.messages.list(nextCursor, 5)
  .then(nextResponse => {
    console.log('Next 5 messages loaded:', nextResponse.messages)
    nextCursor = nextResponse.cursor.next //save the cursor so we can load more messages later
  })
})
.catch(err => {
  console.log('Error while loading messages:', err)
})
```

### notifications.send(payload)
Sends a notification. The `payload` can be any valid JSON element (string, object, number...).

```js
amioChat.notifications.send({
  event: 'my_awesome_event'
})
.then(() => {
  console.log('Notification sent successfully')
})
.catch(err => {
  console.log('Error while sending notification:', err)
})
```

### notifications.sendMessagesRead()
Sends an event indicating that all received messages were read by the receiver. It is up to the implementer to decide when the messages are considered read and call this function.

Parameters:
- none

```js
amioChat.notifications.sendMessagesRead()
.then(() => {
  console.log('Messages marked as read')
})
.catch(err => {
  console.log('Error while marking messages as read:', err)
})
```

### postbacks.send(postbackPayload)
Sends a postback. Postbacks are usually triggered when user presses a button.

Parameters:
- **postbackPayload** - Arbitrary string that is usually used to determine which button was pressed. Must not be empty.

```js
amioChat.postbacks.send('test_payload')
.then(() => {
  console.log('Postback sent successfully.')
})
.catch(err => {
  console.log('Error while sending postback:', err)
})
```

## Events

### events.onMessageReceived(func)
Sets a callback function that will be called every time a message is received from server.

Parameters:
- **func** - Function. It should accept one parameter which contains the message content. The message content format is following:
```json
{
  "id": "{{MESSAGE ID}}",
  "direction": "received",
  "content": {
    "type": "{{MESSAGE TYPE}}",
    "payload": "{{MESSAGE PAYLOAD}}",
    "quick_replies": [
      {
        "type": "text",
        "title": "Click me!",
        "payload": "DEVELOPER_DEFINED_PAYLOAD"
      }
    ]
  },
  "metadata": {
    "any": "arbitrary data"
  },
  "sent": "{{SENT_TIMESTAMP}}",
  "delivered": "{{DELIVERED_TIMESTAMP}}",
  "read": "{{READ_TIMESTAMP}}"
}
```

Example usage:
```js
amioChat.events.onMessageReceived((data) => {
  console.log('received message', data)
})
```

### events.onMessageEcho(func)
Sets a callback function that will be called every time a message echo is received from server. Message echo means a message was sent through a different connection associated with the same session (for example, the user has two browser tabs opened, so that's the same session but two different connections).

Parameters:
- **func** - Function. It should accept one parameter which contains the message content. The message content format is following (conveniently, it's the same as received message, except `direction` will be `sent`):
```json
{
  "id": "{{MESSAGE ID}}",
  "direction": "sent",
  "content": {
    "type": "{{MESSAGE TYPE}}",
    "payload": "{{MESSAGE PAYLOAD}}"
  },
  "metadata": {
    "any": "arbitrary data"
  },
  "sent": "{{SENT_TIMESTAMP}}",
  "delivered": "{{DELIVERED_TIMESTAMP}}",
  "read": "{{READ_TIMESTAMP}}"
}
```

Example usage:
```js
amioChat.events.onMessageEcho((data) => {
  console.log('message echo', data)
})
```

### events.onNotificationReceived(func)
Sets a callback function that will be called every time a notification is received from server.

Parameters:
- **func** - Function. It should accept one parameter which contains the notification payload. The payload can be any valid JSON element (string, object, number...).

Example usage:
```js
amioChat.events.onNotificationReceived((payload) => {
  console.log('received notification', payload)
})
```

### events.onConnectionStateChanged(func)
Sets a callback function that will be called when connection state changes from offline to online or vice versa.

Parameters:
- **func** - Function. It should accept one parameter which will be set to `true` when connection changes to online, and `false` when connection changes to offline.

Example usage:
```js
amioChat.events.onConnectionStateChanged((online) => {
  if(online) {
    console.log('We are online :)')
  } else {
    console.log('We are offline :(')
  }
})
```

## Tests

### Tips - quicker testing 
During development, comment the **lib** import and replace it with **src** one:
```js
// import amioChat from '../lib/amio-chat-sdk-web'
import {amioChat} from '../src/amio-chat-client'
```

### Tips - promises
Since we can't use `async/await`, always pay attention that every promised base test has this form:
```js
it('test', () => {
  return createPromise() // mocha handles it
})
```

### Execute all tests
1. Build the code - `npm run build`
2. Run the test suite - `npm run test`.

### Execute single test
1. Build the code - `npm run build`
2. To run a single test, you have to include `mocha --require babel-register --colors`. 

## License

[MIT](LICENSE)
