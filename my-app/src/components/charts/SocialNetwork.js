import React, { useState, useEffect, useContext, useRef } from 'react';
import { forceSimulation, forceCenter, forceManyBody } from 'd3-force';
import { select, selectAll } from 'd3-selection';
import * as d3 from 'd3';
import data from "../../data/participantsUpdated.json";

import { Data } from "../../Context";

const SocialNetwork = () => {
    const chartRef = useRef();
    const [nodes, setNodes] = useState();
    const [links, setLinks] = useState();

  useEffect(() => {

    let myData = [];
    for(var k in data) {
        let myNewData = {
            participantId: data[k].participantId,
            interestGroup: data[k].interestGroup,
            educationLevel: data[k].educationLevel,
            jobId: data[k].jobId,
            InterestGroupFriends: data[k].InterestGroupFriends,
            EducationLevelFriends: data[k].EducationLevelFriends,
            EmployerFriends: data[k].EmployerFriends
        }
        myData = [
            ...myData,
            myNewData
        ]
    }
    console.log("data new", myData)
    const processedData = processData(myData);
    setNodes(processedData.nodes);
    setLinks(processedData.links);

    // Set up the SVG container
    const width = 800;
    const height = 600;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    const link = svg
      .selectAll('.link')
      .data(processedData.links)
      .enter()
      .append('line')
      .attr('class', 'link');

    const node = svg
      .selectAll('.node')
      .data(processedData.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 5)
      .attr('fill', (d) => getColor(d.group));

    // Position nodes and links
    link
      .attr('x1', (d) => {getNodeX(d.source)})
      .attr('y1', (d) => getNodeY(d.source))
      .attr('x2', (d) => {console.log("test", d.target); getNodeX(d.target)})
      .attr('y2', (d) => getNodeY(d.target));

    node.attr('cx', (d) => getNodeX(d)).attr('cy', (d) => getNodeY(d));

    function getNodeX(node) {
        // Manually set x-position for each node
        // You can customize this based on your requirements
        return node?.x || 0;
      }
  
      function getNodeY(node) {
        // Manually set y-position for each node
        // You can customize this based on your requirements
        return node?.y || 0;
      }
  
      function getColor(group) {
        // You can customize the node color based on groups or other criteria
        // This is just a simple example
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        return colorScale(group);
      }
}, [data]);

    const processData = (data) => {
    // Create nodes
    const nodeMap = {};
    const nodes = data.map((participant) => {
      const id = participant.participantId;
      const interestGroup = participant.interestGroup;

      if (!nodeMap[interestGroup]) {
        nodeMap[interestGroup] = {
          id: interestGroup,
          group: interestGroup,
          x: 0,
          y: 0,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        };
      }

      return {
        id,
        group: interestGroup,
        x: Math.random() * 800,
        y: Math.random() * 600,
        radius: 5,
      };
    });

    // Create links
    const links = [];
    for (const participant of data) {
      for (const friend of participant.InterestGroupFriends) {
        links.push({
          source: nodes.find((node) => node.id === participant.participantId),
          target: nodes.find((node) => node.id === +friend),
        });
      }
    }

    return { nodes, links };
  };

  return <div ref={chartRef} />;
}

export default SocialNetwork;