import React, {useEffect, useState} from "react";
import * as d3 from "d3";
import Data from '../../data/Buildings.csv';
import JSONData from '../../data/buildings.json';
import "./BaseMapStyles.css";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

var width = 1000;
var height = 900;
var projection;
var colors = {
    "School": "red",
    "Apartment": "green",
    "Pub": "blue",
    "Restaurant": "yellow"
};

const BaseMap = () => {

    const [radio, setRadio] = useState("all");
    const [jsonData, setJsonData] = useState({});

    useEffect(() => {
        var path = d3.geoPath();
        
        d3.csv(Data).then(function(data) {
            // Create an array of all the polygons
            console.log("data", data);

            var polygons = data.map(function(d) {
                // Remove the POLYGON prefix and outer parentheses
                var locationString = d.location.replace("POLYGON ((", "").replace("))", "");
            
                // Split the string into an array of coordinate pairs
                var location = locationString.split(", ").map(function(pair) {
                  return pair.split(" ").map(Number);
                });
            
                // Define the polygon
                return {
                  "type": "Polygon",
                  "coordinates": [location]
                };
            });

            projection = d3.geoIdentity()
                .reflectY(true)
                .fitExtent([[0, 0], [width, height]], {type: "FeatureCollection", features: polygons.map(function(d) { return {type: "Feature", geometry: d}; })});

            path.projection(projection);

            polygons.forEach(function(polygon) {
                
                // Append the path to the SVG
                d3.select("svg")
                    .append("path")
                    .attr("d", path(polygon))
                    .attr("fill", "#ccc");
                
                
            });

            // d3.json(JSONData).then(function(buildingsData) {
            //     if (!Array.isArray(buildingsData)) {
            //         buildingsData = Object.values(buildingsData);
            //     }

            //     setJsonData(buildingsData);

            //     updateMap();

            //     // d3.selectAll('input[name="buildingType"]').on("change", updateMap);
            // });
          
          });

    }, [])

    function updateMap() {
        // Get the selected building type
        console.log("radio", radio);
        // var selectedType = d3.select('input[name="buildingType"]:checked').node().value;
        var selectedType = radio;
  
        // Filter the data based on the selected building type
        var filteredData = selectedType === "all" ? jsonData : jsonData.filter(function(d) { return d.type === selectedType; });
  
        // Remove the existing points
        d3.select("svg").selectAll("circle").remove();
  
        // Iterate over each row in the filtered data
        filteredData.forEach(function(d) {
          // Get the point coordinates from locationX and locationY
          var location = projection([parseFloat(d.locationX), parseFloat(d.locationY)]);
  
          // Append the point to the SVG and color it based on the building type
          d3.select("svg")
            .append("circle")
            .attr("cx", location[0])
            .attr("cy", location[1])
            .attr("r", 5)
            .attr("fill", colors[d.type]);
        });
    }

    const handleRadio = (event) => {
        console.log("Value", event.target.value);
        setRadio(event.target.value);
        updateMap();
    }

    const RadioButtonsGroup = () => {
        return (
          <FormControl>
            {/* <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel> */}
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
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
                {/* <form>
                    <input type="radio" id="all" name="buildingType" value="all" checked/>
                    <label for="all">All</label><br/>
                    <input type="radio" id="school" name="buildingType" value="School"/>
                    <label for="school">School</label><br/>
                    <input type="radio" id="apartment" name="buildingType" value="Apartment"/>
                    <label for="apartment">Apartment</label><br/>
                    <input type="radio" id="pub" name="buildingType" value="Pub"/>
                    <label for="pub">Pub</label><br/>
                    <input type="radio" id="restaurant" name="buildingType" value="Restaurant"/>
                    <label for="restaurant">Restaurant</label>
                  </form> */}
                <svg width = "1000" height = "900">

                </svg>
            </div>
        </div>
    )
}

export default BaseMap;