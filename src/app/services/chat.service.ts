import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ChatService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/chat");
    }

    getChat(idsArray: Array<string>) {
        let details = { "members": idsArray };

        return super.post('/getChat', details);
    }

    getChatPage(idsArray: Array<string>, currMessagesNum: number, totalMessagesNum: number) {
        let details = { "members": idsArray, currMessagesNum, totalMessagesNum };

        return super.post('/getChatPage', details);
    }

    getAllPreviewChats() {
        return super.get('/getAllPreviewChats');
    }
}