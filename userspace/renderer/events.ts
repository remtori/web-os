export const EventMapSymbol = Symbol('EventMap');

export type EventMap = Map<string, Set<EventListener>>;

class EventManager {
	constructor() {}
}

export const eventManager = new EventManager();
