import { Injectable } from '@angular/core';

import { SocketService } from './socket.service';

@Injectable()
export class GlobalService {
    private data = {};

    constructor(private socketService: SocketService) { }

    initialize() {
        if (!this.socketService.isSocketExists()) {
            this.socketService.initialize();
        }
    }

    resetGlobalVariables() {
        this.socketService.deleteSocket();
    }

    setData(key, value) {
        this.data[key] = value;
    }

    getData(key) {
        if (this.data[key]) {
            // Deep copy data value.
            let result = JSON.parse(JSON.stringify(this.data[key]));
            delete this.data[key];

            return result;
        }
        else {
            return null;
        }
    }
}