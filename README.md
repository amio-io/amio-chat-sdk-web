# Amio Chat SDK for Web

JavaScript client library for Amio Chat.

**!!! THIS PROJECT IS CURRENTLY IN BETA !!!**

- [Installation](#installation)
- [Quickstart](#quickstart)
- [API](#api)
- [Events](#events)

## Installation

```bash
npm install amio-webchat-sdk --save
```

## Quickstart

The library should work in all JS environments, including ES6, ES5 and (common) browsers.

#### ES5
```js
var amioWebchatClient = require('amio-webchat-sdk')

amioWebchatClient.connect(...)
```

#### ES6
```js
import {amioWebchatClient} from 'amio-webchat-sdk'

amioWebchatClient.connect(...)
```

#### Browser (script tag)
Minified version available [amio-webchat-sdk.min.js](lib/amio-webchat-sdk.min.js) (will be available in CDN in the future).

```html
<html>
  <head>
    <script src="path/to/amio-webchat-sdk.min.js" type="text/javascript"></script>
  </head>
  <body>
    <script type="text/javascript">
        amioWebchatClient.connect(...);
    </script>
  </body>
</html>
```

## API

- [connect(config)](#connectconfig)
- [messages.send(content)](#messagessendcontent)
- [messages.sendText(text)](#messagessendtexttext)
- [messages.sendImage(url)](#messagessendimageurl)
- [messages.list(nextCursor, max)](#messageslistnextcursor-max)
- [notifications.send(payload)](#notificationssendpayload)
- [notifications.sendMessagesRead()](#notificationssendmessagesread)

### connect(config)
Connects to Amio Chat server.

Parameters:
- **config** - Configuration object. Currently supported params are:
  - **channelId** - ID of your Amio Chat channel.
  - **localStorageSessionName** - (Optional) Allows to customize the name of the Local Storage field that holds a session ID.

```js
amioWebchatClient.connect({
  channelId: '6495613231087502282'
})
.then(() => {
  console.log('Connection successful')
})
.catch(err => {
  console.log('Connection error:', err)
})
```

### messages.send(content)
Sends a message.

Parameters:
- **content** - Message content. See [Amio documentation](https://docs.amio.io/v1.0/reference#messages-send-message) for details about the format.

```js
amioWebchatClient.messages.send({
  type: 'text',
  payload: 'Hello world'
})
.then(() => {
  console.log('Message sent successfully')
})
.catch(err => {
  console.log('Error while sending message:', err)
})
```

### messages.sendText(text)
Sends a text message. This is just a handy shortcut for `messages.send({type: 'text', payload: '...'})`

Parameters:
- **text** - The content of the text message.

### messages.sendImage(url)
Sends an image message. This is just a handy shortcut for `messages.send({type: 'image', payload: '...'})`

Parameters:
- **url** - The URL of the image.

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
amioWebchatClient.messages.list(nextCursor, 5)
.then(response => {
  console.log('First 5 messages loaded:', response.messages)
  nextCursor = response.cursor.next //save the cursor so we can load more messages later

  amioWebchatClient.messages.list(nextCursor, 5)
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
amioWebchatClient.notifications.send({
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
amioWebchatClient.notifications.sendMessagesRead()
.then(() => {
  console.log('Messages marked as read')
})
.catch(err => {
  console.log('Error while marking messages as read:', err)
})
```

## Events

- [events.onMessageReceived(func)](#eventsonmessagereceivedfunc)
- [events.onMessageEcho(func)](#eventsonmessageechofunc)
- [events.onNotificationReceived(func)](#eventsonnotificationreceivedfunc)
- [events.onConnectionStateChanged(func)](#eventsonconnectionstatechangedfunc)

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
    "payload": "{{MESSAGE PAYLOAD}}"
  },
  "sent": "{{SENT_TIMESTAMP}}",
  "delivered": "{{DELIVERED_TIMESTAMP}}",
  "read": "{{READ_TIMESTAMP}}"
}
```

Example usage:
```js
amioWebchatClient.events.onMessageReceived((data) => {
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
  "sent": "{{SENT_TIMESTAMP}}",
  "delivered": "{{DELIVERED_TIMESTAMP}}",
  "read": "{{READ_TIMESTAMP}}"
}
```

Example usage:
```js
amioWebchatClient.events.onMessageEcho((data) => {
  console.log('message echo', data)
})
```

### events.onNotificationReceived(func)
Sets a callback function that will be called every time a notification is received from server.

Parameters:
- **func** - Function. It should accept one parameter which contains the notification payload. The payload can be any valid JSON element (string, object, number...).

Example usage:
```js
amioWebchatClient.events.onNotificationReceived((payload) => {
  console.log('received notification', payload)
})
```

### events.onConnectionStateChanged(func)
Sets a callback function that will be called when connection state changes from offline to online or vice versa.

Parameters:
- **func** - Function. It should accept one parameter which will be set to `true` when connection changes to online, and `false` when connection changes to offline.

Example usage:
```js
amioWebchatClient.events.onConnectionStateChanged((online) => {
  if(online) {
    console.log('We are online :)')
  } else {
    console.log('We are offline :(')
  }
})
```

## License

[MIT](LICENSE)
