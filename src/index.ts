import { EventEmitter } from 'events'
import { useEffect, useState } from 'react'

export type EventHandler = (...args: unknown[]) => string
export type EventConfig = string[] | Record<string, EventHandler | string>


/**
 * Register listeners on an EventEmitter to derive state from the emitted events.
 * 
 * @param eventEmitter - the EventEmitter instance to listen to
 * @param eventConfig - an optional configuration object specifying how the emitted events will participate in setting the return value. Possible values are:
 * - omitted (default): the return value is the last emitted event name among all event names (as given by {@link EventEmitter#eventNames})
 * - an array of event names: the return value is the last emitted event name among those event names (only)
 * - a record with keys the event names
 * 
 * For each event name in the record, the value can be:
 * - a string which will be used as the return value
 * - a function returning a string which will be used as the return value
 * 
 * Function values are called with the emitted args (as if directly registered as a listener for the event).
 * @returns the latest emitted event name, or a value derived from the emitted event and args according to the {@link eventConfig}
 */
export const useEventLatch = (
  eventEmitter: EventEmitter,
  eventConfig?: EventConfig,
): string | null => {
  const [latestEvent, setLatestEvent] = useState<string | null>(null)

  const getCreateConfiguredEventHandler =
    (definedEventConfig: Exclude<NonNullable<typeof eventConfig>, string[]>) =>
    (eventName: string) => {
      const configValue = definedEventConfig[eventName]
      if (typeof configValue === 'string') {
        return createUnconfiguredEventHandler(eventName)
      }

      if (typeof configValue === 'function') {
        return (...args: unknown[]) => {
          const result = configValue(...args)
          if (typeof result === 'string') {
            setLatestEvent(result)
          }
        }
      }

      throw new Error(
        `Unexpected config value for event name '${eventName}'. Config value: ${JSON.stringify(configValue)}`,
      )
    }

  const createUnconfiguredEventHandler = (eventName: string) => () => {
    setLatestEvent(eventName)
  }

  useEffect(() => {
    let eventsToListen: string[] = []
    if (Array.isArray(eventConfig)) {
      eventsToListen = eventConfig
    } else if (typeof eventConfig === 'object') {
      eventsToListen = Object.keys(eventConfig)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (eventConfig === undefined) {
      eventsToListen = eventEmitter.eventNames() as string[]
    }

    const createEventHandler =
      eventConfig === undefined || Array.isArray(eventConfig)
        ? createUnconfiguredEventHandler
        : getCreateConfiguredEventHandler(eventConfig)
    const listeners = eventsToListen
      .map((eventName) => {
        let listener: (...args: unknown[]) => void
        try {
          listener = createEventHandler(eventName)
        } catch {
          return
        }
        eventEmitter.addListener(eventName, listener)
        return { eventName, listener }
      })
      .filter(
        (
          listenerIfValid,
        ): listenerIfValid is NonNullable<typeof listenerIfValid> =>
          !!listenerIfValid,
      )

    return () => {
      listeners.forEach(({ eventName, listener }) => {
        eventEmitter.removeListener(eventName, listener)
      })
    }
  }, [eventEmitter, eventConfig])

  return latestEvent
}