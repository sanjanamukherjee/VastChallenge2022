import React, { useState, useEffect, useContext, useRef } from 'react';
import { forceSimulation, forceCenter, forceManyBody } from 'd3-force';
import { select, selectAll } from 'd3-selection';
import * as d3 from 'd3';
import data from "../../data/participantsUpdated.json";

import { Data } from "../../Context";

const SocialNetwork = () => {
    // const { data } = useContext(Data);

    const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const ref = useRef();

  useEffect(() => {
    // Fetch JSON data
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
    createSimulation();
  }, []);

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
        x: Math.random() * 500,
        y: Math.random() * 300,
        radius: 5,
      };
    });

    // Create links
    const links = [];
    for (const participant of data) {
      for (const friend of participant.InterestGroupFriends) {
        links.push({
          source: nodes.find((node) => node.id === node.participantId),
          target: nodes.find((node) => node.id === friend),
        });
      }
    }

    return { nodes, links };
  };

  const createSimulation = () => {
    // const simulation = forceSimulation()
    //   .nodes(nodes)
    //   .force('link', 0.1)
    //   .force('center', forceCenter([700 / 2, 500 / 2]))
    //   .force('manyBody', forceManyBody())
    //   .on('tick', tick);

    // simulation.start();
    const simulation = d3
      .forceSimulation()
      .force('link', d3.forceLink().id((d) => d.participantId))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(700 / 2, 500 / 2));

    // Add links and nodes to the simulation
    simulation.nodes(nodes).on('tick', ticked);
    simulation.force('link').links(links);

    return simulation;
  };

  const ticked = () => {
    const svg = select(ref.current);

    // Update node positions
    svg.selectAll('.node')
      .data(nodes)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    // Update link positions
    svg.selectAll('.link')
      .data(links)
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
  };

    return (
        <div>
        <svg ref={ref} width={700} height={500} style={{border: "2px solid black"}}/>
      </div>
    )
}

export default SocialNetwork;