import React, { useEffect, useContext, useMemo } from "react";
import * as d3 from "d3";

import "./Beeswarm.css";
import { Data } from "../../Context";
import Spider from "./Spider";
// import jobsJson from "../../data/jobs.json";

const animationDuration = 1000;

let dataJobs = null;
let dataEmployers = null;
let chartBusy = false;
let spiderEmployerIdSetterFunc = null;
let selectedJobId = -1;

const beeswarm = {
    chartOffsetX: 50,
    chartOffsetY: 0,
    chartWidth: 1100,
    chartHeight: 400,
    chartXLabelOffsetY: 50,
    tooltipOffsetX: -5,
    tooltipOffsetY: -5,
    circleMinRadius: 8,
    circleMaxRadius: 27,
    circleColorOffTheClock: '#316688', //'#594328', // OR #316688
    circleColorOnTheClock: '#91FFA0',//'#F7F54E', // OR #91FFA0
    circleColorHover: '#FF0000',
    circleColorClick: '#2a4e97',
    lineColorStartTime: '#00FFFF',

    svg: null,
    chart: null,
    xScale: null,
    xAxis: null,
    xLabel: null,
    rScale: null,
    tooltip: null,
};

const beeswarmFocus = {
    chartOffsetX: 25,
    chartOffsetY: 25,
    chartWidth: 200,
    chartHeight: 200,
    hourTickLength: 10,
    hourTickWidth: 3,
    minuteTickLength: 7,
    minuteTickWidth: 1,
    hourLabelGap: 20,
    centreDotRadius: 5,
    hourHandGap: 35,
    hourHandWidth: 5,
    detailDefaultHtml: 'Hover over a bubble<br/>to see its details.<br/><br/>Click on a bubble to<br/>see employer spider chart.',

    chart: null,
    clockRadius: null,
    startHourHand: null,
    startHourHandLabel: null,
    endHourHandLabel: null,
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

// async function initData() {
//     dataJobs = {};
//     for (const row of Object.values(jobsJson)) {
//         const jobId = row['jobId'];
//         const employerId = row['employerId'];
//         const hourlyRate = row['hourlyRate'];
//         const startTime = timeStrToDecimal(row['startTime']);
//         const endTime = timeStrToDecimal(row['endTime']);
//         const weekDays = parseWeekDaysStr(row['daysToWork']);
//         const eduReq = row['educationRequirement'];

//         dataJobs[jobId] = {
//             jobId,
//             employerId,
//             hourlyRate,
//             startTime,
//             endTime,
//             weekDays,
//             eduReq,
//             participants: [],
//         };
//     }

//     dataJobsNetwork = {};
//     for (const job of Object.values(dataJobs)) {
//         const jobId = job.jobId;
//         const employerId = job.employerId;

//         if (dataJobsNetwork[employerId] === undefined) {
//             dataJobsNetwork[employerId] = [];
//         }
//         dataJobsNetwork[employerId].push(jobId);
//     }
// }

function initBeeswarmChart() {
    beeswarm.svg = d3.select('#beeswarmChart');

    beeswarm.chart = beeswarm.svg.append('g')
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
        .style('background-color', 'rgba(255, 255, 255, 50%)')
        .style('backdrop-filter', 'blur(8px)')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-color', 'black')
        .style('border-radius', '5px')
        .style('padding', '10px');
}

function initBeeswarmFocusChart() {
    const svg = d3.select('#beeswarmClock');

    beeswarmFocus.chart = svg.append('g')
        .attr('transform', `translate(${beeswarmFocus.chartOffsetX}, ${beeswarmFocus.chartOffsetY})`);

    beeswarmFocus.clockRadius = Math.min(beeswarmFocus.chartWidth, beeswarmFocus.chartHeight) / 2;

    beeswarmFocus.chart.append('circle')
        .attr('cx', beeswarmFocus.chartWidth / 2)
        .attr('cy', beeswarmFocus.chartHeight / 2)
        .attr('r', beeswarmFocus.clockRadius)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 2);

    beeswarmFocus.chart.append('circle')
        .attr('cx', beeswarmFocus.chartWidth / 2)
        .attr('cy', beeswarmFocus.chartHeight / 2)
        .attr('r', beeswarmFocus.centreDotRadius)
        .style('fill', 'white')
        .style('stroke', 'black')
        .style('stroke-width', beeswarmFocus.hourTickWidth);

    beeswarmFocus.chart.selectAll('.tick.hour')
        .data(d3.range(0, 12))
        .join('line')
        .attr('class', 'tick hour')
        .style('stroke', 'black')
        .style('stroke-width', beeswarmFocus.hourTickWidth)
        .attr('transform', (d) => `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${d * 30})`)
        .attr('y1', beeswarmFocus.clockRadius - beeswarmFocus.hourTickLength)
        .attr('y2', beeswarmFocus.clockRadius);

    beeswarmFocus.chart.selectAll('.tick.minute')
        .data(d3.range(0, 60))
        .join('line')
        .attr('class', 'tick minute')
        .style('stroke', 'black')
        .style('stroke-width', beeswarm.minuteTickWidth)
        .attr('transform', (d) => `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${d * 6})`)
        .attr('y1', beeswarmFocus.clockRadius - beeswarmFocus.minuteTickLength)
        .attr('y2', beeswarmFocus.clockRadius);

    beeswarmFocus.chart.selectAll('.label.hour')
        .data(d3.range(1, 12+1))
        .join('text')
        .attr('class', 'label hour')
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2})`)
        .attr('x', (d) => (beeswarmFocus.clockRadius - beeswarmFocus.hourLabelGap) * Math.cos(d * 30 / 180 * Math.PI - Math.PI / 2))
        .attr('y', (d) => (beeswarmFocus.clockRadius - beeswarmFocus.hourLabelGap) * Math.sin(d * 30 / 180 * Math.PI - Math.PI / 2))
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .text((d) => `${d}`);

    beeswarmFocus.startHourHand = beeswarmFocus.chart.append('line')
        .style('stroke', 'green')
        .style('stroke-width', beeswarmFocus.hourHandWidth)
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${90})`)
        .attr('y1', beeswarmFocus.centreDotRadius)
        .attr('y2', beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap)
        .style('visibility', 'hidden');

    beeswarmFocus.startHourHandLabel = beeswarmFocus.chart.append('text')
        .style('fill', 'green')
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${90 - 90})`)
        .attr('x', -beeswarmFocus.centreDotRadius - (beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap - beeswarmFocus.centreDotRadius) / 2)
        .attr('y', -beeswarmFocus.hourHandWidth)
        .style('text-anchor', 'middle')
        .text('START')
        .style('visibility', 'hidden');

    beeswarmFocus.endHourHand = beeswarmFocus.chart.append('line')
        .style('stroke', 'red')
        .style('stroke-width', beeswarmFocus.hourHandWidth)
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${-90})`)
        .attr('y1', beeswarmFocus.centreDotRadius)
        .attr('y2', beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap)
        .style('visibility', 'hidden');

    beeswarmFocus.endHourHandLabel = beeswarmFocus.chart.append('text')
        .style('fill', 'red')
        .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${-90 + 90})`)
        .attr('x', beeswarmFocus.centreDotRadius + (beeswarmFocus.clockRadius - beeswarmFocus.hourHandGap - beeswarmFocus.centreDotRadius) / 2)
        .attr('y', -beeswarmFocus.hourHandWidth)
        .style('text-anchor', 'middle')
        .text('STOP')
        .style('visibility', 'hidden');
}

async function drawBeeswarmChart() {
    if (beeswarm.chart === null) initBeeswarmChart();

    let chartData = Object.values(dataJobs);

    const partitioned = partitionData(chartData, 'eduReq');
    for (const arr of partitioned) {
        arr.sort((a, b) => b.hourlyRate - a.hourlyRate);
        arr.splice(30);
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

    console.debug('**** BEESWARM SIM START');
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
    console.debug('**** BEESWARM SIM FINISH');

    function buildTooltipHtml(d) {
        return `
            Job ID: <strong>${d.jobId}</strong>
            <br>
            Employer ID: <strong>${d.employerId}</strong>
            <br>
            Wage: <strong>$${d.hourlyRate.toFixed(2)} per hour</strong>
            <br>
            Start Time: <strong>${timeDecimalToStr(d.startTime)}</strong>
            <br>
            End Time: <strong>${timeDecimalToStr(d.endTime)}</strong>
            <br>
            Week Days: <strong>${d.weekDays}</strong>
            <br>
            Edu. Req.: <strong>${d.eduReq}</strong>
        `;
    }

    function handleMouseOver(event, d) {
        // beeswarm.tooltip
        //     .html(buildTooltipHtml(d))
        //     .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
        //     .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`)
        //     .style('visibility', 'visible');

        d3.select('#beeswarmDetail').html(buildTooltipHtml(d));

        drawBeeswarmFocusChart(d.jobId);

        const sameEmployerJobs = dataEmployers[d.employerId]?.jobs ?? [];
        beeswarm.chart
            .selectAll('.myCircle')
            .filter((d) => sameEmployerJobs.includes(d.jobId) && d.jobId !== selectedJobId)
            .style('fill', beeswarm.circleColorHover);
        beeswarm.chart
            .selectAll('.mySector')
            .filter((d) => sameEmployerJobs.includes(d.jobId) && d.jobId !== selectedJobId)
            .style('fill', beeswarm.circleColorHover);
    }

    function handleMouseMove(event, d) {
        // beeswarm.tooltip
        //     .style('left', `${event.pageX + beeswarm.tooltipOffsetX}px`)
        //     .style('top', `${event.pageY + beeswarm.tooltipOffsetY}px`);
    }

    function handleMouseOut(event, d) {
        // beeswarm.tooltip.style('visibility', 'hidden');

        d3.select('#beeswarmDetail').html(beeswarmFocus.detailDefaultHtml);

        drawBeeswarmFocusChart(-1);

        beeswarm.chart
            .selectAll('.myCircle')
            .style('fill', (d) => d.jobId === selectedJobId ? beeswarm.circleColorClick : beeswarm.circleColorOffTheClock)
            .style('opacity', (d) => d.jobId === selectedJobId ? 1 : (selectedJobId === -1 ? 1 : 0.5));
        beeswarm.chart
            .selectAll('.mySector')
            .style('fill', (d) => d.jobId === selectedJobId ? beeswarm.circleColorClick : beeswarm.circleColorOnTheClock)
            .style('opacity', (d) => d.jobId === selectedJobId ? 1 : (selectedJobId === -1 ? 1 : 0.5));
    }

    function handleClick(event, d) {
        // trigger spider chart
        spiderEmployerIdSetterFunc(d.employerId);

        selectedJobId = d.jobId;

        beeswarm.chart
            .selectAll('.myCircle')
            .style('fill', (d) => d.jobId === selectedJobId ? beeswarm.circleColorClick : beeswarm.circleColorOffTheClock)
            .style('opacity', (d) => d.jobId === selectedJobId ? 1 : 0.5);
        beeswarm.chart
            .selectAll('.mySector')
            .style('fill', (d) => d.jobId === selectedJobId ? beeswarm.circleColorClick : beeswarm.circleColorOnTheClock)
            .style('opacity', (d) => d.jobId === selectedJobId ? 1 : 0.5);

        handleMouseOver(null, d);

        event.stopPropagation();
    }

    beeswarm.chart
        .selectAll('.myCircle')
        .data(chartData, (d) => d.jobId)
        .join('circle')
        .attr('class', 'myCircle')
        .style('fill', beeswarm.circleColorOffTheClock)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('opacity', 1)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 0)
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick)
        .transition()
        .duration(animationDuration)
        .attr('r', (d) => beeswarm.rScale(d.hourlyRate));

    beeswarm.chart
        .selectAll('.mySector')
        .data(chartData, (d) => d.jobId)
        .join('path')
        .attr('class', 'mySector')
        .style('fill', beeswarm.circleColorOnTheClock)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('opacity', 1)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .on('mouseover', handleMouseOver)
        .on('mousemove',handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick)
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
        .style('stroke', beeswarm.lineColorStartTime)
        .style('stroke-width', 3)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick)
        .transition()
        .duration(animationDuration)
        .attr('x2', (d) => beeswarm.rScale(d.hourlyRate) * Math.cos(d.startTime / 12 * 2 * Math.PI - Math.PI / 2))
        .attr('y2', (d) => beeswarm.rScale(d.hourlyRate) * Math.sin(d.startTime / 12 * 2 * Math.PI - Math.PI / 2));

    beeswarm.svg.on('click', (event) => {
        selectedJobId = -1;

        beeswarm.chart
            .selectAll('.myCircle')
            .style('fill', beeswarm.circleColorOffTheClock)
            .style('opacity', 1);
        beeswarm.chart
            .selectAll('.mySector')
            .style('fill', beeswarm.circleColorOnTheClock)
            .style('opacity', 1);
    });
}

async function drawBeeswarmFocusChart(jobId) {
    if (beeswarmFocus.chart === null) initBeeswarmFocusChart();

    if (jobId === -1 || dataJobs[jobId] === undefined) {
        beeswarmFocus.startHourHand
            .style('visibility', 'hidden');

        beeswarmFocus.startHourHandLabel
            .style('visibility', 'hidden');

        beeswarmFocus.endHourHand
            .style('visibility', 'hidden');

        beeswarmFocus.endHourHandLabel
            .style('visibility', 'hidden');
    } else {
        const job = dataJobs[jobId];

        beeswarmFocus.startHourHand
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.startTime * 30 - 180})`);

        beeswarmFocus.startHourHandLabel
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.startTime * 30 - 90 - 180})`);

        beeswarmFocus.endHourHand
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.endTime * 30 - 180})`);

        beeswarmFocus.endHourHandLabel
            .style('visibility', 'visible')
            .attr('transform', `translate(${beeswarmFocus.chartWidth / 2}, ${beeswarmFocus.chartHeight / 2}) rotate(${job.endTime * 30 + 90 - 180})`);
    }
}

const Beeswarm = () => {
    // useEffect(() => {
        // initData();
    // }, []);

    // console.debug('**** BEESWARM INIT');
    // useEffect(() => {
    //     console.debug('**** BEESWARM MOUNT');

    //     return function() {
    //         console.debug('**** BEESWARM UNMOUNT');
    //     }
    // }, []);

    const d = useContext(Data);
    const contextJobsData = useMemo(() => d.jobsData, [d]);
    const contextEmployersData = useMemo(() => d.employersData, [d]);
    const contextSetSpiderEmployerId = useMemo(() => d.setSpiderEmployerId, [d]);

    useEffect(() => {
        const work = async () => {
            if (chartBusy) return;
            chartBusy = true;

            dataJobs = contextJobsData;
            dataEmployers = contextEmployersData;

            spiderEmployerIdSetterFunc = contextSetSpiderEmployerId;

            selectedJobId = -1;

            await Promise.all([drawBeeswarmChart(), drawBeeswarmFocusChart(-1)]);

            chartBusy = false;
        }
        work();
    }, [contextJobsData, contextEmployersData, contextSetSpiderEmployerId]);

    return (
        <div id="beeswarm"style={{display: "flex"}}>
            <div style={{display: "flex", flexDirection:"row", alignItems:"center"}}>
                <div id="beeswarmBox2">
                        <div id="beeswarmLegend">
                            <span style={{backgroundColor: beeswarm.circleColorOnTheClock}}>&emsp;&emsp;</span> Working hours
                            <br/>
                            <span style={{backgroundColor: beeswarm.circleColorOffTheClock}}>&emsp;&emsp;</span> Off-time
                            <br/>
                            <span style={{backgroundColor: beeswarm.lineColorStartTime}}>&emsp;&emsp;</span> Work start time
                            <br/>
                        </div>
                        <div id="beeswarmDetail" dangerouslySetInnerHTML={{ __html: beeswarmFocus.detailDefaultHtml }}></div>
                        <svg id="beeswarmClock"></svg>
                </div>
                <div style={{display:"flex", flexDirection: "column"}}>
                    <div id="beeswarmBox1">
                        <svg id="beeswarmChart"></svg>
                    </div>

                    <Spider/>
                </div>
            </div>
        </div>
    )
}

export default Beeswarm;
