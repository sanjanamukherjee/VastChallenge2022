import React, { useEffect } from "react";
import * as d3 from "d3";

import "./Beeswarm.css";
import jobsJson from "../../data/jobs.json";

const animationDuration = 1000;

let dataJobs = null;

const beeswarm = {
    chartOffsetX: 50,
    chartOffsetY: 0,
    chartWidth: 1100,
    chartHeight: 525,
    chartXLabelOffsetY: 50,
    tooltipOffsetX: -5,
    tooltipOffsetY: -5,
    circleMinRadius: 8,
    circleMaxRadius: 32,

    chart: null,
    xScale: null,
    xAxis: null,
    xLabel: null,
    rScale: null,
    tooltip: null,
};

function partitionData(dataArray, key) {
    let groups = dataArray.reduce((acc, obj) => {
        if (!acc[obj[key]]) acc[obj[key]] = [];
        acc[obj[key]].push(obj);
        return acc;
    }, {});

    return Object.values(groups);
}

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

function timeDecimalToStr(timeDecimal, roundMinutes = true) {
    let hours = Math.floor(timeDecimal);
    let minutes = Math.floor((timeDecimal - hours) * 60);
    let seconds = Math.floor(((timeDecimal - hours) * 60 - minutes) * 60);

    if (roundMinutes) {
        if (seconds >= 30) minutes += 1;
        seconds = 0;

        if (minutes === 60) {
            hours += 1 % 24;
            minutes = 0;
        }
    }

    let amOrPm = (hours < 12 || hours === 24) ? 'AM' : 'PM';

    if (hours > 12) {
        hours -= 12;
    }
    if (hours === 0) {
        hours = 12;
    }

    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    let timeString = '';
    if (roundMinutes) {
        timeString = `${hours}:${minutes} ${amOrPm}`;
    } else {
        seconds = seconds.toString().padStart(2, '0');
        timeString = `${hours}:${minutes}:${seconds} ${amOrPm}`;
    }

    return timeString;
}

function eduLevelStrToInt(eduLevelString) {
    switch (eduLevelString) {
        case 'Low': return 0;
        case 'HighSchoolOrCollege': return 1;
        case 'Bachelors': return 2;
        case 'Graduate': return 3;
        default: return '';
    }
}

function eduLevelIntToStr(eduLevelInteger) {
    switch (eduLevelInteger) {
        case 0: return 'Low';
        case 1: return 'HighSchoolOrCollege';
        case 2: return 'Bachelors';
        case 3: return 'Graduate';
        default: return -1;
    }
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
}

function initBeeswarmChart() {
    const svg = d3.select('#beeswarm svg');

    beeswarm.chart = svg.append('g')
        .attr('transform', `translate(${beeswarm.chartOffsetX}, ${beeswarm.chartOffsetY})`);

    beeswarm.xScale = d3.scaleBand()
        .range([0, beeswarm.chartWidth]);

    beeswarm.xAxis = beeswarm.chart.append('g')
        .attr('transform', `translate(0, ${beeswarm.chartHeight})`)
        .call(d3.axisBottom(beeswarm.xScale));

    beeswarm.xLabel = beeswarm.chart.append('g')
        .attr('transform', `translate(${beeswarm.chartWidth / 2}, ${beeswarm.chartHeight + beeswarm.chartXLabelOffsetY})`)
        .append('text')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Education Requirement');

    beeswarm.rScale = d3.scaleSqrt()
        .range([beeswarm.circleMinRadius, beeswarm.circleMaxRadius]);

    beeswarm.tooltip = d3.select('body')
        .append('div')
        .attr('id', 'beesarmTooltip')
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

async function drawBeeswarmChart() {
    if (beeswarm.chart === null) initBeeswarmChart();

    let chartData = Object.values(dataJobs);

    const partitioned = partitionData(chartData, 'eduReq');
    for (const arr of partitioned) {
        arr.sort((a, b) => b.hourlyRate - a.hourlyRate);
        arr.splice(50);
    }
    chartData = partitioned.flat();

    const xAxisDomain = new Set();
    let circleMaxR = -Infinity;
    let circleMinR = Infinity;
    for (const d of chartData) {
        xAxisDomain.add(d.eduReq);
        circleMaxR = Math.max(d.hourlyRate, circleMaxR);
        circleMinR = Math.min(d.hourlyRate, circleMinR);
    }

    beeswarm.xScale.domain([...xAxisDomain].sort((a, b) => eduLevelStrToInt(a) - eduLevelStrToInt(b)));
    beeswarm.xAxis
        .transition()
        .duration(animationDuration)
        .call(d3.axisBottom(beeswarm.xScale));

    beeswarm.rScale.domain([circleMinR, circleMaxR]);

    for (const d of chartData) {
        d.x = beeswarm.xScale(d.eduReq) + beeswarm.xScale.bandwidth() / 2;
        d.y = beeswarm.chartHeight / 2;
    }

    d3.select('body').classed('cursorWait', true);
    console.time('beeswarm:sim');
    const simulation = d3.forceSimulation(chartData)
        .alpha(1)
        .alphaDecay(0.05)
        .alphaMin(1e-3)
        .force('x', d3.forceX((d) => beeswarm.xScale(d.eduReq) + beeswarm.xScale.bandwidth() / 2).strength(0.5))
        .force('y', d3.forceY(beeswarm.chartHeight / 2).strength(0.2))
        .force('collide', d3.forceCollide((d) => 1 + beeswarm.rScale(d.hourlyRate)).strength(0.5).iterations(2));
    await new Promise(resolve => { simulation.on('end', resolve); });
    console.timeEnd('beeswarm:sim');
    d3.select('body').classed('cursorWait', false);

    function buildTooltipHtml(d) {
        return `
            <strong>Job ID: ${d.jobId}</strong>
            <br>
            Employer ID: ${d.employerId}
            <br>
            Wage: $${d.hourlyRate.toFixed(2)} per hour
            <br>
            Start Time: ${timeDecimalToStr(d.startTime)}
            <br>
            End Time: ${timeDecimalToStr(d.startTime)}
            <br>
            Week Days: ${d.weekDays}
            <br>
            Education Requirement: ${d.eduReq}
        `;
    }

    beeswarm.chart
        .selectAll('.myCircle')
        .data(chartData, (d) => d.jobId)
        .join('circle')
        .attr('class', 'myCircle')
        .style('fill', '#594328') // OR #316688
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 0)
        .on('mouseover', (event, d) => {
            beeswarm.tooltip
                .html(buildTooltipHtml(d))
                .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
                .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`)
                .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
            beeswarm.tooltip
                .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
                .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`);
        })
        .on('mouseout', () => {
            beeswarm.tooltip.style('visibility', 'hidden');
        })
        .transition()
        .duration(animationDuration)
        .attr('r', (d) => beeswarm.rScale(d.hourlyRate));

    beeswarm.chart
        .selectAll('.mySector')
        .data(chartData, (d) => d.jobId)
        .join('path')
        .attr('class', 'mySector')
        .style('fill', '#F7F54E') // OR #91FFA0
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .on('mouseover', (event, d) => {
            beeswarm.tooltip
                .html(buildTooltipHtml(d))
                .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
                .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`)
                .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
            beeswarm.tooltip
                .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
                .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`);
        })
        .on('mouseout', () => {
            beeswarm.tooltip.style('visibility', 'hidden');
        })
        .transition()
        .duration(animationDuration)
        .attrTween('d', (d) => {
            const radiusInterpolator = d3.interpolate(0, beeswarm.rScale(d.hourlyRate));
            const buildArc = d3.arc()
                .innerRadius(0)
                .startAngle(d.startTime / 12 * 2 * Math.PI)
                .endAngle(d.endTime / 12 * 2 * Math.PI);
            return (t) => buildArc({ outerRadius: radiusInterpolator(t) });
        });

    beeswarm.chart
        .selectAll('.myStartLine')
        .data(chartData, (d) => d.jobId)
        .join('line')
        .attr('class', 'myStartLine')
        .style('stroke', '#00FFFF')
        .style('stroke-width', 3)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .on('mouseover', (event, d) => {
            beeswarm.tooltip
                .html(buildTooltipHtml(d))
                .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
                .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`)
                .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
            beeswarm.tooltip
                .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
                .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`);
        })
        .on('mouseout', () => {
            beeswarm.tooltip.style('visibility', 'hidden');
        })
        .transition()
        .duration(animationDuration)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d) => beeswarm.rScale(d.hourlyRate) * Math.cos(d.startTime / 12 * 2 * Math.PI - Math.PI / 2))
        .attr('y2', (d) => beeswarm.rScale(d.hourlyRate) * Math.sin(d.startTime / 12 * 2 * Math.PI - Math.PI / 2));
}

const Beeswarm = () => {
    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        drawBeeswarmChart();
    }, []);

    return (
        <div id="beeswarm">
            <svg></svg>
        </div>
    )
}

export default Beeswarm;
