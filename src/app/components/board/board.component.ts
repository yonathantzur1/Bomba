import { Component, OnInit, OnDestroy } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { Router, ActivatedRoute } from '@angular/router';

import { Request } from '../requestCard/requestCard.component';

import interact from 'interactjs';

@Component({
    selector: 'board',
    templateUrl: './board.html',
    providers: [BoardService],
    styleUrls: ['./board.css']
})

export class BoardComponent implements OnInit, OnDestroy {
    dropzoneInteract: any;
    draggableInteract: any;

    projectId: string;
    matrix: Array<Array<Request>>;
    requests: Array<Request>;

    isLoading: boolean = false;
    isDataLoaded: boolean = false;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private eventService: EventService,
        private snackbarService: SnackbarService,
        private boardService: BoardService) { }

    ngOnInit() {
        enableDragAndDrop(this);

        // In case of route params changed.
        this.route.params.subscribe(params => {
            this.projectId = params["id"];

            this.isLoading = true;

            this.boardService.getProjectBoard(this.projectId).then(result => {
                this.isLoading = false;

                if (!result) {
                    this.snackbarService.snackbar("Server error occurred");
                    this.router.navigateByUrl('');
                }
                else {
                    // In case matrix exists.
                    if (result.matrix) {
                        this.mapMatrix(result.matrix);
                        this.matrix = result.matrix;
                    } else {
                        this.matrix = [[new Request(true)]];
                    }

                    // In case requests exist.
                    if (result.requests) {
                        this.mapRequests(result.requests);
                        this.requests = result.requests;
                    } else {
                        this.requests = [];
                    }

                    this.isDataLoaded = true;
                }
            });
        });
    }

    mapMatrix(matrix: any) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                matrix[i][j] = this.convertJsonToObject(matrix[i][j]);
            }
        }
    }

    mapRequests(requests: any) {
        for (let i = 0; i < requests.length; i++) {
            requests[i] = this.convertJsonToObject(requests[i]);
        }
    }

    convertJsonToObject(request: any): Request {
        if (request.isEmpty) {
            return new Request(true);
        }
        else {
            return new Request().setValues(request.id, request.name, request.method,
                request.url, request.body, request.amount);
        }
    }

    ngOnDestroy() {
        this.dropzoneInteract.unset();
        this.draggableInteract.unset();
    }

    dropRequestCard(cardId: string, matrixCellId: string) {
        let data = {
            requestIndex: this.getRequestCardIndexFromId(cardId),
            cellIndex: this.getMatrixCellIndexFromId(matrixCellId)
        };

        this.eventService.emit(EVENT_TYPE.DROP_REQUEST_CARD, data);
    }

    getRequestCardIndexFromId(cardId: string): number {
        let cardIdParts = cardId.split("-");

        return parseInt(cardIdParts[cardIdParts.length - 1]);
    }

    getMatrixCellIndexFromId(matrixCellId: string): Array<number> {
        let matrixIdParts = matrixCellId.split("-");
        let i = parseInt(matrixIdParts[matrixIdParts.length - 2]);
        let j = parseInt(matrixIdParts[matrixIdParts.length - 1]);

        return [i, j];
    }
}

function enableDragAndDrop(self: any) {
    // enable draggables to be dropped into this
    self.dropzoneInteract = interact('.dropzone').dropzone({
        overlap: 0.4,

        ondropactivate: event => {
            // add active dropzone feedback
            event.target.classList.add('drop-active');
        },
        ondragenter: event => {
            let dropzoneElement = event.target;

            // feedback the possibility of a drop
            dropzoneElement.classList.add('drop-target');
        },
        ondragleave: event => {
            let dropzoneElement = event.target;

            // remove the drop feedback style
            dropzoneElement.classList.remove('drop-target');
        },
        ondrop: event => {
            let draggableElement = event.relatedTarget;
            let dropzoneElement = event.target;

            self.dropRequestCard(draggableElement.id, dropzoneElement.id);

        },
        ondropdeactivate: event => {
            // remove active dropzone feedback
            event.target.classList.remove('drop-active');
            event.target.classList.remove('drop-target');
        }
    });

    self.draggableInteract = interact('.draggable').draggable({
        inertia: false,
        autoScroll: true,
        onmove: dragMoveListener,
        onstart: event => {
            event.currentTarget.style.position = "fixed";
        },
        onend: event => {
            event.currentTarget.remove();
        }
    }).on("down", event => {
        let original = event.currentTarget;

        original.setAttribute('allowDrag', 'true');
        original.onmouseleave = () => {
            original.setAttribute('allowDrag', 'false');
            original.onmouseleave = null;
        };
    }).on("move", elementMoveListener);
}

function elementMoveListener(event: any) {
    let interaction = event.interaction;
    let original = event.currentTarget;

    if (interaction.pointerIsDown &&
        !interaction.interacting() &&
        original.getAttribute('allowDrag') == 'true' &&
        original.getAttribute('clonable') != 'false') {
        let clone = original.cloneNode(true);
        clone.style.width = "135px";
        clone.style.height = "135px";
        clone.style.fontSize = "12px";
        clone.style.position = "absolute";
        clone.style.right = window.innerWidth - original.getBoundingClientRect().right + "px";
        clone.style.top = original.getBoundingClientRect().top + "px";
        original.parentElement.appendChild(clone);
        interaction.start({ name: 'drag' }, event.interactable, clone);
    }
}

function dragMoveListener(event: any) {
    let target = event.target

    // keep the dragged position in the data-x/data-y attributes
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

    // update the position attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}