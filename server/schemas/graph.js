import { gql } from 'apollo-server-express';

const graphTypeDef = gql`
  type Node {
    id: String
    group: String
    label: String
  }
  type Link {
    source: String
    target: String
    value: Int
  }
  type ForceGraphData {
    nodes: [Node]!
    links: [Link]!
  }
  # Queries
  type Query {
    "Requires authentication"
    getForceGraph(types: [String]!): ForceGraphData
  }
`;

export default graphTypeDef;
