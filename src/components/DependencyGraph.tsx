
import React, { useEffect, useState } from 'react';
import { getSyllabusStatus, getSchedule } from '../../services/storageService';
import { SyllabusStatus, Subject } from '../../types';
import { CheckCircle, Lock, Info, Zap, Shield, AlertTriangle } from 'lucide-react';

// --- DAG DEFINITION ---
interface NodeDef {
  id: Subject;
  parents: Subject[];
  weakParents: Subject[];
  x: number;
  y: number;
}

// Layout: Optimized for 1000x700 Grid
// Layer 1 (Roots)
const DAG_NODES: NodeDef[] = [
  { id: Subject.EM, parents: [], weakParents: [], x: 150, y: 80 },
  { id: Subject.DM, parents: [], weakParents: [], x: 380, y: 80 },
  { id: Subject.DS, parents: [], weakParents: [], x: 620, y: 80 },
  { id: Subject.DLD, parents: [], weakParents: [], x: 850, y: 80 },
  
  // Layer 2
  { id: Subject.TOC, parents: [Subject.DM], weakParents: [], x: 250, y: 250 },
  { id: Subject.ALGO, parents: [Subject.DM, Subject.DS], weakParents: [], x: 500, y: 250 },
  { id: Subject.COA, parents: [Subject.DLD], weakParents: [], x: 850, y: 250 },
  { id: Subject.DBMS, parents: [], weakParents: [Subject.DS], x: 700, y: 400 }, // Shifted for visibility

  // Layer 3
  { id: Subject.CD, parents: [Subject.TOC, Subject.DS], weakParents: [], x: 300, y: 450 },
  { id: Subject.OS, parents: [Subject.DS, Subject.COA], weakParents: [], x: 850, y: 450 },

  // Layer 4
  { id: Subject.CN, parents: [Subject.OS], weakParents: [Subject.EM], x: 600, y: 600 },
];

const DependencyGraph: React.FC = () => {
  const [status, setStatus] = useState<SyllabusStatus>({});
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Subject | null>(null);
  
  // Analysis State
  const [safeNodes, setSafeNodes] = useState<Subject[]>([]);
  const [riskyNodes, setRiskyNodes] = useState<{id: Subject, missing: Subject[]}[]>([]);
  const [completedNodes, setCompletedNodes] = useState<Subject[]>([]);

  useEffect(() => {
    const s = getSyllabusStatus();
    setStatus(s);
    analyzeDAG(s);
  }, []);

  const analyzeDAG = (currentStatus: SyllabusStatus) => {
    const safe: Subject[] = [];
    const risky: {id: Subject, missing: Subject[]}[] = [];
    const done: Subject[] = [];

    DAG_NODES.forEach(node => {
      const isCompleted = currentStatus[node.id]?.completed;

      if (isCompleted) {
        done.push(node.id);
      } else {
        const missingParents = node.parents.filter(p => !currentStatus[p]?.completed);
        if (missingParents.length === 0) {
          safe.push(node.id);
        } else {
          risky.push({ id: node.id, missing: missingParents });
        }
      }
    });

    setSafeNodes(safe);
    setRiskyNodes(risky);
    setCompletedNodes(done);
  };

  const getNodeState = (id: Subject) => {
    if (status[id]?.completed) return 'COMPLETED';
    if (safeNodes.includes(id)) return 'READY'; 
    return 'LOCKED';
  };

  // Helper to draw curved Bezier paths
  const getPath = (source: NodeDef, target: NodeDef) => {
    const deltaY = target.y - source.y;
    // Control points to create a vertical-ish S-curve
    const cp1x = source.x;
    const cp1y = source.y + (deltaY * 0.5);
    const cp2x = target.x;
    const cp2y = target.y - (deltaY * 0.5);
    
    return `M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`;
  };

  const isHighlighted = (nodeId: Subject) => {
    if (!hoveredNode) return false;
    if (hoveredNode === nodeId) return true;
    const node = DAG_NODES.find(n => n.id === hoveredNode);
    // Highlight parents
    if (node?.parents.includes(nodeId) || node?.weakParents.includes(nodeId)) return true;
    // Highlight children
    const isChild = DAG_NODES.find(n => n.id === nodeId && (n.parents.includes(hoveredNode) || n.weakParents.includes(hoveredNode)));
    return !!isChild;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in relative">
      
      {/* GRAPH VISUALIZER */}
      <div className="flex-1 bg-[#050505] border border-gate-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
         
         {/* Legend Overlay */}
         <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-gate-800">
               <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
               <span className="text-[10px] uppercase font-bold text-gate-300">Completed</span>
            </div>
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-gate-800">
               <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
               <span className="text-[10px] uppercase font-bold text-gate-300">Available</span>
            </div>
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-gate-800">
               <div className="w-3 h-3 rounded-full bg-gate-700 border border-gate-600"></div>
               <span className="text-[10px] uppercase font-bold text-gate-500">Locked</span>
            </div>
         </div>

         <svg className="w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#27272a" />
                 <stop offset="100%" stopColor="#52525b" />
              </linearGradient>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="28" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#71717a" />
              </marker>
            </defs>

            {/* CONNECTIONS */}
            {DAG_NODES.map(node => (
              <React.Fragment key={`edges-${node.id}`}>
                 {node.parents.map(parentId => {
                    const parent = DAG_NODES.find(n => n.id === parentId);
                    if (!parent) return null;
                    const highlight = isHighlighted(node.id) || isHighlighted(parentId);
                    return (
                      <path 
                        key={`${parentId}-${node.id}`}
                        d={getPath(parent, node)}
                        fill="none"
                        stroke={highlight ? "#e4e4e7" : "#3f3f46"}
                        strokeWidth={highlight ? 2.5 : 1.5}
                        strokeOpacity={highlight ? 1 : 0.4}
                        markerEnd="url(#arrow)"
                        className="transition-all duration-300"
                      />
                    );
                 })}
                 {node.weakParents.map(parentId => {
                    const parent = DAG_NODES.find(n => n.id === parentId);
                    if (!parent) return null;
                    const highlight = isHighlighted(node.id) || isHighlighted(parentId);
                    return (
                      <path 
                        key={`weak-${parentId}-${node.id}`}
                        d={getPath(parent, node)}
                        fill="none"
                        stroke={highlight ? "#a1a1aa" : "#27272a"}
                        strokeWidth={highlight ? 1.5 : 1}
                        strokeDasharray="4,4"
                        className="transition-all duration-300"
                      />
                    );
                 })}
              </React.Fragment>
            ))}

            {/* NODES */}
            {DAG_NODES.map(node => {
               const state = getNodeState(node.id);
               const isHovered = hoveredNode === node.id;
               const highlight = isHighlighted(node.id);
               
               let circleClass = "";
               let filter = "";
               let strokeColor = "";
               let fillColor = "";

               if (state === 'COMPLETED') {
                   strokeColor = "#22c55e"; // green-500
                   fillColor = "#052e16"; // green-950
                   filter = "url(#glow-green)";
               } else if (state === 'READY') {
                   strokeColor = "#eab308"; // yellow-500
                   fillColor = "#422006"; // yellow-950
                   filter = "url(#glow-yellow)";
               } else {
                   strokeColor = "#3f3f46"; // zinc-700
                   fillColor = "#09090b"; // zinc-950
               }

               return (
                 <g 
                    key={node.id} 
                    onClick={() => setActiveSubject(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-all duration-300"
                    style={{ transformOrigin: `${node.x}px ${node.y}px`, transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                 >
                    {/* Outer Glow Ring for Status */}
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r="22" 
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 3 : 2}
                      filter={filter}
                      className="transition-colors duration-500"
                    />
                    
                    {/* Inner Icon/Letter */}
                    <text 
                      x={node.x} 
                      y={node.y} 
                      dy="5" 
                      textAnchor="middle" 
                      fill={state === 'LOCKED' ? '#52525b' : '#ffffff'}
                      fontSize="11"
                      fontWeight="800"
                      className="uppercase pointer-events-none select-none font-mono"
                    >
                      {node.id.split(' ')[0].substring(0,3)}
                    </text>

                    {/* Full Label Below */}
                    <text 
                      x={node.x} 
                      y={node.y + 40} 
                      textAnchor="middle" 
                      fill={highlight ? "#ffffff" : "#a1a1aa"}
                      fontSize="10"
                      fontWeight="bold"
                      className="transition-colors duration-300 select-none uppercase tracking-wide"
                    >
                      {node.id === Subject.DS ? 'P&DS' : node.id}
                    </text>
                 </g>
               );
            })}
         </svg>
      </div>

      {/* ASSISTANT PANEL */}
      <div className="w-full xl:w-80 bg-gate-900 border border-gate-800 rounded-2xl p-6 flex flex-col shadow-xl h-fit">
         <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
           <Zap className="text-yellow-400 fill-yellow-400" size={18}/> Protocol Assistant
         </h2>

         <div className="space-y-4">
            
            {/* Context Box */}
            <div className="bg-black/50 p-4 rounded-xl border border-gate-800 min-h-[100px]">
               {activeSubject ? (
                  <div className="animate-slide-up">
                     <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                       {getNodeState(activeSubject) === 'COMPLETED' ? <CheckCircle size={14} className="text-green-500"/> : 
                        getNodeState(activeSubject) === 'READY' ? <Zap size={14} className="text-yellow-500"/> :
                        <Lock size={14} className="text-gate-500"/>}
                       {activeSubject}
                     </h4>
                     <p className="text-xs text-gate-400 leading-relaxed mb-2">
                        {getNodeState(activeSubject) === 'COMPLETED' ? 'Node secured. Dependencies resolved.' : 
                         getNodeState(activeSubject) === 'READY' ? 'All systems go. Prerequisites met. Recommended next target.' : 
                         'Locked. Resolve parent nodes first to unlock.'}
                     </p>
                     
                     {DAG_NODES.find(n => n.id === activeSubject)?.parents.length! > 0 && (
                        <div className="text-[10px] text-gate-500 mt-2">
                           <span className="uppercase font-bold">Requires:</span> {DAG_NODES.find(n => n.id === activeSubject)?.parents.join(', ')}
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gate-600 gap-2">
                     <Info size={24}/>
                     <p className="text-xs">Select a node to analyze dependencies.</p>
                  </div>
               )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 pt-4 border-t border-gate-800">
               <h3 className="text-[10px] uppercase font-bold text-gate-500 tracking-widest">Immediate Actions</h3>
               
               {safeNodes.length > 0 ? (
                  <div className="space-y-2">
                     {safeNodes.map(s => (
                        <div key={s} className="flex items-center justify-between bg-yellow-950/10 border border-yellow-900/30 p-2.5 rounded-lg group cursor-pointer hover:bg-yellow-950/20 transition-colors" onClick={() => setActiveSubject(s)}>
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                              <span className="text-xs font-bold text-yellow-100 group-hover:text-white">{s}</span>
                           </div>
                           <Zap size={12} className="text-yellow-600"/>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-xs text-gate-500 italic p-2">No safe nodes detected. Complete current tasks.</div>
               )}

               {riskyNodes.length > 0 && (
                 <div className="mt-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-red-500 mb-2">
                       <AlertTriangle size={10}/> Bottlenecks
                    </div>
                    <div className="space-y-1">
                      {riskyNodes.slice(0, 3).map(r => (
                        <div key={r.id} className="text-[10px] text-gate-500 flex justify-between px-2">
                           <span>{r.id}</span>
                           <span className="text-red-900">-{r.missing.length} deps</span>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>

         </div>
      </div>
    </div>
  );
};

export default DependencyGraph;
