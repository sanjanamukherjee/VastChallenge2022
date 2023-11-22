import React, { useEffect } from "react";
import * as d3 from "d3";

import "./Spider.css";
import jobsJson from "../../data/jobs.json";
import employersJson from "../../data/employers.json";
import participantsJson from "../../data/participants.json";
import participantsJobsJson from "../../data/participant_jobs.json";

const animationDuration = 1000;

let dataJobs = null;
let dataEmployers = null;
let dataParticipants = null;

const spider = {
    chartOffsetX: 150,
    chartOffsetY: 100,
    chartWidth: 500,
    chartHeight: 400,
    axisLabelOffset: 0.1,
    tooltipOffsetX: -5,
    tooltipOffsetY: -5,
    dotRadius: 5,

    chart: null,
    rScale: null,
    axisConfig: null,
    tooltip: null,
};

function timeStrToDecimal(timeString) {
    const parts = timeString.split(' ');
    const amOrPm = parts[1].toLowerCase();
    const timeParts = parts[0].split(':');

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    let time = hours + minutes / 60 + seconds / 3600;

    if (amOrPm === 'pm' && hours !== 12) {
        time += 12;
    }
    if (amOrPm === 'am' && hours === 12) {
        time -= 12;
    }

    return time;
}

function parseWeekDaysStr(weekDaysString) {
    const days = weekDaysString.substring(1, weekDaysString.length - 1).split(',');
    return days.map(day => {
        switch (day) {
            case 'Monday': return 'Mo';
            case 'Tuesday': return 'Tu';
            case 'Wednesday': return 'We';
            case 'Thursday': return 'Th';
            case 'Friday': return 'Fr';
            case 'Saturday': return 'Sa';
            case 'Sunday': return 'Su';
            default: return '';
        }
    });
}

async function initData() {
    dataJobs = {};
    for (const row of Object.values(jobsJson)) {
        const jobId = row['jobId'];
        const employerId = row['employerId'];
        const hourlyRate = row['hourlyRate'];
        const startTime = timeStrToDecimal(row['startTime']);
        const endTime = timeStrToDecimal(row['endTime']);
        const weekDays = parseWeekDaysStr(row['daysToWork']);
        const eduReq = row['educationRequirement'];

        dataJobs[jobId] = {
            jobId,
            employerId,
            hourlyRate,
            startTime,
            endTime,
            weekDays,
            eduReq,
            participants: [],
        };
    }

    dataEmployers = {};
    for (const row of Object.values(employersJson)) {
        const employerId = parseInt(row['employerId']);
        const buildingId = parseInt(row['buildingId']);

        dataEmployers[employerId] = {
            employerId,
            buildingId,
            jobs: [],
        };
    }

    dataParticipants = {};
    for (const row of Object.values(participantsJson)) {
        const participantId = parseInt(row['participantId']);
        const householdSize = parseInt(row['householdSize']);
        const haveKids = row['haveKids'] === 'TRUE';
        const age = parseInt(row['age']);
        const educationLevel = row['educationLevel'];
        const interestGroup = row['interestGroup'];
        const joviality = parseFloat(row['joviality']);

        dataParticipants[participantId] = {
            participantId,
            householdSize,
            haveKids,
            age,
            educationLevel,
            interestGroup,
            joviality,
            jobs: [],
        };
    }

    for (let [participantId, jobIdList] of Object.entries(participantsJobsJson)) {
        jobIdList = jobIdList.map(x => parseInt(x));

        dataParticipants[participantId].jobs.push(...jobIdList);

        for (const jobId of jobIdList) {
            dataJobs[jobId].participants.push(participantId);
        }
    }

    for (const job of Object.values(dataJobs)) {
        const employer = dataEmployers[job.employerId];
        employer.jobs.push(job.jobId);
    }
}

function initSpiderChart() {
    const svg = d3.select('#spider svg');

    spider.chart = svg.append('g')
        .attr('transform', `translate(${spider.chartOffsetX}, ${spider.chartOffsetY})`);

    spider.rScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, spider.chartHeight / 2]);
    let gridTicks = [0.2, 0.4, 0.6, 0.8, 1.0];

    spider.chart
        .selectAll(null)
        .data(gridTicks)
        .join('circle')
        .attr('cx', spider.chartWidth / 2)
        .attr('cy', spider.chartHeight / 2)
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .attr('r', (d) => spider.rScale(d));

    spider.axisConfig = [
        { key: 'headCount', label: 'Head Count', angle: 0 },
        { key: 'averageHourlyRate', label: 'Average Wage', angle: 0 },
        { key: 'averageAge', label: 'Average Age', angle: 0 },
        { key: 'averageJoviality', label: 'Average Joviality', angle: 0 },
    ];
    for (let i = 0; i < spider.axisConfig.length; i++) {
        const axis = spider.axisConfig[i];
        axis.angle = i / spider.axisConfig.length * 2 * Math.PI;
    }

    spider.chart
        .selectAll(null)
        .data(spider.axisConfig)
        .join('line')
        .attr('transform', `translate(${spider.chartWidth / 2}, ${spider.chartHeight / 2})`)
        .attr('stroke', 'gray')
        .attr('stroke-width', 1)
        .attr('x2', (d) => spider.rScale(1) * Math.cos(d.angle - Math.PI / 2))
        .attr('y2', (d) => spider.rScale(1) * Math.sin(d.angle - Math.PI / 2));

    function calcAxisLabelAlignment(angle) {
        const pi = Math.PI;
        const epsilon = 0.1 * pi;
        const alignment = {
            textAnchor: null,
            dominantBaseline: null,
        };

        if (angle <= epsilon || angle >= 2 * pi - epsilon) {
            alignment.textAnchor = 'middle';
            alignment.dominantBaseline = 'auto';
        } else if (angle >= epsilon && angle <= 0.5 * pi - epsilon) {
            alignment.textAnchor = 'start';
            alignment.dominantBaseline = 'auto';
        } else if (angle >= 0.5 * pi - epsilon && angle <= 0.5 * pi + epsilon) {
            alignment.textAnchor = 'start';
            alignment.dominantBaseline = 'middle';
        } else if (angle >= 0.5 * pi + epsilon && angle <= pi - epsilon) {
            alignment.textAnchor = 'start';
            alignment.dominantBaseline = 'hanging';
        } else if (angle >= pi - epsilon && angle <= pi + epsilon) {
            alignment.textAnchor = 'middle';
            alignment.dominantBaseline = 'hanging';
        } else if (angle >= pi + epsilon && angle <= 1.5 * pi - epsilon) {
            alignment.textAnchor = 'end';
            alignment.dominantBaseline = 'hanging';
        } else if (angle >= 1.5 * pi - epsilon && angle <= 1.5 * pi + epsilon) {
            alignment.textAnchor = 'end';
            alignment.dominantBaseline = 'middle';
        } else if (angle >= 1.5 * pi + epsilon && angle <= 2 * pi - epsilon) {
            alignment.textAnchor = 'end';
            alignment.dominantBaseline = 'auto';
        }

        return alignment;
    }

    spider.chart
        .selectAll(null)
        .data(spider.axisConfig)
        .join('text')
        .attr('transform', `translate(${spider.chartWidth / 2}, ${spider.chartHeight / 2})`)
        .style('text-anchor', (d) => calcAxisLabelAlignment(d.angle).textAnchor)
        .style('dominant-baseline', (d) => calcAxisLabelAlignment(d.angle).dominantBaseline)
        .style('font-weight', 'bold')
        .html((d) => d.label)
        .attr('x', (d) => spider.rScale(1 + spider.axisLabelOffset) * Math.cos(d.angle - Math.PI / 2))
        .attr('y', (d) => spider.rScale(1 + spider.axisLabelOffset) * Math.sin(d.angle - Math.PI / 2));

    spider.tooltip = d3.select('body')
        .append('div')
        .attr('id', 'spiderTooltip')
        .style('visibility', 'hidden')
        .style('position', 'absolute')
        .style('left', '0px')
        .style('top', '0px')
        .style('transform', 'translate(-100%, -100%)')
        .style('width', 'max-content')
        .style('height', 'max-content')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-color', 'black')
        .style('border-radius', '5px')
        .style('padding', '10px');
}

async function drawSpiderChart() {
    if (spider.chart === null) initSpiderChart();

    const SELECTED_EMPLOYER_ID = 383;

    // Fill with same properties as keys in `spider.axisConfig`.
    const employerStats = {};
    for (const employer of Object.values(dataEmployers)) {
        employerStats[employer.employerId] = {};

        let headCount = 0;
        let totalHourlyRate = 0;
        let totalAge = 0;
        let totalJoviality = 0;
        for (const jobId of employer.jobs) {
            const job = dataJobs[jobId];
            headCount += job.participants.length;
            totalHourlyRate += job.participants.length * job.hourlyRate;
            totalAge += d3.sum(job.participants.map((participantId) => dataParticipants[participantId].age));
            totalJoviality += d3.sum(job.participants.map((participantId) => dataParticipants[participantId].joviality));
        }
        employerStats[employer.employerId].headCount = headCount;
        employerStats[employer.employerId].averageHourlyRate = totalHourlyRate / headCount;
        employerStats[employer.employerId].averageAge = totalAge / headCount;
        employerStats[employer.employerId].averageJoviality = totalJoviality / headCount;
    }

    const selectedEmployerStats = {};
    const averageEmployerStats = {};
    const maxEmployerStats = {};
    for (const axis of spider.axisConfig) {
        const key = axis.key;
        const arr = Object.values(employerStats).map((employer) => employer[key]);
        averageEmployerStats[key] = d3.mean(arr);
        maxEmployerStats[key] = d3.max(arr);
        selectedEmployerStats[key] = employerStats[SELECTED_EMPLOYER_ID][key];
    }

    // Always: chartData[0] is average employer, chartData[1] is selected employer.
    const chartData = [{}, {}];
    for (const [index, stats] of [[0, averageEmployerStats], [1, selectedEmployerStats]]) {
        chartData[index].headCount = stats.headCount / maxEmployerStats.headCount;
        chartData[index].averageHourlyRate = stats.averageHourlyRate / maxEmployerStats.averageHourlyRate;
        chartData[index].averageAge = stats.averageAge / maxEmployerStats.averageAge;
        chartData[index].averageJoviality = stats.averageJoviality / maxEmployerStats.averageJoviality;
    }

    const buildTooltipHtml = () => {
        return `
            <strong>Employer ID: ${SELECTED_EMPLOYER_ID}</strong>
            <br>
            Head Count: ${selectedEmployerStats.headCount} employees [${averageEmployerStats.headCount.toFixed(2)}]
            <br>
            Average Wage: $${selectedEmployerStats.averageHourlyRate.toFixed(2)} per hour [${averageEmployerStats.averageHourlyRate.toFixed(2)}]
            <br>
            Average Age: ${selectedEmployerStats.averageAge.toFixed(2)} years [${averageEmployerStats.averageAge.toFixed(2)}]
            <br>
            Average Joviality: ${selectedEmployerStats.averageJoviality.toFixed(2)} [${averageEmployerStats.averageJoviality.toFixed(2)}]
            <br>
            Building ID: ${dataEmployers[SELECTED_EMPLOYER_ID].buildingId}
        `;
    }

    const buildPolyLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .radius(v => spider.rScale(v))
        .angle((v, i) => i / spider.axisConfig.length * 2 * Math.PI);

    function buildPolygon(d) {
        const polygon = spider.axisConfig.map(axis => d[axis.key]);
        return buildPolyLine(polygon);
    }

    spider.chart
        .selectAll('.myPolygon')
        .data(chartData)
        .join('path')
        .attr('class', 'myPolygon')
        .style('fill', (d, i) => i === 0 ? 'gray' : 'orange')
        .style("fill-opacity", 0.1)
        .style('stroke', (d, i) => i === 0 ? 'gray' : 'orange')
        .style('stroke-width', 3)
        .attr('transform', `translate(${spider.chartWidth / 2}, ${spider.chartHeight / 2})`)
        .attr('d', (d) => buildPolygon(d))
        .on('mouseover', (event) => {
            spider.tooltip
                .html(buildTooltipHtml())
                .style('left', `${event.pageX + spider.tooltipOffsetX}px`)
                .style('top', `${event.pageY + spider.tooltipOffsetY}px`)
                .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
            spider.tooltip
                .style('left', `${event.pageX + spider.tooltipOffsetX}px`)
                .style('top', `${event.pageY + spider.tooltipOffsetY}px`);
        })
        .on('mouseout', () => {
            spider.tooltip.style('visibility', 'hidden');
        });

    function extractPoints(chartData) {
        const points = [];
        for (let index = 0; index < chartData.length; index++) {
            const d = chartData[index];
            const arr = [];
            for (let i = 0; i < spider.axisConfig.length; i++) {
                const axis = spider.axisConfig[i];
                arr.push({
                    index: index,
                    radius: d[axis.key],
                    angle: i / spider.axisConfig.length * 2 * Math.PI,
                });
            }
            points.push(...arr);
        }

        return points;
    }

    spider.chart
        .selectAll('.myDot')
        .data(extractPoints(chartData))
        .join('circle')
        .attr('class', 'myDot')
        .style('fill', (d) => d.index === 0 ? 'gray' : 'orange')
        .attr('transform', `translate(${spider.chartWidth / 2}, ${spider.chartHeight / 2})`)
        .attr('cx', (d) => spider.rScale(d.radius) * Math.cos(d.angle - Math.PI / 2))
        .attr('cy', (d) => spider.rScale(d.radius) * Math.sin(d.angle - Math.PI / 2))
        .attr('r', spider.dotRadius);
}

const Spider = () => {
    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        drawSpiderChart();
    }, []);

    return (
        <div id="spider">
            <svg></svg>
        </div>
    )
}

export default Spider;
