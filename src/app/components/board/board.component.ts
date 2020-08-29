import { Component, OnInit, OnDestroy } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { Router, ActivatedRoute } from '@angular/router';

import { Request } from '../requestCard/requestCard.component';
import { DefaultSettings } from '../requestSettings/requestSettings.component';
import { Environment } from '../environments/environments.component';

declare let interact: any;

@Component({
    selector: 'board',
    templateUrl: './board.html',
    providers: [BoardService],
    styleUrls: ['./board.css']
})

export class BoardComponent implements OnInit, OnDestroy {
    dropzoneInteract: any;
    emptyDropzoneInteract: any;
    draggableInteract: any;

    projectId: string;
    projectName: string;
    matrix: Request[][];
    requests: Array<Request>;
    report: any;
    defaultSettings: DefaultSettings;
    environments: Array<Environment>;
    maxRequestAmount: number;

    isLoading: boolean = false;
    isSendMode: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private route: ActivatedRoute,
        private eventService: EventService,
        private socketService: SocketService,
        private globalService: GlobalService,
        private snackbarService: SnackbarService,
        private boardService: BoardService) {

        this.eventService.emit(EVENT_TYPE.TAB_CLICK, "/");

        this.eventService.register(EVENT_TYPE.REQUESTS_SEND_MODE, (mode: boolean) => {
            this.isSendMode = mode;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.SET_DEFAULT_REQUEST_SETTINGS,
            (defaultSettings: DefaultSettings) => {
                this.defaultSettings = defaultSettings;
            }, this.eventsIds);

        eventService.register(EVENT_TYPE.ADD_ENVIRONMENT, (environment: Environment) => {
            this.environments.push(environment);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.UPDATE_ENVIRONMENT, (data: any) => {
            for (let i = 0; i < this.environments.length; i++) {
                if (this.environments[i].name == data.currEnvName) {
                    this.environments[i] = data.environment;
                    break;
                }
            }
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DELETE_ENVIRONMENT, (envName: string) => {
            this.environments = this.environments.filter(env => {
                return env.name != envName;
            });
        }, this.eventsIds);
    }

    ngOnInit() {
        enableDragAndDrop(this);

        // In case of route params changed.
        this.route.params.subscribe(params => {
            this.projectId = params["id"];
            this.isLoading = true;

            this.boardService.getProjectBoard(this.projectId).then(project => {
                this.isLoading = false;

                if (!project) {
                    this.snackbarService.snackbar("Server error occurred");
                    this.router.navigateByUrl('');
                    return;
                }
                else {
                    this.projectName = project.name;
                    this.matrix = this.mapMatrix(project.matrix);
                    this.requests = this.mapRequests(project.requests);
                    this.defaultSettings = project.defaultSettings;
                    this.environments = project.environments;
                    this.maxRequestAmount = project.maxRequestAmount;
                }

                if (project.report) {
                    this.report = project.report;
                    this.isSendMode = true;
                }
                else {
                    this.isSendMode = false;
                }
            });

        });

        this.socketService.socketOn("syncMatrix", (data: any) => {
            if (this.isSyncAllow(data.projectId, data.userGuid)) {
                this.matrix = this.mapMatrix(data.matrix);
            }
        });

        this.socketService.socketOn("syncRequests", (data: any) => {
            if (this.isSyncAllow(data.projectId, data.userGuid)) {
                this.requests = this.mapRequests(data.requests);
            }
        });

        this.socketService.socketOn("syncDefaultSettings", (data: any) => {
            if (this.isSyncAllow(data.projectId, data.userGuid)) {
                this.defaultSettings = data.defaultSettings;
            }
        });
    }

    ngOnDestroy() {
        this.dropzoneInteract.unset();
        this.emptyDropzoneInteract.unset();
        this.draggableInteract.unset();
        this.eventService.unsubscribeEvents(this.eventsIds);
        this.socketService.socketOff("syncMatrix");
        this.socketService.socketOff("syncRequests");
        this.socketService.socketOff("syncDefaultSettings");
    }

    isSyncAllow(projectId: string, userGuid: string) {
        return (this.projectId == projectId && this.globalService.userGuid != userGuid);
    }

    mapMatrix(matrix: any) {
        if (matrix) {
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    matrix[i][j] = new Request().copy(matrix[i][j]);
                }
            }

            return matrix;
        }
        else {
            return [[new Request(true)]];
        }
    }

    mapRequests(requests: any) {
        if (requests) {
            for (let i = 0; i < requests.length; i++) {
                requests[i] = new Request().copy(requests[i]);
            }

            return requests;
        }
        else {
            return [];
        }
    }

    dropRequestCard(cardId: string, matrixCellId: string) {
        const data = {
            requestIndex: this.getRequestCardIndexFromId(cardId),
            cellIndex: this.getMatrixCellIndexFromId(matrixCellId)
        };

        this.eventService.emit(EVENT_TYPE.DROP_REQUEST_CARD, data);
    }

    getRequestCardIndexFromId(cardId: string): number {
        const cardIdParts = cardId.split("-");

        return parseInt(cardIdParts[cardIdParts.length - 1]);
    }

    getMatrixCellIndexFromId(matrixCellId: string): Array<number> {
        const matrixIdParts = matrixCellId.split("-");
        const i = parseInt(matrixIdParts[matrixIdParts.length - 2]);
        const j = parseInt(matrixIdParts[matrixIdParts.length - 1]);

        return [i, j];
    }
}

function enableDragAndDrop(self: any) {
    self.emptyDropzoneInteract = interact('.empty-dropzone').dropzone({});

    // enable draggables to be dropped into this
    self.dropzoneInteract = interact('.dropzone').dropzone({
        overlap: 0.5,

        ondropactivate: (event: any) => {
            // add active dropzone feedback
            event.target.classList.add('drop-active');
        },
        ondragenter: (event: any) => {
            const dropzoneElement = event.target;

            // feedback the possibility of a drop
            dropzoneElement.classList.add('drop-target');
        },
        ondragleave: (event: any) => {
            const dropzoneElement = event.target;

            // remove the drop feedback style
            dropzoneElement.classList.remove('drop-target');
        },
        ondrop: (event: any) => {
            const draggableElement = event.relatedTarget;
            const dropzoneElement = event.target;

            self.dropRequestCard(draggableElement.id, dropzoneElement.id);

        },
        ondropdeactivate: (event: any) => {
            // remove active dropzone feedback
            event.target.classList.remove('drop-active');
            event.target.classList.remove('drop-target');
        }
    });

    self.draggableInteract = interact('.draggable').draggable({
        inertia: false,
        autoScroll: true,
        onmove: dragMoveListener,
        onstart: (event: any) => {
            event.currentTarget.style.position = "fixed";
        },
        onend: (event: any) => {
            event.currentTarget.remove();
        }
    }).on("move", elementMoveListener);
}

function elementMoveListener(event: any) {
    let interaction = event.interaction;
    let original = event.currentTarget;

    if (interaction.pointerIsDown && !interaction.interacting()) {
        let clone = original.cloneNode(true);

        // Remove all icons from clone element.
        let deleteChildElements = [];

        clone.childNodes.forEach((node: any) => {
            if (node.nodeName == "I") {
                deleteChildElements.push(node);
            }
        });

        deleteChildElements.forEach(child => {
            clone.removeChild(child);
        });

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