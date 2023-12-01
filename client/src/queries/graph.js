import { gql } from '@apollo/client';

export const GET_FORCE_GRAPH = gql`
query GetForceGraph($types: [String]!) {
  getForceGraph(types: $types) {
    nodes {
      id
      group
      label
    }
    links {
      source
      target
      value
    }
  }
}
`;
