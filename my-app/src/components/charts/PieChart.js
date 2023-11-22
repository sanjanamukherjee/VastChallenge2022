import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import data from "../../data/participants.json";

const PieChart = () => {

    // const [data, setData] = useState(data);
    console.log("data - ", data);
    var eduTot = 0;
        var foodTot = 0;
        var recTot = 0;
        var travelTot = 0;
    var pieData = [];

    const ref = useRef();

    useEffect(() => {

        for(var k in data){
            // console.log("k - ", k, data[k]);
            eduTot += -data[k].Education;
            foodTot += -data[k].Food;
            recTot += -data[k].Recreation;
            travelTot += -data[k].Travel;
        }

        console.log("eduTot, foodtot, rectot, travel - ", eduTot, foodTot, recTot, travelTot);
   
        pieData = [
            {name: "Education", value: eduTot},
            {name: "Food", value: foodTot},
            {name: "Recreational", value: recTot},
            {name: "Travel", value: travelTot},
        ]

        const svg = d3.select(ref.current);

        const width = +svg.attr("width");
        const height = +svg.attr("height");
        // const width = 560;
        // const height = 400;
        const radius = Math.min(width, height) / 2;
        const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemePastel2);

        const pie = d3.pie().value(d => d.value);

        const path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        // const label = d3.arc()
        //     .outerRadius(radius)
        //     .innerRadius(radius - 80);
        // console.log("pie Data - ", pie(pieData))

        const arc = g.selectAll(".arc")
                    .data(pie(pieData), d => d.data.name)
                    .join(
                        enter => {

                            const arc = enter.append("g")
                                        .attr("class", "arc")
                            arc.append("path")
                                .attr("d", path)
                                .attr("fill", d => color(d.data.value))
                                .attr("stroke", "black")
                                .style("stroke-width", "1px");
                            return arc;
                        
                        },
                        update => {

                            update.select("path")
                                .transition()
                                .duration(1000)
                                .attr("d", path)
                                .attr("fill", d => color(d.data.value))
                                .attr("stroke", "black")
                                .style("stroke-width", "1px");
                            return update;
                        
                        },
                        exit => exit.remove()
                    )
        // const arc = g.selectAll(".arc")
        //     .data(pie(pieData))
        //     .enter().append("g")
        //     .attr("class", "arc");

        // arc.append("path")
        //     .attr("d", path)
        //     .attr("fill", d => color(d.data.value))
        //     .attr("stroke", "black")
        //     .style("stroke-width", "1px");

        //add legend
        var legend = svg.append("g")
                    .classed("legend", true)
                    .attr("transform", "translate(10,10)")
        
        var legendRect = legend.selectAll("rect")
                    .data(pieData)
                    .enter()
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", (d,i) => i * 20)
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("fill", d => color(d.value))
        
        var legendText = legend.selectAll("text")
                        .data(pieData)
                        .enter()
                        .append("text")
                        .attr("x", 20)
                        .attr("y", (d,i) => i * 20 + 10)
                        .text(d => d.name)
                        .style("font-size", 15)

    },[]);

    return (
        <div>
            <svg ref={ref} width="560" height="400" style={{border: "solid 2px black"}}></svg>
        </div>
    )
}

export default PieChart;