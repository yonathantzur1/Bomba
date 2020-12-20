import { Injectable } from '@angular/core';

import { SocketService } from './socket.service';

declare const $: any;

@Injectable()
export class GlobalService {
    private data = {};
    userGuid: string;
    isDarkMode: boolean = false;

    constructor(private socketService: SocketService) {
        this.initializeDarkMode();
    }

    initializeDarkMode() {
        this.setDarkMode(!!localStorage.getItem("darkMode"));
    }

    setDarkMode(isDarkMode: boolean) {
        if (this.isDarkMode = isDarkMode) {
            $("body").addClass("dark");
            localStorage.setItem("darkMode", "1");
        }
        else {
            $("body").removeClass("dark");
            localStorage.removeItem("darkMode");
        }
    }

    initialize() {
        if (!this.socketService.isSocketExists()) {
            this.socketService.initialize();
        }
    }

    resetGlobalVariables() {
        this.socketService.deleteSocket();
        this.userGuid = null;
    }

    setData(key: string, value: any) {
        this.data[key] = value;
    }

    getData(key: string) {
        const result = this.data[key];
        delete this.data[key];

        return result;
    }

    copyToClipboard(text: string) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    dynamicInput() {
        $("input").focus((event: any) => {
            $("#" + event.target.id).parent().addClass("is-focused");
        });

        $("input").blur((event: any) => {
            const inputElement = $("#" + event.target.id);
            inputElement.parent().removeClass("is-focused");

            if (inputElement.val()) {
                inputElement.parent().addClass("is-filled");
            }
            else {
                inputElement.parent().removeClass("is-filled");
            }
        });
    }
}