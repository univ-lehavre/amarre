import Graph from 'graphology';

import type { EAV, Fetch } from '$lib/types';
import { generateGraph } from '$lib/graph';
import { fetchRedcap } from '$lib/redcap/server';

export const fetchGraphForRecord = async (recordId: string, fetch: Fetch) => {
  const data: EAV[] = await fetchRedcap<EAV[]>(fetch, { records: recordId });
  const graph: Graph = generateGraph(data);
  return graph;
};

export const fetchGlobalGraph = async (fetch: Fetch) => {
  const data: EAV[] = await fetchRedcap<EAV[]>(fetch, {
    forms: 'introduce_me,create_my_project',
    filterLogic: `[active] = "1"`,
  });
  const graph: Graph = generateGraph(data);
  return graph;
};
