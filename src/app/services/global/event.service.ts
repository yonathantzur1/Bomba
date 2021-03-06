import { Injectable } from '@angular/core';

class Event {
    public id: string;
    public func: Function;

    constructor(id: string, func: Function) {
        this.id = id;
        this.func = func;
    }
}

@Injectable()
export class EventService {
    private events: Object = {};

    register(name: EVENT_TYPE, func: Function, eventsIds?: Array<string>) {
        let id: string = this.generateId();
        let event: Event = new Event(id, func);

        if (!this.events[name]) {
            this.events[name] = [event];
        }
        else {
            this.events[name].push(event);
        }

        eventsIds && eventsIds.push(id);
    }

    emit(name: EVENT_TYPE, data?: any) {
        const self = this;

        // Emit the event after view rendering.
        setTimeout(() => {
            let events: Array<Event> = self.events[name];

            events && events.forEach((event: Event) => {
                event.func(data);
            });
        }, 0);
    }

    unsubscribeEvents(eventsIds: Array<string>) {
        const self = this;

        Object.keys(self.events).forEach((name: string) => {
            self.events[name] = self.events[name].filter((event: Event) => {
                return !eventsIds.includes(event.id);
            });

            if (self.events[name].length == 0) {
                delete self.events[name];
            }
        });
    }

    private generateId() {
        let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }
}

export const enum EVENT_TYPE {
    TAB_CLICK, ADD_REQUEST_CARD, SAVE_REQUEST_CARD, CLOSE_CARD, DROP_REQUEST_CARD,
    ADD_REQUEST_CARD_TO_MATRIX, REMOVE_REQUEST, SET_DEFAULT_REQUEST_SETTINGS,
    ADD_PROJECT, EDIT_PROJECT, DELETE_PROJECT, CHANGE_REQUEST_CARD_AMOUNT,
    REQUESTS_SEND_MODE, DELETE_REPORT, EDIT_USER, DELETE_USER,
    CLOSE_TEST_REQUEST, CLOSE_REPORT_FOLDER, CLOSE_EDIT_VALUE, CLOSE_REPORT_DOCUMENT, DELETE_CELL,
    OPEN_REQUEST_EDIT, OPEN_REQUEST_VIEW, ADD_ENVIRONMENT, UPDATE_ENVIRONMENT,
    DELETE_ENVIRONMENT, ACTIVE_ENVIRONMENT, SELECT_ENVIRONMENT, CLOSE_CONTEXT_MENU
};