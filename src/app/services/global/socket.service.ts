import { Injectable } from "@angular/core";

declare const io: any;

@Injectable()
export class SocketService {
    private socket: any;

    initialize() {
        this.socket = io();
    }

    isSocketExists() {
        return !!this.socket;
    }

    private convertArrayToString(params: any[]): string {
        let paramsString = '';

        if (!params || params.length == 0) {
            return null;
        }
        else {
            params.forEach((param: any) => {
                if (typeof (param) == "object") {
                    paramsString += JSON.stringify(param);
                }
                else if (typeof (param) == "string") {
                    paramsString += "'" + param + "'";
                }
                else {
                    paramsString += param.toString();
                }

                paramsString += ",";
            });

            return paramsString.substring(0, paramsString.length - 1);
        }
    }

    socketEmit(funcName: string, ...params: any[]) {
        let socketObjStr = this.socket ? "this.socket" : "io()";
        eval(socketObjStr + ".emit('" + funcName + "'," + this.convertArrayToString(params) + ");");
    }

    socketOn(name: string, func: Function) {
        this.socket && this.socket.on(name, func);
    }

    socketOff(names: Array<string>) {
        this.socket && names.forEach(name => this.socket.off(name));
    }

    isSocketConnect() {
        return (this.isSocketExists() && this.socket.connected);
    }

    // This function should be called in order to refresh
    // the client cookies (token) that the socket object contains.
    refreshSocket() {
        if (this.isSocketExists()) {
            this.socket.disconnect();
            this.socket.connect();
            this.socket.emit('login');
        }
    }

    deleteSocket() {
        if (this.isSocketExists()) {
            this.socket.destroy();
            this.socket = null;
        }
    }
}