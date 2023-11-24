import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import Data from "../../data/Buildings.csv";
import JSONData from "../../data/buildings.json";
import "./BaseMapStyles.css";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

const BaseMap = () => {
  const svgRef = useRef();
  const [radio, setRadio] = useState("all");
  const [jsonData, setJsonData] = useState(null);
  const projection = useRef();
  const colors = {
    School: "red",
    Apartment: "green",
    Pub: "blue",
    Restaurant: "yellow",
  };

  const loadJsonData = () => {
    // Load the JSON data
    let data = JSONData;
    console.log("JSON data loaded", data);
    if (!Array.isArray(data)) {
      data = Object.values(data);
    }
    console.log(data);
    setJsonData(data);
  };

  const loadData = async () => {
    const width = 1000;
    const height = 900;
    const data = await d3.csv(Data);
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
          .append("path")
          .attr("d", path(polygon))
          .attr("fill", "#ccc");
      }
    });
    loadJsonData();
  };

  useEffect(() => {
    loadData();
  }, []);

  // Define the updateMap function
  const updateMap = () => {
    if (!jsonData) {
      return;
    }
    // Get the selected building type
    // Get the selected building type
    console.log("Called update map");
    var selectedNode = d3.select('input[name="buildingType"]:checked').node();
    var selectedType = selectedNode ? selectedNode.value : "all";

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
          .attr("cx", location[0])
          .attr("cy", location[1])
          .attr("r", 5)
          .attr("fill", colors[d.type]);
      }
    });
  };

  useEffect(() => {
    // Call updateMap to draw the initial map
    updateMap();
  }, [jsonData]);

  const handleRadio = (event) => {
    setRadio(event.target.value);
    updateMap();
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
          <FormControlLabel value="all" control={<Radio />} label="All" />
          <FormControlLabel
            value="School"
            control={<Radio />}
            label="Schools"
          />
          <FormControlLabel
            value="Apartment"
            control={<Radio />}
            label="Apartments"
          />
          <FormControlLabel value="Pub" control={<Radio />} label="Pubs" />
          <FormControlLabel
            value="Restaurant"
            control={<Radio />}
            label="Restaurants"
          />
        </RadioGroup>
      </FormControl>
    );
  };

  return (
    <div className="myContainer">
      <h1 className="text-center">Basemap</h1>
      <div id="visualization">
        <RadioButtonsGroup />
        <svg id="svg-container" ref={svgRef} width="1000" height="900"></svg>
      </div>
    </div>
  );
};

export default BaseMap;
