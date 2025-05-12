export class EventListener<EventListenerName> {
    private eventListeners: any = {};
    addEventListener = (type: EventListenerName, listener: (...args: any[]) => any) => {
        this.eventListeners[type] ||= [];
        this.eventListeners[type].push(listener);
    }
    _callEventListeners = (type: EventListenerName, ...args: any[]) => {
        this.eventListeners[type]?.forEach((listener: (...args: any[]) => any) => {
            listener(...args);
        });
    }
}