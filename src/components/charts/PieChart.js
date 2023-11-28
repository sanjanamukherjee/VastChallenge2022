import React, { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Data } from "../../Context";
// import data from "../../data/participants.json";

const PieChart = () => {
  // const d = ;
  // console.clear();

    const d = useContext(Data);
    const data = d.participantsPieData;
    //console.log("data in pie chart -------- - ", d)

  var eduTot = 0;
  var foodTot = 0;
  var recTot = 0;
  var travelTot = 0;
  var piedata = [];

  const [pieData, setPieData] = useState(piedata);

  const ref = useRef();

  useEffect(() => {
    let dataArray = Object.values(data);

    for (var k = 0; k < dataArray.length; k++) {
      // //console.log("k - ", k, dataArray[k]);
      eduTot += -dataArray[k].Education;
      foodTot += -dataArray[k].Food;
      recTot += -dataArray[k].Recreation;
      travelTot += -dataArray[k].Travel;
    }

    //console.log("eduTot, foodtot, rectot, travel - ", eduTot, foodTot, recTot, travelTot);

    piedata = [
      { name: "Education", value: eduTot },
      { name: "Food", value: foodTot },
      { name: "Recreational", value: recTot },
      { name: "Travel", value: travelTot },
    ];
    setPieData(piedata);
  }, [data]);

  useEffect(() => {
    d3.selectAll(".legend").remove();
    const svg = d3.select(ref.current);

    const width = +svg.attr("width");
    const height = +svg.attr("height");
    // const width = 560;
    // const height = 400;
    const radius = Math.min(width, height) / 2;
    // const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemePastel2);

    const pie = d3.pie().value(function (d) {
      // //console.log('asdlfkjaslkfsajfklsajf ',d.value);
      return d.value;
    });

    const path = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const arc = svg
      .selectAll("path")
      .data(pie(pieData), (d) => d.index)
      .join(
        (enter) => {
          const arc = enter
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)
            .attr("class", "arc");
          arc
            .append("path")
            // .attr("class","myPath")
            .attr("d", path)
            .attr("fill", (d) => color(d.data.name))
            // .attr("fill","blue")
            .attr("stroke", "black")
            .style("stroke-width", "1px")
            .on("mouseover", function (event, d) {
              d3.select("#tooltip")
                .html(d.data.name + ": " + d.data.value)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px")
                .style("visibility", "visible");
            })
            .on("mousemove", function (event) {
              d3.select("#tooltip")
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function () {
              d3.select("#tooltip").style("visibility", "hidden");
            });
        },
        (update) => {
          // //console.log("~~~~~~ herherherhehrerhehr ~~~~~")
          update
            .transition()
            .duration(800)
            .attr("d", path)
            .attr("fill", (d) => color(d.data.name))
            .attr("stroke", "black")
            .style("stroke-width", "1px");
        },
        (exit) => exit.remove()
      );
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

    var legend = svg
      .append("g")
      .classed("legend", true)
      .attr("transform", "translate(10,10)");

    var legendRect = legend
      .selectAll("rect")
      .data(pieData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => color(d.name));

    var legendText = legend
      .selectAll("text")
      .data(pieData)
      .enter()
      .append("text")
      .attr("x", 20)
      .attr("y", (d, i) => i * 20 + 10)
      .text((d) => d.name)
      .style("font-size", 11);
  }, [pieData]);

  return (
    <div style={{ margin: "10px" }}>
      <svg className="pie-svg" ref={ref} width="400" height="200"></svg>
      <div
        id="tooltip"
        style={{
          position: "absolute",
          visibility: "hidden",
          backgroundColor: "white",
          padding: "5px",
          borderRadius: "5px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
        }}
      ></div>
    </div>
  );
};

export default PieChart;
