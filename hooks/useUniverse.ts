import { useMemo, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import { useKnowledge } from './useKnowledge';
import { useLayout } from './useLayout';
export function useUniverse() {
  const { data } = useKnowledge(); const layout = useLayout();
  const [type, setType] = useState('all'); const [relation, setRelation] = useState('all'); const [search, setSearch] = useState(''); const [selectedId, setSelectedId] = useState('');
  const [zoom, setZoom] = useState(1); const [pan, setPan] = useState({ x: 0, y: 0 }); const offset = useRef({ x: 0, y: 0 });
  const responder = useMemo(() => PanResponder.create({ onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6, onPanResponderMove: (_, g) => setPan({ x: offset.current.x + g.dx, y: offset.current.y + g.dy }), onPanResponderRelease: (_, g) => { offset.current = { x: offset.current.x + g.dx, y: offset.current.y + g.dy }; }, onPanResponderTerminationRequest: () => true }), []);
  const nodes = useMemo(() => data.items.filter(i => (type === 'all' || i.type === type) && (!search.trim() || `${i.title} ${i.content}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())) && (relation === 'all' || data.relationships.some(r => r.relation_type === relation && (r.source_item_id === i.id || r.target_item_id === i.id)))), [data, type, relation, search]);
  const width = Math.max(240, Math.min(968, layout.width - 32)); const height = layout.wide ? 400 : 320;
  const plotted = useMemo(() => nodes.slice(0, 60).map((item, index, visible) => { const angle = index / Math.max(1, visible.length) * Math.PI * 2 - Math.PI / 2; const radius = visible.length === 1 ? 0 : Math.min(width * 0.32, height * 0.34); return { item, x: width / 2 + Math.cos(angle) * radius, y: height / 2 + Math.sin(angle) * radius }; }), [nodes, width, height]);
  const edges = useMemo(() => { const ids = new Set(nodes.map(n => n.id)); return data.relationships.filter(r => ids.has(r.source_item_id) && ids.has(r.target_item_id) && (relation === 'all' || r.relation_type === relation)); }, [data, nodes, relation]);
  const selected = data.items.find(i => i.id === selectedId);
  function reset() { setZoom(1); setPan({ x: 0, y: 0 }); offset.current = { x: 0, y: 0 }; }
  return { nodes, edges, plotted, width, height, type, setType, relation, setRelation, search, setSearch, selectedId, setSelectedId, selected, zoom, setZoom, pan, responder, reset };
}
