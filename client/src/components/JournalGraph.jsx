import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_JOURNAL_BY_ID_LINKED_TYPE, GET_BACKLINK } from '../queries/journals.js';
import { JournalTypeColorMapping } from '../utils/colorMapping.js';
import { useNavigate } from 'react-router-dom';
import { ListBox } from 'primereact/listbox';
import { io } from 'socket.io-client';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

// TODO: refactor: 跟 Graph 合併
function JournalGraph({ showFilter, journalId }) {
  const ref = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const typesOptions = [{ name: 'note' }, { name: 'diary' }];
  const [selectedTypes, setSelectedTypes] = useState(typesOptions);
  const width = 464;
  const height = 340;
  const fetchPolicy = 'network-only';
  const [GetJournalsByIdLinkedType] = useLazyQuery(GET_JOURNAL_BY_ID_LINKED_TYPE, { fetchPolicy });
  const [GetBackLink] = useLazyQuery(GET_BACKLINK, { fetchPolicy });
  const navigate = useNavigate();
  const documentStyle = getComputedStyle(document.documentElement);

  const parseGraphData = (journals, types) => {
    const nodes = [];
    const links = [];
    const linkedCounts = {};
    journals.forEach((journal) => {
      if (types.includes(journal.type)) {
        const journalId = journal._id.toString();
        const node = { id: journalId, group: journal.type, label: journal.title };
        nodes.push(node);
        journal.linkedNotes.forEach((linkedJournal) => {
          if (types.includes(linkedJournal.type)) {
            const linkedJournalId = linkedJournal._id.toString();
            const link = { source: journalId, target: linkedJournalId, value: 1 };
            links.push(link);
            linkedCounts[linkedJournalId]
              ? (linkedCounts[linkedJournalId] += 1)
              : (linkedCounts[linkedJournalId] = 1);
          }
        });
      }
    });
    const nodesWithLinkedCount = nodes.map((node) => {
      return {
        ...node,
        linkedCount: linkedCounts[node.id] || 0,
      };
    });
    const data = { nodes: nodesWithLinkedCount, links };
    return data;
  };

  const refreshForceGraph = async (id) => {
    const journals = [];
    const journalRes = await GetJournalsByIdLinkedType({ variables: { id } });
    const backLinkRes = await GetBackLink({ variables: { id } });
    const targetJournal = journalRes.data.getJournalbyId;
    const graphBackLinkJournals = backLinkRes.data.getBackLinkedJournals;
    // Add target journal
    journals.push({
      _id: targetJournal._id,
      type: targetJournal.type,
      title: targetJournal.title,
      linkedNotes: targetJournal.linkedNotes,
    });
    // Add link journal
    targetJournal.linkedNotes.forEach((journal) => {
      journals.push({
        _id: journal._id,
        type: journal.type,
        title: journal.title,
        linkedNotes: [],
      });
    });
    // Add back link journal
    graphBackLinkJournals.forEach((journal) => {
      journals.push({
        _id: journal._id,
        type: journal.type,
        title: journal.title,
        linkedNotes: [targetJournal],
      });
    });
    const graphData = parseGraphData(journals, ['diary', 'note']);
    setGraphData(graphData);
  };

  useEffect(() => {
    const { protocol, hostname } = window.location;
    const port = hostname === 'localhost' ? ':3000' : '';
    const uri = `${protocol}//${hostname}${port}`;
    const socket = io(uri);
    socket.on('connection', () => {
      console.log('[Client] connected to server');
    });
    socket.on('message', (msg) => {
      if (msg === 'journal update') {
        console.log('refresh due to journal update');
        refreshForceGraph();
      }
    });
    socket.on('disconnect', () => {
      console.log('[Client] disconnected');
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    refreshForceGraph(journalId);
  }, [selectedTypes]);

  useEffect(() => {
    refreshForceGraph(journalId);
  }, [journalId]);

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
      .attr('stroke', '#d6d6d6')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => 5 + d.linkedCount * 0.3)
      .attr('fill', (d) => documentStyle.getPropertyValue(JournalTypeColorMapping[d.group]));

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
        d3.select(this).attr('stroke', 'black');
        link
          .filter((linkD) => linkD.source.id === d.id || linkD.target.id === d.id)
          .attr('stroke', 'black');
        labels.filter((ld) => ld.id === d.id).style('opacity', 1);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('stroke', '#fff');
        link
          .filter((linkD) => linkD.source.id === d.id || linkD.target.id === d.id)
          .attr('stroke', '#d6d6d6');
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
      {showFilter ? (
        <div className="card flex justify-content-center">
          <ListBox
            multiple
            value={selectedTypes}
            onChange={(e) => setSelectedTypes(e.value)}
            options={typesOptions}
            optionLabel="name"
            className="w-full md:w-14rem"
          />
        </div>
      ) : null}
      <svg ref={ref} width={width} height={height} />
    </>
  );
}

JournalGraph.propTypes = {
  showFilter: PropTypes.bool,
  journalId: PropTypes.string,
};

export default JournalGraph;
