import { Component } from '@angular/core';

import { TrackerService } from '../../../services/admin/tracker.service';
import { DateService } from '../../../services/global/date.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { STATISTICS_RANGE, LOG_TYPE } from '../../../enums';

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

export class TrackerComponent {
    validationFuncs: Array<InputFieldValidation>;

    menus: Array<any> = [];
    chart: any;
    chartTitle: string;
    selectedOptionIndex: number;
    datesRange: Object;
    datesRangeString: string;
    datesRangeMovementIndex: number = 0;
    usernameInput: string;
    username: string;
    isUsernameFound: boolean;
    isLoadingChart: boolean;
    chartData: ChartData = new ChartData(
        LOG_TYPE.LOGIN,
        STATISTICS_RANGE.WEEKLY,
        "Logins"
    );

    constructor(private dateService: DateService,
        private trackerService: TrackerService,
        private microtextService: MicrotextService) {
        const self = this;

        this.validationFuncs = [
            {
                isFieldValid(username: string) {
                    return !!username;
                },
                errMsg: "Please enter username",
                fieldId: "username-micro",
                inputId: "user-search"
            }
        ];

        this.menus = [
            {
                id: "charts",
                title: "Graphs",
                icon: "far fa-chart-bar",
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
                    self.openModal(this.id);
                    self.saveCurrentSelectedOption(this.options);
                },
                onCancel: function () {
                    self.restoreSelectedOption(this.options);
                },
                onConfirm: function (options: Array<any>) {
                    self.closeModal(this.id);

                    let option;

                    for (let i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }

                    if (option) {
                        self.chartData.logType = option.logType;
                        self.chartData.chartName = option.text;

                        self.loadChartAgain();
                    }
                }
            },
            {
                id: "charts-time",
                title: "Time Units",
                icon: "far fa-clock",
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
                    self.openModal(this.id);
                    self.saveCurrentSelectedOption(this.options);
                },
                onCancel: function () {
                    self.restoreSelectedOption(this.options);
                },
                onConfirm: function (options: Array<any>) {
                    self.closeModal(this.id);
                    let option;

                    for (let i = 0; i < options.length; i++) {
                        if (options[i].isSelected) {
                            option = options[i];
                            break;
                        }
                    }

                    if (option) {
                        self.chartData.statisticsRange = option.statisticsRange;

                        if (self.chart != null) {
                            self.loadChartAgain();
                        }
                    }
                }
            },
            {
                id: "charts-user-search",
                title: "Search User",
                icon: "fas fa-search",
                type: "user-search",
                isLoaderActive: false,
                isShow: function () {
                    return !!self.chart;
                },
                onClick: function () {
                    self.openModal(this.id);
                },
                onCancel: function () {
                    self.usernameInput = null;
                    self.isUsernameFound = null;
                    self.hideMicrotext("username-micro");
                },
                isDisableConfirm: function () {
                    return (self.usernameInput ? false : true);
                },
                onConfirm: function () {
                    if (!this.isLoaderActive &&
                        self.usernameInput &&
                        self.microtextService.validation(self.validationFuncs,
                            self.usernameInput)) {
                        this.isLoaderActive = true;
                        self.trackerService.isUserExists(self.usernameInput).then((isExists: boolean) => {
                            this.isLoaderActive = false;
                            self.isUsernameFound = !!isExists;

                            if (isExists) {
                                // Setting the username for the chart filter.
                                self.username = self.usernameInput;

                                self.loadChartAgain();
                                self.usernameInput = null;
                                self.closeModal(this.id);
                            }
                        });
                    }
                }
            }
        ];
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
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
                    display: false,
                    labels: {
                        fontFamily: 'Rubik',
                        fontColor: '#4b4b4b',
                        fontSize: 18,
                        boxWidth: 0
                    },
                    onClick: (event: any) => event.stopPropagation()
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    selectOption(options: Array<any>, index: number) {
        options.forEach(option => {
            option.isSelected = false;
        });

        options[index].isSelected = true;
    }

    openModal(modalId: string) {
        $("#" + modalId).modal("show");
    }

    closeModal(modalId: string) {
        $("#" + modalId).modal("hide");
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