import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/navbar");
    }

    getFriends(friendsIds: Array<string>) {
        return super.post('/getFriends', friendsIds);
    }

    getMainSearchResults(searchInput: string) {
        let details = { searchInput };

        return super.post('/getMainSearchResults', details);
    }

    getMainSearchResultsWithImages(ids: any) {
        return super.post('/getMainSearchResultsWithImages', ids);
    }

    getUserMessagesNotifications() {
        return super.get('/getUserMessagesNotifications');
    }

    updateMessagesNotifications(messagesNotifications: any) {
        let details = { messagesNotifications };

        super.post('/updateMessagesNotifications', details);
    }

    removeMessagesNotifications(messagesNotifications: any) {
        let details = { messagesNotifications };

        super.post('/removeMessagesNotifications', details);
    }

    getUserFriendRequests() {
        return super.get('/getUserFriendRequests');
    }

    addFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/addFriendRequest', details);
    }

    removeFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/removeFriendRequest', details);
    }

    ignoreFriendRequest(friendId: string) {
        let details = { friendId };

        return super.post('/ignoreFriendRequest', details);
    }

    addFriend(friendId: string) {
        let details = { friendId };

        return super.post('/addFriend', details);
    }

    removeFriendRequestConfirmAlert(confirmedFriendsIds: Array<string>) {
        let data = { confirmedFriendsIds };

        return super.put('/removeFriendRequestConfirmAlert', data);
    }
}