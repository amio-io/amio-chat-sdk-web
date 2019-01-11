# Amio Webchat SDK

Client library for Amio Webchat.

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
Minified version available [amio-webchat-client.min.js](lib/amio-webchat-client.min.js) (will be available in CDN in the future).

```html
<html>
  <head>
    <script src="path/to/amio-webchat-client.min.js" type="text/javascript"></script>
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

### sendMessage(content)
Sends a message.

Parameters:
- **content** - Message content. See [Amio documentation](https://docs.amio.io/v1.0/reference#messages-send-message) for details about the format.

### sendTextMessage(text)
Sends a text message. This is just a handy shortcut for `sendMessage({type: 'text', payload: '...'})`

Parameters:
- **text** - The content of the text message.

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
AmioWebchatClient.onMessageReceived(function(data) {
  console.log('received message', data)
})
```

## License

[MIT](LICENSE)
