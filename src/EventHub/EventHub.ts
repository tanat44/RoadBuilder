import EventEmitter from "eventemitter3";
import {SystemEvent} from "./SystemEvent";
import {Event} from "./Event";

export class EventHub extends EventEmitter<Event, SystemEvent> {}
export const Hub = new EventHub()
