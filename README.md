# use-event-latch

React hook returning a state value derived from an event emitter. For use with `EventEmitter` instances from the [`events`](https://github.com/browserify/events) module for browsers (included by bundlers like [browserify](https://github.com/browserify/browserify) or [webpack](https://github.com/webpack/webpack), see [here](https://github.com/browserify/events?tab=readme-ov-file#install)).

Features:
- configure which events to listen to, and how to derive the returned state from the emitted event and arguments
- handles registering (and removing) listeners on the event emitter

The hook can be seen as a state machine, with the state initially being returned as `null`. The hook's second configuration param specifies the state transitions to take in response to triggering events from the underlying event emitter.

Useful for example in displaying the status of a client which may transition between several connection states.

# Installation

```sh
npm install use-event-latch
```

# Usage

You can wrap any event emitter into `useEventLatch`.

```jsx
import { useEventLatch } from 'use-event-latch'

function StatusIndicator() {
  const client = useRef(new MyClient())

  const clientStatus = useEventLatch(client.current)

  return (
    <Label
      color={clientStatus === 'connected' ? 'green' : 'red'}
      content={`Client status: ${clientStatus}`}
    />
  )
}
```

With the monitored client being some event emitter:

```js
import EventEmitter from 'events'

export class MyClient extends EventEmitter {
  connect() {
    // ...
    this.emit('connected')
  }

  handleClose(err) {
    // ...
    this.emit('disconnected', err)
  }
}
```

## Configuration

The hook takes in a second optional parameter to specify how the state should be derived from the emitted events.

If the status was instead emitted as an argument under a single `status-changed` event:

```jsx
import { useEventLatch } from 'use-event-latch'

function StatusIndicator() {
  const client = useRef(new MyClient())

  const clientStatus = useEventLatch(
    client.current,
    {
      'status-changed': (statusString) => {
        // could return anything here, for example to transform the status string
        return statusString
      },
    },
  )

  return (
    <Label
      color={clientStatus === 'connected' ? 'green' : 'red'}
      content={`Client status: ${clientStatus}`}
    />
  )
}
```
