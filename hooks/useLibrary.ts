import { useMemo, useState } from 'react';
import { useKnowledge } from './useKnowledge';
export function useLibrary() {
  const { data } = useKnowledge(); const [search, setSearch] = useState(''); const [type, setType] = useState('all'); const [status, setStatus] = useState('all'); const [tag, setTag] = useState('all'); const [project, setProject] = useState('all'); const [sort, setSort] = useState('updated');
  const items = useMemo(() => { const q = search.trim().toLocaleLowerCase(); return data.items.filter(i => (!q || `${i.title} ${i.content}`.toLocaleLowerCase().includes(q)) && (type === 'all' || i.type === type) && (status === 'all' || i.status === status) && (tag === 'all' || data.itemTags.some(t => t.item_id === i.id && t.tag_id === tag)) && (project === 'all' || data.itemProjects.some(p => p.item_id === i.id && p.project_id === project))).sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : (sort === 'created' ? b.created_at.localeCompare(a.created_at) : b.updated_at.localeCompare(a.updated_at))); }, [data, search, type, status, tag, project, sort]);
  return { items, search, setSearch, type, setType, status, setStatus, tag, setTag, project, setProject, sort, setSort };
}
