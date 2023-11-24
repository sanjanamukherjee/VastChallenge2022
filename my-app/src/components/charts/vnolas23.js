// Define the size of the SVG
var width = 1000;
var height = 900;
var projection;

// Create a path generator
var path = d3.geoPath();

// Load the CSV data
d3.csv("../../data/Buildings.csv").then(function(data) {
  // Create an array of all the polygons
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

  // Create a projection that fits the polygons
  projection = d3.geoIdentity()
    .reflectY(true)
    .fitExtent([[0, 0], [width, height]], {type: "FeatureCollection", features: polygons.map(function(d) { return {type: "Feature", geometry: d}; })});

  // Update the path generator with the new projection
  path.projection(projection);

  // Iterate over each polygon
  polygons.forEach(function(polygon) {
    // Append the path to the SVG
    d3.select("svg")
      .append("path")
      .attr("d", path(polygon))
      .attr("fill", "#ccc");
  });

  // Define the colors for each building type
  var colors = {
    "School": "red",
    "Apartment": "green",
    "Pub": "blue",
    "Restaurant": "yellow"
  };

  // Load the JSON data
  d3.json("../../data/buildings.json").then(function(data) {
    // Convert data to an array if it's an object
    if (!Array.isArray(data)) {
      data = Object.values(data);
    }

    // Define the updateMap function
    function updateMap() {
      // Get the selected building type
      var selectedType = d3.select('input[name="buildingType"]:checked').node().value;

      // Filter the data based on the selected building type
      var filteredData = selectedType === "all" ? data : data.filter(function(d) { return d.type === selectedType; });

      // Remove the existing points
      d3.select("svg").selectAll("circle").remove();

      // Iterate over each row in the filtered data
      filteredData.forEach(function(d) {
        // Get the point coordinates from locationX and locationY
        var location = projection.current([parseFloat(d.locationX), parseFloat(d.locationY)]);

        // Append the point to the SVG and color it based on the building type
        d3.select("svg")
          .append("circle")
          .attr("cx", location[0])
          .attr("cy", location[1])
          .attr("r", 5)
          .attr("fill", colors[d.type]);
      });
    }

    // Call updateMap to draw the initial map
    updateMap();

    // Update the map when a radio button is clicked
    d3.selectAll('input[name="buildingType"]').on("change", updateMap);
  });
});