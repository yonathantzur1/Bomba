import { Component, OnDestroy } from '@angular/core';

import { TrackerService } from '../../../services/admin/tracker.service';
import { DateService } from '../../../services/global/date.service';
import { MicrotextService, InputValidation } from '../../../services/global/microtext.service';

import { STATISTICS_RANGE, LOG_TYPE } from '../../../enums';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { GlobalService } from 'src/app/services/global/global.service';

declare const $: any;
declare const Chart: any;

class ChartData {
    logType: LOG_TYPE;
    statisticsRange: STATISTICS_RANGE;
    chartName: string;

    constructor(
        logType: LOG_TYPE,
        statisticsRange: STATISTICS_RANGE,
        chartName: string) {
        this.logType = logType;
        this.statisticsRange = statisticsRange;
        this.chartName = chartName;
    }
}

@Component({
    selector: 'tracker',
    templateUrl: './tracker.html',
    providers: [TrackerService],
    styleUrls: ['./tracker.css']
})

export class TrackerComponent implements OnDestroy {
    validations: Array<InputValidation>;

    menus: Array<any> = [];
    chart: any;
    chartTitle: string;
    selectedOptionIndex: number;
    datesRange: Object;
    datesRangeString: string;
    datesRangeMovementIndex: number = 0;
    usernameInput: string;
    username: string;
    isLoadingChart: boolean;
    chartData: ChartData = new ChartData(
        LOG_TYPE.LOGIN,
        STATISTICS_RANGE.WEEKLY,
        "Logins"
    );

    eventIds: Array<string> = [];

    constructor(private dateService: DateService,
        private globalService: GlobalService,
        private eventService: EventService,
        private trackerService: TrackerService,
        private microtextService: MicrotextService) {
        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.menus.forEach(menu => {
                menu.isOpen = false;
            });
        }, this.eventIds);

        const self = this;

        this.validations = [
            {
                isFieldValid(username: string) {
                    return !!username;
                },
                errMsg: "Please enter username.",
                fieldId: "username-micro",
                inputId: "user-search"
            }
        ];

        this.menus = [
            {
                title: "Graphs",
                icon: "far fa-chart-bar",
                width: 460,
                height: 250,
                isOpen: false,
                options: [
                    {
                        text: "Logins",
                        logType: LOG_TYPE.LOGIN,
                        isSelected: true
                    },
                    {
                        text: "Wrong Logins",
                        logType: LOG_TYPE.LOGIN_FAIL,
                    },
                    {
                        text: "New Users",
                        logType: LOG_TYPE.REGISTER,
                    },
                    {
                        text: "Projects Runs",
                        logType: LOG_TYPE.PROJECT_RUN,
                    }
                ],
                onClick: function () {
                    this.isOpen = true;
                    self.saveCurrentSelectedOption(this.options);
                },
                onCancel: function () {
                    this.isOpen = false;
                    self.restoreSelectedOption(this.options);
                },
                onConfirm: function (options: Array<any>) {
                    this.isOpen = false;
                    const selectedOption = options.find(option => option.isSelected);

                    if (selectedOption) {
                        self.chartData.logType = selectedOption.logType;
                        self.chartData.chartName = selectedOption.text;

                        self.loadChartAgain();
                    }
                }
            },
            {
                title: "Time Units",
                icon: "far fa-clock",
                width: 400,
                height: 180,
                isOpen: false,
                options: [
                    {
                        text: "Weekly",
                        statisticsRange: STATISTICS_RANGE.WEEKLY,
                        isSelected: true
                    },
                    {
                        text: "Yearly",
                        statisticsRange: STATISTICS_RANGE.YEARLY,
                    }
                ],
                onClick: function () {
                    this.isOpen = true;
                    self.saveCurrentSelectedOption(this.options);
                },
                onCancel: function () {
                    this.isOpen = false;
                    self.restoreSelectedOption(this.options);
                },
                onConfirm: function (options: Array<any>) {
                    this.isOpen = false;
                    const selectedOption = options.find(option => option.isSelected);

                    if (selectedOption) {
                        self.chartData.statisticsRange = selectedOption.statisticsRange;

                        if (self.chart != null) {
                            self.loadChartAgain();
                        }
                    }
                }
            },
            {
                title: "Search User",
                icon: "fas fa-search",
                type: "user-search",
                width: 400,
                height: 180,
                isOpen: false,
                isLoaderActive: false,
                isShow: function () {
                    return !!self.chart;
                },
                onClick: function () {
                    this.isOpen = true;
                    setTimeout(() => {
                        self.globalService.dynamicInput();
                    }, 0);
                },
                onCancel: function () {
                    this.isOpen = false;
                },
                isDisableConfirm: function () {
                    return !!!self.usernameInput || this.isLoaderActive;
                },
                onConfirm: function () {
                    if (!this.isLoaderActive &&
                        self.usernameInput &&
                        self.microtextService.validation(self.validations,
                            self.usernameInput)) {
                        this.isLoaderActive = true;
                        self.trackerService.isUserExists(self.usernameInput).then((isExists: boolean) => {
                            this.isLoaderActive = false;

                            if (isExists) {
                                // Setting the username for the chart filter.
                                self.username = self.usernameInput;

                                self.loadChartAgain();
                                self.usernameInput = null;
                                this.isOpen = false;
                            } else {
                                self.microtextService.showMicrotext("username-micro", "User was not found.")
                            }
                        });
                    }
                }
            }
        ];
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventIds);
    }

    loadChart(chartData: ChartData, datesRange?: Object) {
        this.datesRange = datesRange || this.calculateDatesRangeByRangeType(chartData.statisticsRange);
        let clientTimeZone = new Date().getTimezoneOffset();
        this.isLoadingChart = true;

        this.trackerService.getChartData(chartData.logType,
            chartData.statisticsRange,
            this.datesRange,
            clientTimeZone,
            this.username).then(data => {
                this.isLoadingChart = false;
                this.initializeChart(chartData.chartName,
                    chartData.statisticsRange,
                    this.datesRange, data);
            });
    }

    initializeChart(name: string, range: STATISTICS_RANGE, datesRange: Object, data: Array<number>) {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chartTitle = name;
        this.datesRangeString = getDateString(datesRange["startDate"]) + " - " + getDateString(datesRange["endDate"]);

        let labels;

        switch (range) {
            case STATISTICS_RANGE.YEARLY: {
                labels = this.dateService.months;
                break;
            }
            case STATISTICS_RANGE.WEEKLY: {
                labels = this.dateService.days;
                break;
            }
            default: {
                console.error("The range " + range + "is not valid");
            }
        }

        let ctx = "statistics-chart";
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: name,
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(13, 255, 51, 0.2)',
                        'rgba(25, 25, 193, 0.2)',
                        'rgba(255, 222, 3, 0.2)',
                        'rgba(49, 232, 230, 0.2)',
                        'rgba(230, 28, 67, 0.2)',
                        'rgba(191, 165, 162, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(13, 255, 51, 1)',
                        'rgba(25, 25, 193, 1)',
                        'rgba(255, 222, 3, 1)',
                        'rgba(49, 232, 230, 1)',
                        'rgba(230, 28, 67, 1)',
                        'rgba(191, 165, 162, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                color: this.getThemeBorderColor()
                            },
                            ticks: {
                                fontColor: this.getThemeTextColor()
                            }
                        }],
                    yAxes: [
                        {
                            gridLines: {
                                color: this.getThemeBorderColor()
                            },
                            ticks: {
                                fontColor: this.getThemeTextColor(),
                                beginAtZero: true
                            }
                        }]
                }
            }
        });
    }

    getThemeTextColor() {
        return this.globalService.isDarkMode ? "#f8f8f8" : "#4b4b4b";
    }

    getThemeBorderColor() {
        return this.globalService.isDarkMode ? "rgb(107, 107, 107, 0.6)" : "rgba(0, 0, 0, 0.1)";
    }

    selectOption(options: Array<any>, index: number) {
        options.forEach(option => {
            option.isSelected = false;
        });

        options[index].isSelected = true;
    }

    saveCurrentSelectedOption(options: Array<any>) {
        options.forEach((option, index) => {
            if (option.isSelected) {
                this.selectedOptionIndex = index;
            }
        });
    }

    restoreSelectedOption(options: Array<any>) {
        options.forEach((option, index) => {
            option.isSelected = (index == this.selectedOptionIndex);
        });
    }

    calculateDatesRangeByRangeType(range: STATISTICS_RANGE): Object {
        // Reset date ranges page for the calculate of the current date by range.
        this.datesRangeMovementIndex = 0;

        let currDate = new Date();
        let result: any = {
            "startDate": null,
            "endDate": null
        }

        switch (range) {
            case STATISTICS_RANGE.YEARLY: {
                let currentYear = currDate.getFullYear();
                result["startDate"] = new Date(currentYear, 0, 1);
                result["endDate"] = new Date(currentYear, 11, 31);
                return result;
            }
            case STATISTICS_RANGE.WEEKLY: {
                result["startDate"] = getStartOfWeek(currDate);
                result["endDate"] = getEndOfWeek(currDate);
                return result
            }
            default: {
                return null;
            }
        }
    }

    getNextDatesRangePeriod() {
        if (this.datesRangeMovementIndex != 0) {
            this.datesRangeMovementIndex++;
            let startDate: Date = this.datesRange["startDate"];
            let endDate: Date = this.datesRange["endDate"];

            switch (this.chartData.statisticsRange) {
                case STATISTICS_RANGE.WEEKLY: {
                    startDate.setDate(startDate.getDate() + 7);
                    endDate.setDate(endDate.getDate() + 7);

                    break;
                }
                case STATISTICS_RANGE.YEARLY: {
                    startDate.setFullYear(startDate.getFullYear() + 1);
                    endDate.setFullYear(endDate.getFullYear() + 1);

                    break;
                }
            }

            this.loadChart(this.chartData, this.datesRange);
        }
    }

    getPreviousDatesRangePeriod() {
        this.datesRangeMovementIndex--;
        let startDate = this.datesRange["startDate"];
        let endDate = this.datesRange["endDate"];

        switch (this.chartData.statisticsRange) {
            case STATISTICS_RANGE.WEEKLY: {
                startDate.setDate(startDate.getDate() - 7);
                endDate.setDate(endDate.getDate() - 7);

                break;
            }
            case STATISTICS_RANGE.YEARLY: {
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate.setFullYear(endDate.getFullYear() - 1);

                break;
            }
        }

        this.loadChartAgain(this.datesRange);
    }

    clearUserChart() {
        this.username = null;
        this.loadChartAgain();
    }

    // Full loading the chart objects and data.
    // May send data range object to control the dates of chart.
    loadChartAgain(datesRange?: Object) {
        this.loadChart(this.chartData, datesRange);
    }

    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}

function getStartOfWeek(date: Date) {
    // Copy date if provided, or use current date if not
    date = date ? new Date(+date) : new Date();
    date.setHours(0, 0, 0, 0);

    // Set date to previous Sunday
    date.setDate(date.getDate() - date.getDay());

    return date;
}

function getEndOfWeek(date: Date) {
    date = getStartOfWeek(date);
    date.setDate(date.getDate() + 6);
    date.setHours(23, 59, 59, 99);

    return date;
}

function getDateString(date: Date) {
    let day: any = date.getDate();
    let month: any = date.getMonth() + 1;
    let year: any = date.getFullYear();

    if (day < 10) {
        day = "0" + day;
    }

    if (month < 10) {
        month = "0" + month;
    }

    return (day + "/" + month + "/" + year);
}