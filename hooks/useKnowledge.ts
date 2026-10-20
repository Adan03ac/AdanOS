import { useContext } from 'react';
import { KnowledgeContext } from '@/contexts/KnowledgeContext';
export function useKnowledge() { const value = useContext(KnowledgeContext); if (!value) throw new Error('useKnowledge must be used within KnowledgeProvider'); return value; }
