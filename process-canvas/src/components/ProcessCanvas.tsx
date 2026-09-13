import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProcessStore } from '../store/processStore';
import { getFlowLayout, getSwimlaneLayout, NODE_SIZE, SWIMLANE_LANE_HEIGHT } from '../utils/layout';
import { ROLE_COLORS, ROLE_ORDER } from '../types';
import { StepNode } from './nodes/StepNode';
import { LaneLabelNode } from './nodes/LaneLabelNode';

const nodeTypes = { step: StepNode, lane: LaneLabelNode };

function ProcessCanvasInner() {
  const graph = useProcessStore((s) => s.graph);
  const viewMode = useProcessStore((s) => s.viewMode);
  const selectedNodeId = useProcessStore((s) => s.selectedNodeId);
  const overrides = useProcessStore((s) => s.nodePositionOverrides);
  const selectNode = useProcessStore((s) => s.selectNode);
  const setNodePosition = useProcessStore((s) => s.setNodePosition);
  const addLink = useProcessStore((s) => s.addLink);
  const removeLink = useProcessStore((s) => s.removeLink);
  const deleteNode = useProcessStore((s) => s.deleteNode);

  const layout = useMemo(() => {
    return viewMode === 'swimlane' ? getSwimlaneLayout(graph.steps) : getFlowLayout(graph.steps, graph.links);
  }, [graph.steps, graph.links, viewMode]);

  const neighborIds = useMemo(() => {
    if (!selectedNodeId) return null;
    const set = new Set<string>([selectedNodeId]);
    graph.links.forEach((l) => {
      if (l.source === selectedNodeId) set.add(l.target);
      if (l.target === selectedNodeId) set.add(l.source);
    });
    return set;
  }, [selectedNodeId, graph.links]);

  const nodes: Node[] = useMemo(() => {
    const maxOrder = Math.max(0, ...graph.steps.map((s) => s.order));
    const laneWidth = 260 * (maxOrder + 2);
    const laneNodes: Node[] =
      viewMode === 'swimlane'
        ? ROLE_ORDER.filter((role) => graph.steps.some((s) => s.role === role)).map((role) => ({
            id: `lane-${role}`,
            type: 'lane',
            position: { x: 0, y: (ROLE_ORDER.indexOf(role) >= 0 ? ROLE_ORDER.indexOf(role) : 0) * SWIMLANE_LANE_HEIGHT + 20 },
            data: { role, width: laneWidth },
            draggable: false,
            selectable: false,
            zIndex: -1,
            width: laneWidth,
            height: 150,
          }))
        : [];

    const stepNodes: Node[] = graph.steps.map((step) => {
      const pos = overrides[step.id] ?? layout[step.id] ?? { x: 0, y: 0 };
      const dimmed = neighborIds ? !neighborIds.has(step.id) : false;
      const highlighted = neighborIds ? neighborIds.has(step.id) && step.id !== selectedNodeId : false;
      const size = NODE_SIZE[step.kind];
      return {
        id: step.id,
        type: 'step',
        position: pos,
        selected: step.id === selectedNodeId,
        data: { label: step.label, role: step.role, kind: step.kind, status: step.status, dimmed, highlighted },
        style: { width: size.width, height: size.height },
        width: size.width,
        height: size.height,
      };
    });

    return [...laneNodes, ...stepNodes];
  }, [graph.steps, layout, overrides, selectedNodeId, neighborIds, viewMode]);

  const edges: Edge[] = useMemo(() => {
    return graph.links.map((link) => {
      const isFail = link.kind === 'fail';
      const dimmed = neighborIds ? !(neighborIds.has(link.source) && neighborIds.has(link.target)) : false;
      return {
        id: link.id,
        source: link.source,
        target: link.target,
        label: link.label,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: isFail ? '#dc2626' : '#0891b2',
          strokeWidth: 2,
          strokeDasharray: isFail ? '6 4' : undefined,
          opacity: dimmed ? 0.25 : 1,
        },
        labelStyle: { fill: isFail ? '#b91c1c' : '#0e7490', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: '#ffffff' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isFail ? '#dc2626' : '#0891b2',
          width: 18,
          height: 18,
        },
      } satisfies Edge;
    });
  }, [graph.links, neighborIds]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          setNodePosition(change.id, change.position);
        }
        if (change.type === 'remove' && !change.id.startsWith('lane-')) {
          deleteNode(change.id);
        }
      });
    },
    [setNodePosition, deleteNode],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeLink(change.id);
        }
      });
    },
    [removeLink],
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      if (params.source && params.target) addLink(params.source, params.target);
    },
    [addLink],
  );

  const { fitView } = useReactFlow();

  // React Flow can measure the wrapper before the flex layout around it has
  // settled to its final size on first paint, which leaves the graph tiny
  // and pinned to the top-left. Re-fit once layout has stabilized, and again
  // whenever the graph or view mode changes the content bounds.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 200 });
    });
    return () => cancelAnimationFrame(raf);
  }, [fitView, graph, viewMode]);

  useEffect(() => {
    const handleResize = () => fitView({ padding: 0.2, duration: 0 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitView]);

  return (
    <div id="process-canvas-viewport" className="h-full w-full bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          if (!node.id.startsWith('lane-')) selectNode(node.id);
        }}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const role = (n.data as { role?: keyof typeof ROLE_COLORS })?.role;
            return role && ROLE_COLORS[role] ? ROLE_COLORS[role].main : '#94a3b8';
          }}
          maskColor="rgba(30, 58, 95, 0.06)"
        />
      </ReactFlow>
    </div>
  );
}

export function ProcessCanvas() {
  return (
    <ReactFlowProvider>
      <ProcessCanvasInner />
    </ReactFlowProvider>
  );
}
