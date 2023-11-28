import React, { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
// import data from "../../data/buildings.json"
import { Data } from "../../Context";

const Candle = () => {
  // const ref = useRef(); // Define the ref
  var BuildingsArray = [];

  const d = useContext(Data);
  var data;
  var g;
  var Candlesvg;
  var aggregatedArray;
  var xScale;
  var x;
  var y;
  var colorScale;
  var Yscale;
  var data1;
  var aggregatedData;

    useEffect(() => {
        // console.log('Called');
        
        data = d.selectedBuildings;
        // console.log("new data", data, typeof(data));
        BuildingsArray = Object.values(data).map(function(d) {
            return {
                name: d.type,
                buildingId: +d.buildingId,
                rentalcost: +d.cost
            };
        });

    // console.log("Candle Chart is called");
    // data = d.buildingsData;

    Candlesvg = d3.select(ref.current);
    var width = +Candlesvg.attr("width");
    var height = +Candlesvg.attr("height");

    g = Candlesvg.append("g").attr(
      "transform",
      `translate(${width / 2}, ${height / 2})`
    );

    colorScale = d3
      .scaleOrdinal()
      .domain(["Apartment", "Pub", "Restaurant", "School"])
      .range(d3.schemePastel2);

    /*   Candlesvg.selectAll("text").remove();
        Candlesvg.selectAll("rect").remove();
    
        Candlesvg.append("text")
        .attr("x", 30)
        .attr("y", 28)
        .text("Apartment")
        .style("font-size", "12px")
    
        Candlesvg.append("rect")
        .attr("x", 10)
        .attr("y", 15)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", colorScale("Apartment"));
    
    
        // Candlesvg.append("text")
        // .attr("x", 30)
        // .attr("y", 48)
        // .text("Pub")
        // .style("font-size", "12px")
    
    
        Candlesvg.append("rect")
        .attr("x", 10)
        .attr("y", 35)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", colorScale("Pub"));
    
        Candlesvg.append("text")
        .attr("x", 30)
        .attr("y", 48)
        .text("Pub")
        .style("font-size", "12px")
        // .style("font-weight","bold");
    
    
        Candlesvg.append("rect")
        .attr("x", 10)
        .attr("y", 55)
        .attr("width", 15)
        .attr("height", 15)
        // .style("stroke","black")
        .style("fill", colorScale("Restaurant"));
    
        Candlesvg.append("text")
        .attr("x", 30)
        .attr("y", 68)
        .text("Restaurant")
        .style("font-size", "12px")
        // .style("font-weight","bold");
    
    
        Candlesvg.append("rect")
        .attr("x", 10)
        .attr("y", 75)
        .attr("width", 15)
        .attr("height", 15)
        // .style("stroke","black")
        .style("fill", colorScale("School"));
    
    
        Candlesvg.append("text")
        .attr("x", 30)
        .attr("y", 88)
        .text("School")
        .style("font-size", "12px")
        // .style("font-weight","bold");
    
    */

    var tempNames = ["Apartment", "Pub", "Restaurant", "School"];

    xScale = d3.scaleBand().domain(tempNames).range([130, 550]);

    var mergedDict = BuildingsArray;
    var counts = d3.rollup(
      mergedDict,
      (v) => v.length,
      (d) => d.name
    );

    Yscale = d3
      .scaleLinear()
      .domain([0, d3.max(Array.from(counts.values()))])
      .range([100, 150]);

    d3.axisTop(xScale);

    aggregatedData = d3.rollup(
      mergedDict,
      (v) => v.length,
      (d) => d.name
    );
    // console.log('value of aggregatedData is  ',aggregatedData);

    aggregatedArray = Array.from(aggregatedData, ([name, value]) => ({
      name,
      value,
    }));

    var margin = { top: 190, right: 30, bottom: 30, left: 200 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    data1 = mergedDict;
    height = 70;
    y = d3
      .scaleLinear()
      .domain([
        d3.min(data1, (d) => d.rentalcost),
        d3.max(data1, (d) => d.rentalcost),
      ])
      .range([height, 0]);
    //     // VioliinSVG.append("g").call( d3.axisLeft(y) )

    x = d3.scaleBand().range([129, 548]).domain(tempNames);

    Candlesvg.selectAll(".tickclass").remove();
    Candlesvg.append("g")
      .attr("class", "tickclass")
      .attr("transform", "translate(-125," + 185 + ")")
      // .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .call(d3.axisBottom(x))
      .select(".domain")
      .style("stroke", "none");

    Candlesvg.selectAll(".tick text").style("opacity", 0);

    // Plot Barplot
    DrawBarplot();
    DrawApartmentViolinPlot();
    drawViolinPub();
    drawViolinRestaurant();
    drawViolinSchool();
  }, [d]);

  const ref = useRef();

  function DrawApartmentViolinPlot() {
    var Apartmentdata = data1.filter((d) => d.name === "Apartment");
    var avgRentalCost = d3.mean(Apartmentdata, d => d.rentalcost);
    console.log(avgRentalCost);

    var histogram = d3.bin().domain(y.domain()).thresholds(3);

    var ApartmenttypeSumstat = Array.from(
      d3.rollup(
        Apartmentdata,
        (v) =>
          histogram(
            v.map(function (d) {
              return d.rentalcost;
            })
          ),
        function (d) {
          return d.name;
        }
      )
    );

    var ApartmenttypeMaxNum = 0;
    for (let i = 0; i < ApartmenttypeSumstat.length; i++) {
      let allBins = ApartmenttypeSumstat[i][1];
      let lengths = allBins.map((a) => a.length);
      let longest = d3.max(lengths);
      if (longest > ApartmenttypeMaxNum) {
        ApartmenttypeMaxNum = longest;
      }
    }

    // console.log('x values are ',x.bandwidth());

    var ApartmenttypeXNum = d3
      .scaleLinear()
      .range([0, x.bandwidth() * 0.2])
      .domain([-100, 100]);

    Candlesvg.selectAll(".myApartmentViolin")
      .data(ApartmenttypeSumstat, function (d) {
        return d[0];
      })
      .on("mouseover", function(event, d) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible")
            .html(d[0] + "<br>Average Rental Cost : " + avgRentalCost);
    })
    .on("mousemove", function(event) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select("#tooltip").style("visibility", "hidden");
    })
      .join(
        (enter) => {
          enter
            .append("g")
            .attr("class", "myApartmentViolin")

            .attr("transform", function (d) {
              return "translate(" + (x(d[0]) - 84) + " ,120)";
            })
            .append("path")
            .attr("class", "ApartmentPathClass")
            .datum(function (d) {
              return d[1];
            })
            // .style("stroke", "black")
            // .style("fill", function(d) {

            //     return colorScale(d3.select(this.parentNode).datum()[0]); })
            .style("fill", "orange")
            .style("opacity", 0.69)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return ApartmenttypeXNum(0);
                }) // set initial x0 to 0
                .x1(function (d) {
                  return ApartmenttypeXNum(0);
                }) // set initial x1 to 0
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            )
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  // console.log("d for x0 ----------------->", d, d.length, typeXNum(-d.length))
                  return ApartmenttypeXNum(-d.length);
                })
                .x1(function (d) {
                  return ApartmenttypeXNum(d.length);
                })
                .y(function (d) {
                  return 10.422625;
                  // console.log('Enter Value of /d for y is ',d, d.x0)
                  // return(y(d.x0)) }
                })
                .curve(d3.curveCatmullRom)
            );
        },
        (update) => {
          update

            .selectAll(".ApartmentPathClass")
            .datum(function (d) {
              return d;
            })
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  console.log(
                    "Valuue for x0 is ",
                    -d.length,
                    " and ",
                    ApartmenttypeXNum(-d.length)
                  );
                  return ApartmenttypeXNum(-d.length);
                })
                .x1(function (d) {
                  console.log(
                    "Valuue for x1 is ",
                    d.length,
                    " and ",
                    ApartmenttypeXNum(d.length)
                  );

                  return ApartmenttypeXNum(d.length);
                })
                .y(function (d) {
                  console.log(
                    "Valuue for y is ",
                    d,
                    " and ",
                    ApartmenttypeXNum(-d.length)
                  );
                  return y(d.x0);
                })
            );
        },

        (exit) =>
          exit
            .selectAll(".ApartmentPathClass")
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return ApartmenttypeXNum(0);
                })
                .x1(function (d) {
                  return ApartmenttypeXNum(0);
                })
                .y(function (d) {
                  return y(0);
                })
                .curve(d3.curveCatmullRom)
            )
        // .style("fill","black")
        // .remove()
      );
  }

  function drawViolinPub() {
    var Pubdata = data1.filter((d) => d.name === "Pub");
    console.log(Pubdata);
    var avgRentalCost = d3.mean(Pubdata, d => d.rentalcost);

    var histogram = d3.bin().domain(y.domain()).thresholds(3);

    var PubtypeSumstat = Array.from(
      d3.rollup(
        Pubdata,
        (v) =>
          histogram(
            v.map(function (d) {
              return d.rentalcost;
            })
          ),
        function (d) {
          return d.name;
        }
      )
    );

    var PubtypeMaxNum = 0;
    for (let i = 0; i < PubtypeSumstat.length; i++) {
      let allBins = PubtypeSumstat[i][1];
      let lengths = allBins.map((a) => a.length);
      let longest = d3.max(lengths);
      if (longest > PubtypeMaxNum) {
        PubtypeMaxNum = longest;
      }
    }

    var PubtypeXNum = d3
      .scaleLinear()
      .range([0, x.bandwidth() * 0.19])
      .domain([-10, 10]);

    Candlesvg.selectAll(".myPubViolin")
      .data(PubtypeSumstat, function (d) {
        return d[0];
      })
      .on("mouseover", function(event, d) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible")
            .html(d[0] + "<br>Average Rental Cost : " + avgRentalCost);
    })
    .on("mousemove", function(event) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select("#tooltip").style("visibility", "hidden");
    })
      .join(
        (enter) => {
          enter
            .append("g")
            .attr("class", "myPubViolin")
            .attr("transform", function (d) {
              return "translate(" + (x(d[0]) - 83) + " ,120)";
            })
            .append("path")
            .attr("class", "PubPathClass")
            .datum(function (d) {
              return d[1];
            })
            // .style("stroke", "black")
            // .style("fill", function(d) {
            //     return colorScale(d3.select(this.parentNode).datum()[0]); })
            .style("fill", "orange")
            .style("opacity", 0.69)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return PubtypeXNum(0);
                }) // set initial x0 to 0
                .x1(function (d) {
                  return PubtypeXNum(0);
                }) // set initial x1 to 0
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            )
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return PubtypeXNum(-d.length);
                })
                .x1(function (d) {
                  return PubtypeXNum(d.length);
                })
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            );
        },
        (update) => {
          update
            .selectAll(".PubPathClass")
            .datum(function (d) {
              return d;
            })
            .transition()
            .duration(1000)
            // .style("fill","yellow")
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return PubtypeXNum(-d.length);
                })
                .x1(function (d) {
                  return PubtypeXNum(d.length);
                })
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            );
        },
        (exit) =>
          exit
            .selectAll(".PubPathClass")
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return PubtypeXNum(0);
                })
                .x1(function (d) {
                  return PubtypeXNum(0);
                })
                .y(function (d) {
                  return y(0);
                })
                .curve(d3.curveCatmullRom)
            )
        // .remove()
      );
  }

  function drawViolinRestaurant() {
    var RestaurantData = data1.filter((d) => d.name === "Restaurant");
    var avgRentalCost = d3.mean(RestaurantData, d => d.rentalcost);

    var histogram = d3.bin().domain(y.domain()).thresholds(3);

    var RestaurantTypeSumstat = Array.from(
      d3.rollup(
        RestaurantData,
        (v) =>
          histogram(
            v.map(function (d) {
              return d.rentalcost;
            })
          ),
        function (d) {
          return d.name;
        }
      )
    );

    var RestaurantTypeMaxNum = 0;
    for (let i = 0; i < RestaurantTypeSumstat.length; i++) {
      let allBins = RestaurantTypeSumstat[i][1];
      let lengths = allBins.map((a) => a.length);
      let longest = d3.max(lengths);
      if (longest > RestaurantTypeMaxNum) {
        RestaurantTypeMaxNum = longest;
      }
    }

    var RestaurantTypeXNum = d3
      .scaleLinear()
      .range([0, x.bandwidth() * 0.19])
      .domain([-20, 20]);

    Candlesvg.selectAll(".myRestaurantViolin")
      .data(RestaurantTypeSumstat, function (d) {
        return d[0];
      })
      .on("mouseover", function(event, d) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible")
            .html(d[0] + "<br>Average Rental Cost : " + avgRentalCost);
    })
    .on("mousemove", function(event) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select("#tooltip").style("visibility", "hidden");
    })
      .join(
        (enter) => {
          enter
            .append("g")
            .attr("class", "myRestaurantViolin")
            .attr("transform", function (d) {
              return "translate(" + (x(d[0]) - 83) + " ,120)";
            })
            .append("path")
            .attr("class", "RestaurantPathClass")
            .datum(function (d) {
              return d[1];
            })
            // .style("stroke", "black")
            // .style("fill", function(d) {
            //     return colorScale(d3.select(this.parentNode).datum()[0]); })
            .style("fill", "orange")
            .style("opacity", 0.69)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return RestaurantTypeXNum(0);
                }) // set initial x0 to 0
                .x1(function (d) {
                  return RestaurantTypeXNum(0);
                }) // set initial x1 to 0
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            )
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return RestaurantTypeXNum(-d.length);
                })
                .x1(function (d) {
                  return RestaurantTypeXNum(d.length);
                })
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            );
        },
        (update) => {
          update
            .selectAll(".RestaurantPathClass")
            .datum(function (d) {
              return d;
            })
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return RestaurantTypeXNum(-d.length);
                })
                .x1(function (d) {
                  return RestaurantTypeXNum(d.length);
                })
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            );
        },
        (exit) =>
          exit
            .selectAll(".RestaurantPathClass")
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return RestaurantTypeXNum(0);
                })
                .x1(function (d) {
                  return RestaurantTypeXNum(0);
                })
                .y(function (d) {
                  return y(0);
                })
                .curve(d3.curveCatmullRom)
            )
        // .remove()
      );
  }

  function DrawBarplot() {
    // console.log('array is ',aggregatedArray);

    Candlesvg.selectAll(".CandleBars")
      .data(aggregatedArray, function (d) {
        // console.log('Value in candle is ',d);
        return d.name;
      })
      .on("mouseover", function(event, d) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible")
            .text(d.name + ": " + d.value);
    })
    .on("mousemove", function(event) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select("#tooltip").style("visibility", "hidden");
    })
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "CandleBars")
            .attr("transform", "translate(-110," + 10 + ")")
            .attr("x", function (d) {
              return (
                xScale(d.name) +
                xScale.bandwidth() / 2 -
                (xScale.bandwidth() * 0.5) / 2
              );
            })
            .attr("y", 450)
            .attr("width", x.bandwidth() * 0.2)
            .attr("fill", function (d) {
              return colorScale(d.name);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("opacity", 0.69)
            .attr("height", 0)
            .transition()
            .duration(1000)
            .attr("y", function (d) {
              return 180;
            })
            .attr("height", function (d) {
              return Yscale(d.value * 0.5);
            }),
        (update) => {
          update.call((update) => {
            update
              .transition()
              .duration(1000)
              .attr("y", function (d) {
                return 180;
              })
              .attr("height", function (d) {
                return Yscale(d.value);
              });
          });
        },
        (exit) =>
          exit
            .transition()
            .duration(1000)
            .attr("y", 450)
            .attr("fill", "black")
            .remove()
      );
  }

  function drawViolinSchool() {
    var SchoolData = data1.filter((d) => d.name === "School");
    var avgRentalCost = d3.mean(SchoolData, d => d.rentalcost);
    console.log(avgRentalCost);

    var histogram = d3.bin().domain(y.domain()).thresholds(3);

    var SchoolTypeSumstat = Array.from(
      d3.rollup(
        SchoolData,
        (v) =>
          histogram(
            v.map(function (d) {
              return d.rentalcost;
            })
          ),
        function (d) {
          return d.name;
        }
      )
    );

    var SchoolTypeMaxNum = 0;
    for (let i = 0; i < SchoolTypeSumstat.length; i++) {
      let allBins = SchoolTypeSumstat[i][1];
      let lengths = allBins.map((a) => a.length);
      let longest = d3.max(lengths);
      if (longest > SchoolTypeMaxNum) {
        SchoolTypeMaxNum = longest;
      }
    }

    var SchoolTypeXNum = d3
      .scaleLinear()
      .range([0, x.bandwidth() * 0.19])
      .domain([-10, 10]);

    console.log(SchoolData);

    Candlesvg.selectAll(".mySchoolViolin")
      .data(SchoolTypeSumstat, function (d) {
        return d[0];
      })
      .on("mouseover", function(event, d) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible")
            .html(d[0] + "<br>Average Rental Cost : " + avgRentalCost);
    })
    .on("mousemove", function(event) {
        d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select("#tooltip").style("visibility", "hidden");
    })
      .join(
        (enter) => {
          enter
            .append("g")
            .attr("class", "mySchoolViolin")
            .attr("transform", function (d) {
              return "translate(" + (x(d[0]) - 83) + " ,120)";
            })
            .append("path")
            .attr("class", "SchoolPathClass")
            .datum(function (d) {
              return d[1];
            })
            // .style("stroke", "black")
            // .style("fill", function(d) {
            //     return colorScale(d3.select(this.parentNode).datum()[0]); })
            .style("fill", "orange")
            .style("opacity", 0.69)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return SchoolTypeXNum(0);
                })
                .x1(function (d) {
                  return SchoolTypeXNum(0);
                })
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            )
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return SchoolTypeXNum(-d.length);
                })
                .x1(function (d) {
                  return SchoolTypeXNum(d.length);
                })
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            );
        },
        (update) => {
          update
            .selectAll(".SchoolPathClass")
            .datum(function (d) {
              return d;
            })
            .transition()
            .duration(1000)
            // .style("fill","yellow")
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return SchoolTypeXNum(-d.length);
                })
                .x1(function (d) {
                  return SchoolTypeXNum(d.length);
                })
                .y(function (d) {
                  return y(d.x0);
                })
                .curve(d3.curveCatmullRom)
            );
        },
        (exit) =>
          exit
            .selectAll(".SchoolPathClass")
            .transition()
            .duration(1000)
            .attr(
              "d",
              d3
                .area()
                .x0(function (d) {
                  return SchoolTypeXNum(0);
                })
                .x1(function (d) {
                  return SchoolTypeXNum(0);
                })
                .y(function (d) {
                  return y(0);
                })
                .curve(d3.curveCatmullRom)
            )
        // .remove()
      );
  }

  return (
    <div style={{ margin: "10px" }}>
      {/* Candle */}
      <svg className="candle-svg" ref={ref} width="450" height="350"></svg>
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

export default Candle;
