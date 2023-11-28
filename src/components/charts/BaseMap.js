import React, { useEffect, useRef, useState, useContext } from "react";
import * as d3 from "d3";
import CSVData from "../../data/Buildings.csv";
// import JSONData from "../../data/buildings.json";
import "./BaseMapStyles.css";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

import { Data } from "../../Context";

const BaseMap = () => {
  const svgRef = useRef();
  const {buildingsData, setSelectedBuildings} = useContext(Data);

  const [radio, setRadio] = useState("all");
  const [jsonData, setJsonData] = useState(null);
  const [circleCoordinates, setCircleCoordinates] = useState([]);
  const [selectedCircles, setSelectedCircles] = useState([]);
  const [colors, setColors] = useState({
    School: d3.schemePastel2[3],
    Apartment: d3.schemePastel2[0],
    Pub: d3.schemePastel2[1],
    Restaurant: d3.schemePastel2[2],
})

const StyledRadio = (props) => (
  <div style={{
    display: 'inline-block',
    padding: '10px',
    border: `2px solid ${props.borderColor}`,
  }}>
    <Radio {...props} />
  </div>
);

  const projection = useRef();
  // const colors = {
  //   School: "red",
  //   Apartment: "green",
  //   Pub: "blue",
  //   Restaurant: "yellow",
  // };

  const loadJsonData = () => {
    // Load the JSON data
    let data = buildingsData;
    // console.log("data",data);
    if (!Array.isArray(data)) {
      data = Object.values(data);
    }
    
    setJsonData(data);
  };

  const loadData = async () => {
    const width = 1000;
    const height = 700;
    const data = await d3.csv(CSVData);
    // Create an array of all the polygons
    const polygons = data.map(function (d) {
      // Remove the POLYGON prefix and outer parentheses
      const locationString = d.location
        .replace("POLYGON ((", "")
        .replace("))", "");

      // Split the string into an array of coordinate pairs
      const location = locationString.split(", ").map(function (pair) {
        return pair.split(" ").map(Number);
      });

      // Define the polygon
      return {
        type: "Polygon",
        coordinates: [location],
      };
    });
    // Create a projection that fits the polygons
    const projectionTemp = d3
      .geoIdentity()
      .reflectY(true)
      .fitExtent(
        [
          [0, 0],
          [width, height],
        ],
        {
          type: "FeatureCollection",
          features: polygons.map(function (d) {
            return { type: "Feature", geometry: d };
          }),
        }
      );

    // Update the path generator with the new projection
    const path = d3.geoPath();
    path.projection(projectionTemp);
    projection.current = projectionTemp;

    polygons.forEach(function (polygon) {
      if (
        polygon.coordinates.every((coordinate) =>
          coordinate.every((point) => point.every(Number.isFinite))
        )
      ) {
        d3.select(svgRef.current)
          .attr("class", "building-path") 
          .append("path")
          .attr("d", path(polygon))
          .attr("fill", "#b7b7b7");
      }
    });

    loadJsonData();
  };

  useEffect(() => {
    loadData();
  }, []);

  // Define the updateMap function
  const updateMap = (selectedType = "all") => {
    if (!jsonData) {
      return;
    }
    
    // var selectedNode = d3.select('input[name="buildingType"]:checked').node();
    // var selectedType = selectedNode ? selectedNode.value : "all";

    // Filter the data based on the selected building type
    
    var filteredData =
    selectedType === "all"
        ? jsonData
        : jsonData.filter(function (d) {
            return d.type === selectedType;
          });

    // Remove the existing points
    d3.select(svgRef.current).selectAll("circle").remove();

    // Iterate over each row in the filtered data
    const newCircleCoordinates = [];
    filteredData.forEach(function (d) {
      // Get the point coordinates from locationX and locationY
      // Get the point coordinates from locationX and locationY
      
      var location =
        projection && projection.current
          ? projection.current([
              parseFloat(d.locationX),
              parseFloat(d.locationY),
            ])
          : null;

      // Append the point to the SVG and color it based on the building type
      if (location) {
        d3.select(svgRef.current)
          .append("circle")
          .attr("id", "dot-" + d.buildingId)
          .attr("cx", location[0])
          .attr("cy", location[1])
          .attr("r", 4.5)
          .attr("fill", colors[d.type])
          .attr("stroke", "black")
          .attr("stroke-width", .8);
      
      newCircleCoordinates.push({ cx: Math.round(location[0]), cy: Math.round(location[1]), id: d.buildingId, type: d.type });
      }

    });
    
    setCircleCoordinates(newCircleCoordinates);
    const svgNode = d3.select(svgRef.current);

    // lasso selection based on the drag events
    let coords = [];
    const lineGenerator = d3.line();

    const pointInPolygon = function (point, vs) {
      
        var x = point[0],
            y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0],
                yi = vs[i][1];
            var xj = vs[j][0],
                yj = vs[j][1];

            var intersect =
                yi > y != yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        
        return inside;
    };

    function drawPath() {
        d3.select("#lasso")
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("fill", "#00000054")
            .attr("d", lineGenerator(coords));
    }

    function dragStart() {
        coords = [];
        // circles.attr("fill", "steelblue");
        d3.select("#lasso").remove();
        svgNode
            .append("path")
            .attr("id", "lasso");
    }

    function dragMove(event) {
        let mouseX = event.sourceEvent.offsetX;
        let mouseY = event.sourceEvent.offsetY;
        coords.push([mouseX, mouseY]);
      
        drawPath();
    }

    function dragEnd() {
        let selectedDots = [];
        
        circleCoordinates.forEach((d, i) => {
            let point = [
                d.cx,
                d.cy,
            ];
            if (pointInPolygon(point, coords)) {
                // d3.select("#dot-" + d.id).attr("fill", "black");
                selectedDots.push({id: d.id, type: d.type});
            }
        });
        
        setSelectedCircles(selectedDots);
        // go through json data, filter all ids of selectedDots
        const foundBuildings = jsonData.filter(building => selectedDots.some(dot => dot.id === building.buildingId));
        // console.log("foundBuildings", JSON.stringify(foundBuildings), typeof(JSON.stringify(foundBuildings)));
        const foundBuildingsJSON = foundBuildings.reduce((acc, building) => {
          acc[building.buildingId] = {
            ...building,
            location: `POINT (${building.locationX} ${building.locationY})`,
          };
          return acc;
        }, {});

        
        // update context
        setSelectedBuildings(foundBuildingsJSON)
        
    }

    const drag = d3
        .drag()
        .on("start", dragStart)
        .on("drag", dragMove)
        .on("end", dragEnd);

    svgNode.call(drag);
    

  };

  useEffect(() => {
    // Add a click event listener to the document body
    const handleDocumentClick = () => {
      d3.select("#lasso").remove();
      setSelectedBuildings(buildingsData);
    };

    document.body.addEventListener("click", handleDocumentClick);

    return () => {
      // Remove the event listener when the component unmounts
      document.body.removeEventListener("click", handleDocumentClick);
    };
  }, []); // Include selectedDots in the dependency array

  useEffect(() => {
    // Call updateMap to draw the initial map
    updateMap();
  }, [jsonData]);

  const handleRadio = (event) => {
    setRadio(event.target.value);
    updateMap(event.target.value);
  };

  const RadioButtonsGroup = () => {
    return (
      <FormControl>
        <RadioGroup
          defaultValue={radio}
          name="buildingType"
          onChange={handleRadio}
          row
        >
          <FormControlLabel value="all" control={<Radio />} label="All" style={{padding: '2px 10px', margin: '8px', borderRadius : '10px'}} />
          <FormControlLabel value="School" control={<Radio />} label="Schools" style={{padding: '2px 10px', margin: '8px', backgroundColor: colors.School, borderRadius : '10px'}} />
          <FormControlLabel value="Apartment" control={<Radio />} label="Apartments" style={{padding: '2px 10px', margin: '8px', backgroundColor: colors.Apartment, borderRadius : '10px'}} />
          <FormControlLabel value="Pub" control={<Radio />} label="Pubs" style={{padding: '2px 10px', margin: '8px', backgroundColor: colors.Pub, borderRadius : '10px'}} />
          <FormControlLabel value="Restaurant" control={<Radio />} label="Restaurants" style={{padding: '2px 10px', margin: '8px', backgroundColor: colors.Restaurant, borderRadius : '10px'}} />
        </RadioGroup>
      </FormControl>
    );
  };
  return (
    <div className="myContainer">
      <div id="visualization">
        <div style={{alignSelf:"start", paddingLeft: "12px"}}><RadioButtonsGroup/></div>
        <svg id="svg-container" ref={svgRef} width="1000" height="700"></svg>
      </div>
    </div>
  );
};

export default BaseMap;