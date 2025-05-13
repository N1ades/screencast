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
    removeEventListener = (type: EventListenerName, listener: (...args: any[]) => any) => {
        if (!this.eventListeners[type]) return;
        this.eventListeners[type] = this.eventListeners[type].filter((l: (...args: any[]) => any) => l !== listener);
    }

    once = (type: EventListenerName, listener: (...args: any[]) => any) => {
        const onceListener = (...args: any[]) => {
            listener(...args);
            this.removeEventListener(type, onceListener);
        }
        this.addEventListener(type, onceListener);
    }

    off = this.removeEventListener;
    on = this.addEventListener;
}