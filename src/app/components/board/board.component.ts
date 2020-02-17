import { Component, OnDestroy } from '@angular/core';
import { Request } from '../card/card.component'
import { BoardService } from '../../services/board.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'board',
    templateUrl: './board.html',
    providers: [BoardService],
    styleUrls: ['./board.css']
})

export class BoardComponent implements OnDestroy {
    requestCards: Array<Request> = [];
    isShowCard: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private boardService: BoardService,
        private eventService: EventService) {

        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD, (card: Request) => {
            this.requestCards.push(card);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_REQUEST_CARD, () => {
            this.isShowCard = false;
        }, this.eventsIds);

        let req: Request = new Request();
        req.name = "Check Hierarchy 1";
        req.url = "127.0.0.1:9000/Query";

        let req2: Request = new Request();
        req2.name = "Check Hierarchy2";
        req2.url = "127.0.0.1:9000/Query";

        let req3: Request = new Request();
        req3.name = "Check Hierarchy3";
        req3.url = "127.0.0.1:9000/Query";

        // this.requestCards.push(req);
        // this.requestCards.push(req2);
        // this.requestCards.push(req3);
        // this.requestCards.push(req);
        // this.requestCards.push(req2);
        // this.requestCards.push(req3);
        // this.requestCards.push(req);
        // this.requestCards.push(req2);
        // this.requestCards.push(req3);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }
}