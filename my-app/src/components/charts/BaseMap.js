import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Data from '../../data/Buildings.csv';
import JSONData from '../../data/buildings.json';
import "./BaseMapStyles.css";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

const BaseMap = () => {
  const svgRef = useRef();
  const projectionRef = useRef(); // Create a ref for the projection
  const [radio, setRadio] = useState("all");
  const [data, setData] = useState(null);
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    var path = d3.geoPath();
    var width = 1000;
    var height = 900;

    d3.csv(Data).then(function(data) {
      var polygons = data.map(function(d) {
        var locationString = d.location.replace("POLYGON ((", "").replace("))", "");
        var location = locationString.split(", ").map(function(pair) {
          return pair.split(" ").map(Number);
        });

        return {
          "type": "Polygon",
          "coordinates": [location]
        };
      });

      projectionRef.current = d3.geoIdentity() // Use the ref to store the projection
        .reflectY(true)
        .fitExtent([[0, 0], [width, height]], {type: "FeatureCollection", features: polygons.map(function(d) { return {type: "Feature", geometry: d}; })});

      path.projection(projectionRef.current); // Use the ref to access the projection

      polygons.forEach(function(polygon) {
        if (polygon.coordinates.every(coordinate => coordinate.every(point => point.every(Number.isFinite)))) {
          d3.select(svgRef.current)
            .append("path")
            .attr("d", path(polygon))
            .attr("fill", "#ccc");
        }
      });

      setData(polygons);
    });

    d3.json(JSONData).then(function(jsonData) {
      if (!Array.isArray(jsonData)) {
        jsonData = Object.values(jsonData);
      }
      console.log(jsonData);

      setJsonData(jsonData);
    });
  }, []);

  useEffect(() => {
    if (data && jsonData) {
        var colors = {
        "School": "red",
        "Apartment": "green",
        "Pub": "blue",
        "Restaurant": "yellow"
        };
    
        var selectedType = radio;
        var filteredData = selectedType === "all" ? jsonData : jsonData.filter(function(d) { return d.type === selectedType; });
        console.log(filteredData);
    
        d3.select(svgRef.current).selectAll("circle").remove();
    
        filteredData.forEach(function(d) {
        var location = projectionRef.current([parseFloat(d.locationX), parseFloat(d.locationY)]); // Use the ref to access the projection
    
        d3.select(svgRef.current)
            .append("circle")
            .attr("cx", location[0])
            .attr("cy", location[1])
            .attr("r", 5)
            .attr("fill", colors[d.type]);
        });
    }
  }, [data, jsonData, radio]);


  const handleRadio = (event) => {
    setRadio(event.target.value);
  }

  const RadioButtonsGroup = () => {
    return (
      <FormControl>
        <RadioGroup
          defaultValue={radio}
          name="radio-buttons-group"
          onChange={handleRadio}
          row
        >
          <FormControlLabel value="all" control={<Radio />} label="All" />
          <FormControlLabel value="School" control={<Radio />} label="Schools" />
          <FormControlLabel value="Apartment" control={<Radio />} label="Apartments" />
          <FormControlLabel value="Pub" control={<Radio />} label="Pubs" />
          <FormControlLabel value="Restaurant" control={<Radio />} label="Restaurants" />
        </RadioGroup>
      </FormControl>
    );
  }

  return (
    <div className="myContainer">
      <h1 className="text-center">Basemap</h1>
      <div id="visualization">
        <RadioButtonsGroup/>
        <svg ref={svgRef} width="1000" height="900"></svg>
      </div>
    </div>
  );
}

export default BaseMap;