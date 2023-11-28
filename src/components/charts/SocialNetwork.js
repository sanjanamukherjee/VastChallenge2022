// Network data code

// import React, { useContext } from "react";
import React, {useContext, useEffect, useRef, useState} from "react";
import NetworkDataJson from "../../data/participants.json";
import { Data } from "../../Context";
import * as d3 from "d3";



const SocialNetwork = () => {
    
    // console.clear();
    // console.log('Social Network called ');
   function handleCircleClick(circleElement, participantId) {
    const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
    // Reset all circles to normal state
    NewCircles.attr("opacity", 0.69)
        .attr("fill", d => {
            if (d.age >= 18 && d.age <= 30) {
                return colorScale("18-30");
            } else if (d.age > 30 && d.age <= 45) {
                return colorScale("30-45");
            } else if (d.age > 45 && d.age <= 60) {
                return colorScale("45-60");
            } else {
                return "black"; 
            }
        });

    // Highlight the clicked circle
    d3.select(circleElement)
        .attr("opacity", 1)
        .attr("fill", "green");

    setParticipantsID(participantId);
}

    // const NewCirclesRef = useRef();

    // ... (where you define NewCircles)
    var NetworkData;
    var Networkwidth;
    var Networkheight;
    var radiusScale;
    var tick;
    const [hasSimulationRun, setHasSimulationRun] = useState(false);

    const NewCirclesRef = useRef();
        const ref = useRef();
        const {participantsData,participantsID,setParticipantsID} = useContext(Data);
        // console.log('Data received from Parallel is  ',participantsID);
        const [prevParticipantsID, setPrevParticipantsID] = useState(null);
        const [clickedCircle, setClickedCircle] = useState(null);
        var externalClick = false;
useEffect(() => {
    const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
    if (!hasSimulationRun) {
        var simulation = d3.forceSimulation(NetworkData)
            .force("center", d3.forceCenter(Networkwidth / 2, Networkheight / 2))
            .force("x", d3.forceX(Networkwidth / 2).strength(0.1))
            .force("y", d3.forceY(Networkheight / 2).strength(0.1))
            .force("collide", d3.forceCollide(d => radiusScale(d.Wage))) 
            .alphaDecay(0.1)
            .alpha(0.03)
            .on("tick", tick);

        let init_decay = setTimeout(function() {
            console.log('Simuation is called');
            simulation.alphaDecay(0.1);
        }, 3000);

        setHasSimulationRun(true);
    }



    if (participantsID && NewCirclesRef.current) {
        // If there was a previously selected participant, trigger 'mouseout' on their circle
        if (prevParticipantsID) {
            const prevCircleElement = NewCirclesRef.current.filter(d => d.participantId === prevParticipantsID).node();
            if (prevCircleElement) {
                externalClick = true;
                prevCircleElement.dispatchEvent(new Event('mouseout'));
            }
        }

        // Trigger 'click' on the newly selected participant's circle
        const circleElement = NewCirclesRef.current.filter(d => d.participantId === participantsID).node();
        if (circleElement) {

            circleElement.dispatchEvent(new Event('click'));
        }

        // Update prevParticipantsID
        setPrevParticipantsID(participantsID);
    }
}, [participantsID, NewCirclesRef.current, prevParticipantsID]);








var NewCircles;
// ... (where you define NewCircles)


useEffect(() => {
    const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
    console.log('Called');
    if (participantsID && NewCirclesRef.current) {
        const circle = NewCirclesRef.current.filter(d => d.participantId === participantsID).node();
        if (circle) {
            circle.dispatchEvent(new Event('click'));
        }
    }
}, [participantsID, NewCirclesRef.current]);
    
    
    
    useEffect(() => {
        const colorScale = d3.scaleOrdinal().domain(["45-60","30-45","18-30"]).range(["#bebada","#ffffb3","#8dd3c7"])
        console.log(' Now called here ');
    
        // console.clear();

        
var NetworkData = Object.values(participantsData)
// .slice(0, 100)
;
NetworkData.sort((a, b) => b.age - a.age || b.joviality - a.joviality);

function getClosestNodes(d) {
    // console.log('network data for checking is ',NetworkData);
    let jovialityDifferences = NetworkData.map(node => ({
        node: node,
        difference: Math.abs(d.joviality - node.joviality)
    }));

    jovialityDifferences.sort((a, b) => a.difference - b.difference);

    // Select top 5 nodes
    let closestNodes = jovialityDifferences.slice(1, 6).map(item => item.node); // Exclude the first node because it's the hovered node itself
    // console.log('Closest 5 nodes are: ', closestNodes);
    return closestNodes;
}
// ...
// var NetworkData = Object.values(NetworkDataJson)
// .slice(0, 100)
// ;
// NetworkData.sort((a, b) => b.age - a.age || b.joviality - a.joviality);

let topParticipants = [];
let ageGroups = [...new Set(NetworkData.map(item => item.age))];

ageGroups.forEach(age => {
    let participants = NetworkData.filter(item => item.age === age);
    participants.sort((a, b) => b.joviality - a.joviality);
    for(let i = 0; i < 5 && i < participants.length; i++) {
        topParticipants.push(participants[i]);
    }
});
function calculateJovialityDifference(node1, node2) {
    return Math.abs(node1.joviality - node2.joviality);
}

function handleMouseClick(event, d) {
    // Reset all circles to normal state
    NewCircles.attr("opacity", 0.69)
        .attr("fill", d => {
            if (d.age >= 18 && d.age <= 30) {
                return colorScale("18-30");
            } else if (d.age > 30 && d.age <= 45) {
                return colorScale("30-45");
            } else if (d.age > 45 && d.age <= 60) {
                return colorScale("45-60");
            } else {
                return "black"; 
            }
        });

    // If the clicked circle is already highlighted, unhighlight it
    if (highlighted.includes(event.currentTarget)) {
        const index = highlighted.indexOf(event.currentTarget);
        if (index > -1) {
            highlighted.splice(index, 1);
        }
        d3.select(event.currentTarget).attr("opacity", 0.69);
    } else {
        // Unhighlight all circles
        highlighted.forEach(circle => {
            d3.select(circle).attr("opacity", 0.1);
        });
        // Clear the highlighted array
        highlighted = [];
        // Highlight the clicked circle
        highlighted.push(event.currentTarget);
        d3.select(event.currentTarget).attr("opacity", 1).attr("fill", "green");
    }

    setParticipantsID(d.participantId);
}
function internalClick(event, d) {
    simulation.stop();
    setParticipantsID(d.participantId);
    console.log('Called because of ',participantsID);
    if (highlighted.includes(this)) {
        const index = highlighted.indexOf(this);
        if (index > -1) {
            highlighted.splice(index, 1);
        }
        d3.select(this).attr("opacity", 0.69);
    } else {
        highlighted.forEach(circle => {
            d3.select(circle)
                .attr("opacity", 0.1);
        });
        highlighted = [];
        highlighted.push(this);
        d3.select(this).attr("opacity", 0.69);
    }
    handleMouseEvent(event, d);
}


function handleMouseEvent(event,d)
{
    // simulation.stop();
    // console.log('network data on line 57 ',NetworkData);
//     tooltip
//     .style("opacity",0.69)
// .html(<b>Participant ID:</b> ${d.participantId}<br><b>Age:</b> ${d.age}<br><b>Interest Group:</b> ${d.interestGroup})

    // .style("left", (d3.pointer(event)[0]+leftvar) + "px")
    // .style("top", (d3.pointer(event)[1] + 900) + "px");

    NewCircles.attr("opacity", 0.1);    

let jovialityDifferences = NetworkData.map(node => ({
node: node,
difference: calculateJovialityDifference(d, node)
}));



jovialityDifferences.sort((a, b) => a.difference - b.difference);
d3.select(this).attr("opacity", 0.69);

let closestNodes = jovialityDifferences.slice(1, 6).map(item => item.node); 


closestNodes.forEach(closestNode => {
    NewCircles.filter(node => node === closestNode).attr("opacity", 0.69);
});

closestNodes.forEach(closestNode => {
NetworkSVG.append("line")
.attr("x1", d.x+400)
.attr("y1", d.y+450)
.attr("x2", closestNode.x+400)
.attr("y2", closestNode.y+450)
.attr("stroke", "black")
.attr("opacity",.69);
});

}


        var NetworkSVG = d3.select(".network-svg");
        Networkwidth = +NetworkSVG.attr("width");
        Networkheight = +NetworkSVG.attr("height");
        
        var tooltip = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "100px")
        .style("height", "40px")
        .style("padding", "2px")
        .style("font", "12px sans-serif")
        .style("background", "lightsteelblue")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("pointer-events", "none");
    
    // Create line

    var leftvar = 300;
 
    var minWage = d3.min(NetworkData, d => d.Wage);
    var maxWage = d3.max(NetworkData, d => d.Wage);

    NetworkSVG.selectAll("rect").remove();
    NetworkSVG.selectAll("text").remove();


    var legend = NetworkSVG
      .append("g")
      .classed("legend", true)
      .attr("transform", "translate(10,10)");

    

    legend.append("rect")
    .attr("x", 0)
    .attr("y", 20) 
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale("45-60"))
    .style("stroke","black")
    .style("opacity",0.69)
    ;

legend.append("text")
    .attr("x", 20)
    .attr("y", 30) 
    .style("font-size", 11)
    .text("Age Group: 45-60");


    legend.append("rect")
    .attr("x", 0)
    .attr("y", 40) 
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale("30-45"))
    .style("stroke","black")
    .style("opacity",0.69);

legend.append("text")
.attr("x", 20)
.attr("y", 50) 
.style("font-size", 11)
    .text("Age Group: 30-45");

    legend.append("rect")
    .attr("x", 0)
    .attr("y", 60) 
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale("18-30"))
    .style("stroke","black")
    .style("opacity",0.69);

legend.append("text")
.attr("x", 20)
.attr("y", 70) 
.style("font-size", 11)
    .text("Age Group: 18-30");


    radiusScale = d3.scaleLinear()
    .domain([minWage, maxWage])
    .range([3, 8]);
// Here to 


let highlighted = [];

const toggleHighlight = function(event, d){

    if (highlighted.includes(this)) {
        const index = highlighted.indexOf(this);
        if (index > -1) {
            highlighted.splice(index, 1);
        }
        d3.select(this)
            .transition().duration(200)
            .style("fill", function(d) {
                if (d.age >= 18 && d.age <= 30) {
                    return colorScale("18-30");
                } else if (d.age > 30 && d.age <= 45) {
                    return colorScale("30-45");
                } else if (d.age > 45 && d.age <= 60) {
                    return colorScale("45-60");
                } else {
                    return "black"; 
                }
            })
            .style("opacity", "0.69");

        let closestNodes = getClosestNodes(d);
        closestNodes.forEach(closestNode => {
            NewCircles.filter(node => node === closestNode).style("fill", function(d) {
                if (d.age >= 18 && d.age <= 30) {
                    return colorScale("18-30");
                } else if (d.age > 30 && d.age <= 45) {
                    return colorScale("30-45");
                } else if (d.age > 45 && d.age <= 60) {
                    return colorScale("45-60");
                } else {
                    return "black"; 
                }
            })
            .style("opacity", "0.69");
        });
    } else {

        highlighted.push(this);
        d3.select(this)
            .transition().duration(200)
            .style("fill", "green")
            .style("opacity", "1");


        // console.log('Value of most recent data2 is ',NetworkData)
        let closestNodes = getClosestNodes(d);
        closestNodes.forEach(closestNode => {
            NewCircles.filter(node => node === closestNode).style("fill", "green").style("opacity", "1");
        });
    }
}

// console.log('Data being fed to network graph is ',NetworkData);

    NewCircles = NetworkSVG.selectAll("circle")
    .data(NetworkData, d => d.participantId)
    .join(
        enter => enter.append("circle")
            .each(d => d.isNew = true)
            // .attr("r",d=>0)
            // .attr("r",  d => radiusScale(d.Wage)) 
            .attr("fill",
            
            d => {
                if (d.age >= 18 && d.age <= 30) {
                    return colorScale("18-30");
                } else if (d.age > 30 && d.age <= 45) {
                    return colorScale("30-45");
                } else if (d.age > 45 && d.age <= 60) {
                    return colorScale("45-60");
                } else {
                    return "black"; 
                }
            }
            )
            .attr("opacity",0.69)
            .attr("stroke", "black")
                ,
        update => update
        .on("mouseover", function(event, d) {

            // console.log('Network data being sent on 268 is ',NetworkData); 
            handleMouseEvent(event,d);
            d3.select(this).attr("opacity", 0.69);
            })
            .on("mousemove", function(event, d) { 
                handleMouseEvent(event,d);
                        d3.select(this).attr("opacity", 0.69);
              })
              .on("click", internalClick) 
            .on("mouseout", function(d) { 


                if (!highlighted.includes(this)) {
                  NewCircles.attr("opacity", .69);
                    NetworkSVG.selectAll("line").remove();
                }
            })
        .each(d => d.isNew = false)
        ,
        exit => exit.remove()
    );
    NewCirclesRef.current = NewCircles;
    var simulation = d3.forceSimulation(NetworkData)
    .force("collide", d3.forceCollide(d => radiusScale(d.Wage))) 
    .alphaDecay(0.5)
    .alpha(0.03)
    .on("tick", tick);


function tick() {
    NewCircles
    .attr("cx", d => {
        // Only update position if the circle is new
        if (d.isNew) {
            d.x = Math.max(radiusScale(d.Wage), Math.min(Networkwidth - radiusScale(d.Wage), d.x));
        }
        return d.x;
    })
    .attr("cy", d => {
        // Only update position if the circle is new
        if (d.isNew) {
            d.y = Math.max(radiusScale(d.Wage), Math.min(Networkheight - radiusScale(d.Wage), d.y));
        }
        return d.y;
    })
    // .attr("r",0)
    // .transition()
    // .duration(1000)
    .attr("r",  d => radiusScale(d.Wage)) 
    .attr("cx", d => d.x+400)
    .attr("cy", d => d.y+450);
}
let init_decay = setTimeout(function() {
    simulation.alphaDecay(0.1);
}, 3000);
},[hasSimulationRun, participantsID, NewCirclesRef.current, prevParticipantsID,participantsData]);

    return (
        <div>
            {/* Social Network Chart */}
            {/* con */}

            <svg className="network-svg" ref={ref} width="750" height="800"></svg>
        </div>
    )
}

export default SocialNetwork;