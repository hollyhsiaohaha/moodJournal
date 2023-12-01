import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_FORCE_GRAPH } from '../queries/graph.js';
import { useNavigate } from 'react-router-dom';
import { ListBox } from 'primereact/listbox';
import * as d3 from 'd3';

function Graph() {
  const ref = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const typesOptions = [{ name: 'note' }, { name: 'diary' }];
  const [selectedTypes, setSelectedTypes] = useState(typesOptions);
  const width = 928;
  const height = 680;
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const fetchPolicy = 'network-only';
  const [getForceGraph] = useLazyQuery(GET_FORCE_GRAPH, { fetchPolicy });
  const navigate = useNavigate();

  const refreshForceGraph = async (types) => {
    const emptyData = { nodes: [], links: [] };
    if (!types) return setGraphData(emptyData);
    const res = await getForceGraph({ variables: { types } });
    const data = res?.data?.getForceGraph || emptyData;
    setGraphData(data);
  };

  useEffect(() => {
    refreshForceGraph(selectedTypes.map((typeOption) => typeOption.name));
  }, [selectedTypes]);

  useEffect(() => {
    d3.select(ref.current).selectAll('*').remove();

    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const links = graphData.links.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id),
      )
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    const svg = d3
      .select(ref.current)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .style('max-width', '100%')
      .style('height', 'auto');

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d) => color(d.group));

    const labels = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.label)
      .style('fill', '#555')
      .style('font-family', 'Arial')
      .style('font-size', 18)
      .style('pointer-events', 'none')
      .style('opacity', 0);

    node.append('title').text((d) => d.id);

    node.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      labels.attr('x', (d) => d.x - 10).attr('y', (d) => d.y - 10);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    node
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 7);
        labels.filter((ld) => ld.id === d.id).style('opacity', 1);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('r', 5);
        labels.filter((ld) => ld.id === d.id).style('opacity', 0);
      })
      .on('click', function (event, d) {
        navigate(`/journal/${d.id}`);
      });

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  return (
    <>
      <svg ref={ref} width={width} height={height} />
    </>
  );
}

export default Graph;
