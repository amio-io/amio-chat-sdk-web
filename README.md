# Amio Webchat SDK

Client library for Amio Webchat.

**!!! THIS PROJECT IS CURRENTLY IN ALPHA STAGE, BREAKING CHANGES MAY OCCUR AT ANY TIME**

## Installation

```bash
npm install amio-webchat-sdk --save
```

## How to use

The library should work in all JS environments, including ES6, ES5 and (common) browsers.

#### ES5
```js
var AmioWebchatClient = require('amio-webchat-sdk')

AmioWebchatClient.connect(...)
```

#### ES6
```js
import {AmioWebchatClient} from 'amio-webchat-sdk'

AmioWebchatClient.connect(...)
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
        AmioWebchatClient.connect(...);
    </script>
  </body>
</html>
```

## API

### connect(config)
Connects to Amio Webchat server.

Parameters:
- **config** - Configuration object. Currently supported params are:
  - **channelId** - ID of your Amio Webchat channel
  - **localStorageSessionName** - Allows to customize the name of the Local Storage field that holds a session ID

```js
AmioWebchatClient.connect({
  channelId: '12345678'
})
.then(() => {
  console.log('Connection successful')
})
.catch(err => {
  console.log('Connection error:', err)
})
```

### sendMessage(content)
Sends a message.

Parameters:
- **content** - Message content. See [Amio documentation](https://docs.amio.io/v1.0/reference#messages-send-message) for details about the format.

```js
AmioWebchatClient.sendMessage({
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

### sendTextMessage(text)
Sends a text message. This is just a handy shortcut for `sendMessage({type: 'text', payload: '...'})`

Parameters:
- **text** - The content of the text message.

### markMessagesAsRead()
Sends an event indicating that all received messages were read by the receiver. It is up to the implementer to decide when the messages are considered read and call this function.

Parameters:
- none

```js
AmioWebchatClient.markMessagesAsRead()
.then(() => {
  console.log('Messages marked as read')
})
.catch(err => {
  console.log('Error while marking messages as read:', err)
})
```

### listMessages(max, cursor)
Loads messages from message history. Can be called multiple times to move further back in history.

Parameters:
- **max** - Number of messages to load. Should be between 1 and 100.
- **cursor** - Reference point (message id) indicating where to start loading messages in history. If set to `null`, messages will be read from the beginning (newest first).

Response format:
- **messages** - Array of messages, sorted from newest to oldest.
- **cursor.next** - Cursor that should be used in the next call of listMessages().
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
AmioWebchatClient.listMessages(5, nextCursor)
.then(response => {
  console.log('First 5 messages loaded:', response.messages)
  nextCursor = response.cursor.next //save the cursor so we can load more messages later

  AmioWebchatClient.listMessages(5, nextCursor)
  .then(nextResponse => {
    console.log('Next 5 messages loaded:', nextResponse.messages)
    nextCursor = nextResponse.cursor.next //save the cursor so we can load more messages later
  })
})
.catch(err => {
  console.log('Error while loading messages:', err)
})
```

### onMessageReceived(func)
Sets a callback function that will be called every time a message is received from server.

Parameters:
- **func** - Function. It should accept one parameter which contains the message content. The message content format is following:
```json
{
  "id": "{{MESSAGE ID}}",
  "content": {
    "type": "{{MESSAGE TYPE}}",
    "payload": "{{MESSAGE PAYLOAD}}"
  }
}
```

Example usage:
```js
AmioWebchatClient.onMessageReceived((data) => {
  console.log('received message', data)
})
```

## License

[MIT](LICENSE)
