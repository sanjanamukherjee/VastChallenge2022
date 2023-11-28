import React, {useEffect, useRef, useContext, useState} from "react";


import * as d3 from "d3";
// import data from "../../data/participants.json"
import { Data } from "../../Context";

const ParallelAxis = () => {
    // ////console.clear();
    const {participantsData : data,setParticipantsID,participantsID}= useContext(Data);
    ////console.log('The data received from network is  ',participantsID);
    // const data = d.participantsData
    // .slice(0,100)yy
    ;
    const ref = useRef();
    const {setParticipantsPieData} = useContext(Data);
   var parallelSvg = d3.select(ref.current);
var globalNetworkCall = false;  
    const [prevParticipantsID, setPrevParticipantsID] = useState(null);
let paths = parallelSvg.selectAll(".myPath");
    useEffect(() => {
        if (participantsID && paths) {
            // If there was a previously selected participant, trigger 'mouseout' on their path
            if (prevParticipantsID) {
                const prevPathElement = paths.filter(d => d.participantId === prevParticipantsID).node();
                if (prevPathElement) {
                    prevPathElement.dispatchEvent(new Event('mouseout'));
                }
            }
            // ////console.log('value of data is ',paths,function(d)
            // {
            //     return d;
            // });
            // Trigger 'click' on the newly selected participant's path
            const pathElement = paths.filter(
                function(d)
                {
                    ////console.log('checking value of d ',d.participantId,' being checked agains ',participantsID, ' returning ',d.participantId === participantsID);
                    return d.participantId === participantsID;
                }
                // d => d.participantId === participantsID
                )
                .node()
                ;

                ////console.log('Thus pathelemetn is ',pathElement);
            if (pathElement) {
                ////console.log(pathElement);
                ////console.log('Calling log event ');
                globalNetworkCall = true;
                                ////console.log('Calling log event ');
                pathElement.dispatchEvent(new Event('click'));
            }
    
            // Update prevParticipantsID
            setPrevParticipantsID(participantsID);
        }
    }, [participantsID, paths, prevParticipantsID]);
    var dimensions;
    var Parallelg;
    var x;
    var y;

    const axisRef = useRef(null);

    useEffect(() => {


        parallelSvg = d3.select(ref.current);

        const width = +parallelSvg.attr("width");
        const height = +parallelSvg.attr("height");

        // ////console.log('Value of data for parallel plot is ',data);
        // ////console.log('Value of height ',height/2);
        // Parallelg = svg.append("g").attr("transform", translate(${width / 2}, ${-15}));

        let dataArray = Object.values(data);

        if (dataArray && dataArray[0]) {
            dimensions = Object.keys(dataArray[0]).filter(function(d) {
                return ["joviality", "age", "Travel", "Wage", "participant_id"].includes(d);
            });
        }

        y = {};

        if (dimensions) {
            dimensions.forEach((name) => {
                if (dataArray.every(d => d.hasOwnProperty(name)) && name !== "participant_id") {
                    y[name] = d3.scaleLinear()
                        .domain(d3.extent(dataArray, d => +d[name]))
                        .range([250, 0]);
        }
    });
}

        if(dimensions)
        {
        x = d3.scalePoint()
        .range([-650, width])
        .padding(2)
        .domain(dimensions);
        }
        if(dataArray.length > 0){
        function path(d) {

            return d3.line()(dimensions.map(function(p) {

                return [x(p), y[p](d[p])]; }));
        }

    let highlighted = [];
    const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
    var toggleHighlight = function(event, d){
        console.log("global is  ",globalNetworkCall);

        const item = {
            [d.participantId]: {
                ...d
            }
        }
        setParticipantsPieData(item);
        
        ////console.log("global is  ",globalNetworkCall);
        // ////console.log()
        if(globalNetworkCall)
        {
            ////console.log('Global call')
            highlighted.forEach(path => {
                d3.select(path)
                    // .transition().duration(200)
                    .style("stroke", function(d)
                    {
                        // ////console.log('Enter called with data ');
                        if (d.age >= 45) {
                            return colorScale("45-60");
                        }
                        else if (d.age >= 30 && d.age < 45) {
                            return colorScale("30-45");
                        }
                        else {
                            return colorScale("18-30");
                        }
                        // return "#69b3a2";
                    })
                    .style("opacity", "1");
                });

            highlighted.push(this);
            d3.select(this)
                // .transition().duration(200)
                .style("stroke", "black")
                .style("stroke-width",2)
                .style("opacity", "1");
            globalNetworkCall = false;
            return;
        }
        setParticipantsID(d.participantId);
        highlighted.forEach(path => {
            d3.select(path)
                // .transition().duration(200)
                .style("stroke", function(d)
                    {
                        // ////console.log('Enter called with data ');
                        if (d.age >= 45) {
                            return colorScale("45-60");
                        }
                        else if (d.age >= 30 && d.age < 45) {
                            return colorScale("30-45");
                        }
                        else {
                            return colorScale("18-30");
                        }
                        // return "#69b3a2";
                    })
                .style("opacity", "1");
        });

        
        // If the current path is already highlighted, unhighlight it
        if (highlighted.includes(this)) {
            ////console.log("line 127");
            const index = highlighted.indexOf(this);
            if (index > -1) {
                highlighted.splice(index, 1);
            }
            d3.select(this)
                // .transition().duration(200)
                .style("stroke", function(d)
                    {
                        // ////console.log('Enter called with data ');
                        if (d.age >= 45) {
                            return colorScale("45-60");
                        }
                        else if (d.age >= 30 && d.age < 45) {
                            return colorScale("30-45");
                        }
                        else {
                            return colorScale("18-30");
                        }
                        // return "#69b3a2";
                    })
                .style("opacity", "1");
        } else {
            ////console.log("line 137");
            // Unhighlight all paths
            highlighted.forEach(path => {
                d3.select(path)
                    // .transition().duration(200)
                    .style("stroke", function(d)
                    {
                        // ////console.log('Enter called with data ');
                        if (d.age >= 45) {
                            return colorScale("45-60");
                        }
                        else if (d.age >= 30 && d.age < 45) {
                            return colorScale("30-45");
                        }
                        else {
                            return colorScale("18-30");
                        }
                        // return "#69b3a2";
                    })
                    .style("opacity", "1");
            });
    
            // Clear the highlighted array
            highlighted = [];
    
            // Highlight the current path (change its color to green) and add it to the hhlighted array
            if (!highlighted.includes(this)) {
                ////console.log("line 151");
                // Highlight the current path (change its color to black) and add it to the highlighted array
                highlighted.push(this);
                d3.select(this)
                    // .transition().duration(200)
                    .style("stroke", "black")
                    .style("stroke-width",2)
                    .style("opacity", "1");
            }
        }
    }
        // ////console.log("Width is ", width);
        // ////console.clear();
        ////console.log('Data received is ',dataArray);
            let paths = parallelSvg.selectAll(".parallelGClass")
            .data(dataArray,function(d) { return d.participantId; })
            .join(
                enter => {
                    var parallelG = enter.append("g").attr("class","parallelGClass").attr("transform", `translate(${width / 2}, ${-15})`)
                    parallelG.append("path")
                    .classed("myPath",true)
                    // .attr("d", 0)
                    // .transition()
                    // .duration(1000)
                    .attr("d", path)
                    .attr("transform", "translate(0,50)")
                    .style("fill", "none")
                    .style("stroke", function(d)
                    {
                        // ////console.log('Enter called with data ');
                        if (d.age >= 45) {
                            return colorScale("45-60");
                        }
                        else if (d.age >= 30 && d.age < 45) {
                            return colorScale("30-45");
                        }
                        else {
                            return colorScale("18-30");
                        }
                        // return "#69b3a2";
                    })
                    // .style("opacity", 0.5)
                    // .style("cursor", "pointer")
                    // .on("mouseover",highlight)
                    // .on("mouseout", doNotHighlight)
                    .on("mouseover",(e,d)=>{
                        d3.selectAll(".myPath")
                        // .selectAll("path")
                            .style("opacity", "0.2")
                        
                        if(!highlighted.includes(e.currentTarget)){
                            d3.select(e.currentTarget)
                            // .selectAll("path")
                            .selectAll(".myPath")
                                .style("cursor", "pointer")
                                .style("stroke", "red")
                                .style("opacity", "1");
                        }
                        // highlight(d); 
                    } )
                    .on("mouseout", (e,d)=>{
                        if (!highlighted.includes(e.currentTarget)) {
                            d3.select(e.currentTarget)
                            // .selectAll("path")
                            .style("stroke", function(d)
                            {
                                // ////console.log('Enter called with data ');
                                if (d.age >= 45) {
                                    return colorScale("45-60");
                                }
                                else if (d.age >= 30 && d.age < 45) {
                                    return colorScale("30-45");
                                }
                                else {
                                    return colorScale("18-30");
                                }
                                // return "#69b3a2";
                            })
                                .style("opacity", "1");
                        }
                        d3.selectAll(".myPath")
                        // .selectAll("path")
                            .style("opacity", "1")
                        // doNotHighlight(d);
                    })
                    .on("click", function(event, d) {
                        globalNetworkCall = true;
                        toggleHighlight.call(this, event, d);
                    })
                },
                // Update
                update => update
                // .selectAll("path")
                    // .transition()
                    // .duration(1000)
                    .attr("d", path)
                    .attr("d", function(d)
                    {
                        // ////console.log('Update called with data ');
                        return path;
                    })
                    // .attr("transform", "translate(0,50)")
                    .on("mouseover",(e,d)=>{
                        d3.selectAll(".myPath")
                        // .selectAll("path")
                            .style("opacity", "0.2")

                        if(!highlighted.includes(e.currentTarget)){
                            d3.select(e.currentTarget)
                            .selectAll(".myPath")
                                .style("cursor", "pointer")
                                .style("stroke", "red")
                                .style("opacity", "1");
                        }
                        // highlight(d);
                    } )
                    .on("mouseout", (e,d)=>{
                        if (!highlighted.includes(e.currentTarget)) {
                            d3.select(e.currentTarget)
                            .selectAll("path")
                            .style("stroke", function(d)
                            {
                                // ////console.log('Enter called with data ');
                                if (d.age >= 45) {
                                    return colorScale("45-60");
                                }
                                else if (d.age >= 30 && d.age < 45) {
                                    return colorScale("30-45");
                                }
                                else {
                                    return colorScale("18-30");
                                }
                                // return "#69b3a2";
                            })
                                .style("opacity", "1");
                        }
                        d3.selectAll(".myPath")
                        .selectAll("path")
                            .style("opacity", "1")
                        // doNotHighlight(d);
                    })
                    .on("click", toggleHighlight)
                    ,
                // Exit
                exit => exit
                // .selectAll("path")
                .transition()
                .duration(1000)
                .remove()
            );

            if(!axisRef.current){
                axisRef.current =  parallelSvg.selectAll("myAxis")
            .attr("class", "myParallelAxis")
            .data(dimensions).join("g")
            .attr("transform", function(d) { return "translate(" + (x(d)+330 )+ "," + (34)+ ")"; })
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d.charAt(0).toUpperCase() + d.slice(1); })
            .style("fill", "black")
            }


        }

        else{
            parallelSvg.selectAll(".parallelGClass").remove();
        }



            },[data]);

            return (
                <div style={{margin: "10px"}}>
                    <svg ref={ref} className="parallel-svg" width="660" height="300" ></svg>
                </div>
            )
}

export default ParallelAxis;