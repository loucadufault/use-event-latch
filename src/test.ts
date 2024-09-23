import { EventEmitter } from "events"
import { useEventLatch } from "."

import TypedEmitter from 'typed-emitter'

type MyEvents2 = {
  statusChange: (newStatus: string) => void
}

declare interface MyEe {
  on<E extends keyof MyEvents2> (event: E, listener: MyEvents2[E]): this
}

class MyEe extends EventEmitter {

}

const myEe=new MyEe()

type MyEvents = {
  error: (error: Error) => void;
  message: (from: string, content: string) => void;
}

const myEmitter = new EventEmitter() as TypedEmitter<MyEvents>;
myEmitter.on

const res  = useEventLatch(myEmitter, {
  message: 'foo',
  error: 'bar',
})