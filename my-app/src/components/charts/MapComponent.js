import React, { useEffect, useRef, useState } from 'react';
import { geoPath } from 'd3-geo';
import { geoIdentity } from 'd3-geo';
import { csv, json } from 'd3';
import { D3Component } from 'react-d3-library';
import { RadioGroup, FormControlLabel, Radio } from '@material-ui/core';

const MapComponent = () => {
 const d3Node = useRef(null);
 const [selectedType, setSelectedType] = useState('all');

 useEffect(() => {
   const width = 1000;
   const height = 900;
   let projection;
   const path = geoPath();

   csv("../../data/Buildings.csv").then(function(data) {
     const polygons = data.map(function(d) {
       const locationString = d.location.replace("POLYGON ((", "").replace("))", "");
       const location = locationString.split(", ").map(function(pair) {
         return pair.split(" ").map(Number);
       });
       return {
         "type": "Polygon",
         "coordinates": [location]
       };
     });

     projection = geoIdentity()
       .reflectY(true)
       .fitExtent([[0, 0], [width, height]], {type: "FeatureCollection", features: polygons.map(function(d) { return {type: "Feature", geometry: d}; })});

     path.projection(projection);

     polygons.forEach(function(polygon) {
       d3.select(d3Node.current)
         .append("path")
         .attr("d", path(polygon))
         .attr("fill", "#ccc");
     });
   });

   const colors = {
     "School": "red",
     "Apartment": "green",
     "Pub": "blue",
     "Restaurant": "yellow"
   };

   json("../../data/buildings.json").then(function(data) {
     if (!Array.isArray(data)) {
       data = Object.values(data);
     }

     const updateMap = () => {
       const filteredData = selectedType === "all" ? data : data.filter(function(d) { return d.type === selectedType; });
       d3.select(d3Node.current).selectAll("circle").remove();
       filteredData.forEach(function(d) {
         const location = projection([parseFloat(d.locationX), parseFloat(d.locationY)]);
         d3.select(d3Node.current)
           .append("circle")
           .attr("cx", location[0])
           .attr("cy", location[1])
           .attr("r", 5)
           .attr("fill", colors[d.type]);
       });
     };

     updateMap();
   });
 }, [selectedType]);

 const handleChange = (event) => {
   setSelectedType(event.target.value);
 };

 return (
   <div>
     <RadioGroup aria-label="buildingType" name="buildingType" value={selectedType} onChange={handleChange}>
       <FormControlLabel value="all" control={<Radio />} label="All" />
       <FormControlLabel value="Apartment" control={<Radio />} label="Apartment" />
       <FormControlLabel value="School" control={<Radio />} label="School" />
       <FormControlLabel value="Pub" control={<Radio />} label="Pub" />
       <FormControlLabel value="Restaurant" control={<Radio />} label="Restaurant" />
     </RadioGroup>
     <D3Component data={[]} svgRef={d3Node} />
   </div>
 );
};

export default MapComponent;
