import React, { useState, useRef, useCallback, useEffect } from 'react';

interface Node {
  id: string;
  type: 'auth' | 'transformer' | 'conditional' | 'endpoint';
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    variables: Record<string, any>;
  };
  connections: string[];
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

interface Version {
  id: string;
  timestamp: Date;
  description: string;
  nodes: Node[];
  connections: Connection[];
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HANDLE_RADIUS = 10;

interface NodeComponentProps {
  node: Node;
  selectedNode: string | null;
  isBeingDragged: boolean;
  displayPosition: { x: number; y: number };
  isNewlyAdded: boolean;
  isDarkMode: boolean;
  dragBg: string;
  draggedNode: string | null;
  handleNodeDragStart: (e: React.MouseEvent | React.TouchEvent, nodeId: string) => void;
  handleOutputHandleClick: (nodeId: string) => void;
  handleInputHandleClick: (nodeId: string) => void;
  setSelectedNode: (id: string) => void;
  updateHandlePosition: (nodeId: string, type: 'input' | 'output', ref: React.RefObject<HTMLDivElement | null>) => void;
  connectFrom: string | null;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  selectedNode,
  isBeingDragged,
  displayPosition,
  isNewlyAdded,
  isDarkMode,
  dragBg,
  draggedNode,
  handleNodeDragStart,
  handleOutputHandleClick,
  handleInputHandleClick,
  setSelectedNode,
  updateHandlePosition,
  connectFrom,
}) => {
  const inputHandleRef = React.useRef<HTMLDivElement>(null);
  const outputHandleRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    updateHandlePosition(node.id, 'input', inputHandleRef);
    updateHandlePosition(node.id, 'output', outputHandleRef);
  }, [node.position.x, node.position.y]);

  const accent = {
    auth: isDarkMode ? 'bg-blue-600' : 'bg-blue-500',
    transformer: isDarkMode ? 'bg-green-600' : 'bg-green-500',
    conditional: isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400',
    endpoint: isDarkMode ? 'bg-purple-600' : 'bg-purple-500',
  }[node.type];
  const gradient = {
    auth: isDarkMode
      ? 'from-blue-900 via-blue-800 to-blue-700'
      : 'from-blue-50 via-white to-blue-100',
    transformer: isDarkMode
      ? 'from-green-900 via-green-800 to-green-700'
      : 'from-green-50 via-white to-green-100',
    conditional: isDarkMode
      ? 'from-yellow-900 via-yellow-800 to-yellow-700'
      : 'from-yellow-50 via-white to-yellow-100',
    endpoint: isDarkMode
      ? 'from-purple-900 via-purple-800 to-purple-700'
      : 'from-purple-50 via-white to-purple-100',
  }[node.type];
  const shadow = isDarkMode
    ? 'shadow-[0_4px_24px_0_rgba(0,0,0,0.35)]'
    : 'shadow-[0_4px_24px_0_rgba(0,0,0,0.10)]';

  return (
    <div
      key={node.id}
      className={`absolute rounded-2xl border transition-all select-none group ${shadow} ${
        selectedNode === node.id
          ? 'border-blue-500 ring-2 ring-blue-400 scale-[1.03]'
          : isDarkMode
          ? 'border-gray-700 hover:border-blue-400'
          : 'border-gray-200 hover:border-blue-500'
      } ${isBeingDragged ? `z-50 scale-105 ${dragBg}` : ''} ${
        isNewlyAdded ? 'animate-pulse border-blue-400 ring-2 ring-blue-300' : ''
      }`}
      style={{
        left: displayPosition.x,
        top: displayPosition.y,
        minWidth: '180px',
        maxWidth: `${NODE_WIDTH}px`,
        transform: `translate3d(0, 0, 0)${isBeingDragged ? ' rotate(1deg)' : ''}`,
        willChange: isBeingDragged ? 'transform, left, top' : 'auto',
        transition: isBeingDragged ? 'none' : 'all 0.18s cubic-bezier(.4,1.2,.4,1)',
      }}
      onMouseDown={(e) => handleNodeDragStart(e, node.id)}
      onTouchStart={(e) => handleNodeDragStart(e, node.id)}
      onClick={(e) => {
        if (!draggedNode) {
          setSelectedNode(node.id);
        }
      }}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{zIndex: 1}}>
        <div className={`absolute left-0 top-0 h-full w-2 ${accent}`} style={{zIndex: 1}} />
        <div className="absolute inset-0 w-full h-full rounded-2xl" style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(51,65,85,0.98) 100%)'
            : 'linear-gradient(135deg, #fff 0%, #f3f4f6 100%)',
          zIndex: 0,
        }} />
      </div>
      <div className="relative z-10 flex flex-col h-full" style={{minHeight: NODE_HEIGHT}}>
        <div className={`flex items-center px-4 pt-3 pb-2 rounded-t-2xl ${
          isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
        } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${accent}`} />
          <div className={`font-semibold text-sm flex-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{node.data.label}</div>
          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
            isDarkMode
              ? 'bg-gray-700 text-gray-200'
              : 'bg-gray-100 text-gray-700'
          }`}>{node.type.charAt(0).toUpperCase() + node.type.slice(1)}</span>
        </div>
        <div className={`flex-1 px-4 py-2 space-y-1`}> 
          {Object.entries(node.data.config).map(([key, value]) => (
            <div key={key} className="flex items-center text-xs">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'} style={{minWidth: 60}}>{key}:</span>
              <span className={`ml-2 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{String(value)}</span>
            </div>
          ))}
        </div>
        <div className={`px-4 pb-2 pt-1 flex items-center border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <span className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connections: {node.connections.length}</span>
        </div>
      </div>
      <div
        ref={outputHandleRef}
        className={`absolute rounded-full border-2 border-white dark:border-gray-800 cursor-crosshair z-20 shadow ${connectFrom === node.id ? 'ring-4 ring-blue-400 scale-110' : 'bg-blue-400'} transition-transform duration-150`}
        style={{ right: -HANDLE_RADIUS, top: `calc(50% - ${HANDLE_RADIUS}px)`, width: 2*HANDLE_RADIUS, height: 2*HANDLE_RADIUS }}
        onClick={() => handleOutputHandleClick(node.id)}
      />
      <div
        ref={inputHandleRef}
        className={`absolute rounded-full border-2 border-white dark:border-gray-800 cursor-pointer z-20 shadow ${connectFrom && connectFrom !== node.id ? 'ring-4 ring-blue-400 scale-110' : 'bg-gray-400'} transition-transform duration-150`}
        style={{ left: -HANDLE_RADIUS, top: `calc(50% - ${HANDLE_RADIUS}px)`, width: 2*HANDLE_RADIUS, height: 2*HANDLE_RADIUS }}
        onClick={() => handleInputHandleClick(node.id)}
      />
    </div>
  );
};

const VisualAPIBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedTemplate, setDraggedTemplate] = useState<typeof nodeTemplates[0] | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [debugData, setDebugData] = useState<Record<string, any>>({});
  const [lastAddedNode, setLastAddedNode] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [showDocs, setShowDocs] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activePanel, setActivePanel] = useState<'debugger' | 'docs' | 'versions'>('debugger');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null;
    return saved ? JSON.parse(saved) : false;
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [handlePositions, setHandlePositions] = useState<Record<string, { input: { x: number, y: number }, output: { x: number, y: number } }>>({});

  const nodeTemplates = [
    { type: 'auth', label: 'Authentication', color: 'bg-blue-500', config: { method: 'bearer', token: '' } },
    { type: 'transformer', label: 'Data Transformer', color: 'bg-green-500', config: { operation: 'map', field: '' } },
    { type: 'conditional', label: 'Conditional Logic', color: 'bg-yellow-500', config: { condition: 'equals', value: '' } },
    { type: 'endpoint', label: 'API Endpoint', color: 'bg-purple-500', config: { method: 'GET', url: '' } }
  ];

  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  const checkMobileViewport = useCallback(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  const handleMobileTapAdd = (template: typeof nodeTemplates[0]) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 - 80;
    const centerY = rect.height / 2 - 40;
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: template.type as any,
      position: { x: centerX, y: centerY },
      data: {
        label: template.label,
        config: { ...template.config },
        variables: {}
      },
      connections: []
    };
    
    setNodes(prev => [...prev, newNode]);
    setLastAddedNode(newNode.id);
    saveVersion(`Added ${template.label} node`);
    setShowSidebar(false);
    
    setTimeout(() => setLastAddedNode(null), 1000);
  };

  const handleDesktopTapAdd = (template: typeof nodeTemplates[0]) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2 - 80;
    const centerY = rect.height / 2 - 40;
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: template.type as any,
      position: { x: centerX, y: centerY },
      data: {
        label: template.label,
        config: { ...template.config },
        variables: {}
      },
      connections: []
    };
    setNodes(prev => [...prev, newNode]);
    setLastAddedNode(newNode.id);
    saveVersion(`Added ${template.label} node`);
    setTimeout(() => setLastAddedNode(null), 1000);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    checkMobileViewport();
    const handleResize = () => checkMobileViewport();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkMobileViewport]);

  const generateOpenAPI = useCallback(() => {
    const endpoints = nodes.filter(node => node.type === 'endpoint');
    return {
      openapi: '3.0.0',
      info: {
        title: 'Generated API',
        version: '1.0.0',
        description: 'Auto-generated API from visual composition'
      },
      paths: endpoints.reduce((acc, endpoint) => {
        const path = endpoint.data.config.url || '/api/endpoint';
        acc[path] = {
          [endpoint.data.config.method?.toLowerCase() || 'get']: {
            summary: endpoint.data.label,
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'object' },
                        status: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        return acc;
      }, {} as Record<string, any>)
    };
  }, [nodes]);

  const handleTemplateDragStart = (e: React.DragEvent, template: typeof nodeTemplates[0]) => {
    setDraggedTemplate(template);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(template));
  };

  const handleNodeDragStart = (e: React.MouseEvent | React.TouchEvent, nodeId: string) => {
    if ('touches' in e) {
    } else {
      e.preventDefault();
    }
    if ('stopPropagation' in e) e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const offsetX = clientX - rect.left - node.position.x;
      const offsetY = clientY - rect.top - node.position.y;
      setDragOffset({ x: offsetX, y: offsetY });
      setDragPosition({ x: clientX - rect.left - offsetX, y: clientY - rect.top - offsetY });
      setDraggedNode(nodeId);
      setIsDragging(true);
    }
  };

  const handleCanvasDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggedNode && canvasRef.current && isDragging) {
      if ('touches' in e) {
      } else {
        e.preventDefault();
      }
      if ('stopPropagation' in e) e.stopPropagation();
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const newX = Math.max(0, clientX - rect.left - dragOffset.x);
      const newY = Math.max(0, clientY - rect.top - dragOffset.y);
      setDragPosition({ x: newX, y: newY });
      requestAnimationFrame(() => {
        setNodes(prev => {
          const nodeIndex = prev.findIndex(node => node.id === draggedNode);
          if (nodeIndex === -1) return prev;
          const updatedNodes = [...prev];
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            position: { x: newX, y: newY }
          };
          return updatedNodes;
        });
      });
    }
  }, [draggedNode, dragOffset, isDragging]);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (draggedTemplate && canvasRef.current && !isMobile) {
      const rect = canvasRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;
      
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: draggedTemplate.type as any,
        position: { x: dropX - 80, y: dropY - 40 },
        data: {
          label: draggedTemplate.label,
          config: { ...draggedTemplate.config },
          variables: {}
        },
        connections: []
      };
      
      setNodes(prev => [...prev, newNode]);
      saveVersion(`Added ${draggedTemplate.label} node`);
      setDraggedTemplate(null);
      setShowSidebar(false);
    }
  };

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsDragging(false);
  }, []);

  const saveVersion = (description: string) => {
    const newVersion: Version = {
      id: `v-${Date.now()}`,
      timestamp: new Date(),
      description,
      nodes: [...nodes],
      connections: [...connections]
    };
    setVersions(prev => [newVersion, ...prev]);
    setCurrentVersion(newVersion.id);
  };

  const loadVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setNodes(version.nodes);
      setConnections(version.connections);
      setCurrentVersion(versionId);
    }
  };

  useEffect(() => {
    const debugInfo: Record<string, any> = {};
    nodes.forEach(node => {
      debugInfo[node.id] = {
        type: node.type,
        label: node.data.label,
        config: node.data.config,
        variables: node.data.variables,
        connections: node.connections.length
      };
    });
    setDebugData(debugInfo);
  }, [nodes, connections]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggedNode(null);
      setIsDragging(false);
    };
    const handleGlobalTouchEnd = () => {
      setDraggedNode(null);
      setIsDragging(false);
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp, { passive: true });
    document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  const simulatePipeline = useCallback(() => {
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
    const incoming = new Set(connections.map(c => c.to));
    const startNodes = nodes.filter(n => !incoming.has(n.id));
    if (startNodes.length === 0) return { result: null, log: ["No start node found"] };

    let payload: any = { user: "Alice" };
    let log: string[] = [];
    let visited = new Set();
    let ok = true;

    for (let node = startNodes[0] as Node | undefined; node && !visited.has(node.id); ) {
      if (!node) break;
      visited.add(node!.id);
      switch (node!.type) {
        case 'auth': {
          const token = node!.data.config.token || 'demo-token';
          if (!token) {
            log.push('Auth failed: No token');
            ok = false;
            break;
          }
          payload.token = token;
          log.push('Auth passed');
          break;
        }
        case 'transformer': {
          const field = node!.data.config.field || 'user';
          const operation = node!.data.config.operation || 'map';
          if (operation === 'map' && field && payload[field]) {
            payload[field + '_mapped'] = payload[field];
            delete payload[field];
            log.push('Data transformed');
          } else {
            log.push('Data transform failed');
            ok = false;
          }
          break;
        }
        case 'conditional': {
          const condition = node!.data.config.condition || 'equals';
          const value = node!.data.config.value || '';
          if (condition === 'equals' && value && Object.values(payload).includes(value)) {
            log.push('Condition met');
          } else if (!value) {
            log.push('Condition failed: No value');
            ok = false;
          } else {
            log.push('Condition not met');
            ok = false;
          }
          break;
        }
        case 'endpoint': {
          log.push('Response returned');
          payload = { status: ok ? '200 OK' : '400 Bad Request', body: payload };
          break;
        }
        default:
          log.push('Unknown node type');
      }
      const nextConn = connections.find(c => c.from === node!.id);
      node = nextConn ? nodeMap[nextConn.to] : undefined;
    }
    return { result: payload, log };
  }, [nodes, connections]);

  const [simulationData, setSimulationData] = useState<Record<string, { variables: any; log: string }>>({});

  const runSimulation = useCallback(() => {
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
    const incoming = new Set(connections.map(c => c.to));
    const startNodes = nodes.filter(n => !incoming.has(n.id));
    if (startNodes.length === 0) return;
    let sim: Record<string, { variables: any; log: string }> = {};
    let visited = new Set<string>();
    function simulatePath(startNode: Node) {
      let queue: { node: Node; payload: any; ok: boolean }[] = [
        { node: startNode, payload: { user: "Alice" }, ok: true }
      ];
      while (queue.length > 0) {
        const { node, payload, ok } = queue.shift()!;
        if (visited.has(node.id)) continue;
        visited.add(node.id);
        let log = '';
        let newPayload = { ...payload };
        let newOk = ok;
        switch (node.type) {
          case 'auth': {
            const token = node.data.config.token || 'demo-token';
            if (!token) {
              log = 'Auth failed: No token';
              newOk = false;
              break;
            }
            newPayload.token = token;
            log = 'Auth passed';
            break;
          }
          case 'transformer': {
            const field = node.data.config.field || 'user';
            const operation = node.data.config.operation || 'map';
            if (operation === 'map' && field && newPayload[field]) {
              newPayload[field + '_mapped'] = newPayload[field];
              delete newPayload[field];
              log = 'Data transformed';
            } else {
              log = 'Data transform failed';
              newOk = false;
            }
            break;
          }
          case 'conditional': {
            const condition = node.data.config.condition || 'equals';
            const value = node.data.config.value || '';
            if (condition === 'equals' && value && Object.values(newPayload).includes(value)) {
              log = 'Condition met';
            } else if (!value) {
              log = 'Condition failed: No value';
              newOk = false;
            } else {
              log = 'Condition not met';
              newOk = false;
            }
            break;
          }
          case 'endpoint': {
            log = 'Response returned';
            newPayload = { status: newOk ? '200 OK' : '400 Bad Request', body: newPayload };
            break;
          }
          default:
            log = 'Unknown node type';
        }
        sim[node.id] = { variables: { ...newPayload }, log };
        const nextConns = connections.filter(c => c.from === node.id);
        for (const conn of nextConns) {
          const nextNode = nodeMap[conn.to];
          if (nextNode && !visited.has(nextNode.id)) {
            queue.push({ node: nextNode, payload: newPayload, ok: newOk });
          }
        }
      }
    }
    for (const startNode of startNodes) {
      simulatePath(startNode);
    }
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        let log = 'Not connected';
        sim[node.id] = { variables: {}, log };
      }
    }
    setSimulationData(sim);
    setDebugData(sim);
  }, [nodes, connections]);

  useEffect(() => {
    runSimulation();
  }, [nodes, connections, runSimulation]);

  const handleOutputHandleClick = (nodeId: string) => {
    setConnectFrom(nodeId);
  };

  function isCircular(from: string, to: string): boolean {
    const visited = new Set<string>();
    function dfs(nodeId: string): boolean {
      if (nodeId === from) return true;
      visited.add(nodeId);
      const next = connections.filter(c => c.from === nodeId).map(c => c.to);
      for (const n of next) {
        if (!visited.has(n) && dfs(n)) return true;
      }
      return false;
    }
    return dfs(to);
  }

  const handleInputHandleClick = (targetNodeId: string) => {
    if (connectFrom && connectFrom !== targetNodeId) {
      if (!connections.some(c => c.from === connectFrom && c.to === targetNodeId) && !isCircular(connectFrom, targetNodeId)) {
        const newConn = { id: `conn-${Date.now()}`, from: connectFrom, to: targetNodeId };
        setConnections(prev => [...prev, newConn]);
        setNodes(prev => prev.map(n =>
          n.id === connectFrom
            ? { ...n, connections: [...n.connections, targetNodeId] }
            : n
        ));
      }
    }
    setConnectFrom(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setConnectFrom(null);
    }
  };

  const updateHandlePosition = (nodeId: string, type: 'input' | 'output', ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current && canvasRef.current) {
      const handleRect = ref.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = handleRect.left + handleRect.width / 2 - canvasRect.left;
      const y = handleRect.top + handleRect.height / 2 - canvasRect.top;
      setHandlePositions(prev => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          [type]: { x, y }
        }
      }));
    }
  };

  return (
    <div className={isDarkMode ? 'dark poppins-font' : 'poppins-font'}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          html, body, #root, .poppins-font, * {
            font-family: 'Poppins', sans-serif !important;
          }
          input, textarea, button, select {
            font-family: 'Poppins', sans-serif !important;
          }
        `}</style>
        <div className={
          `lg:hidden px-4 py-3 flex items-center justify-between shadow-sm border-b ` +
          (isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200')
        }>
          <h1 className={
            'text-lg font-semibold ' + (isDarkMode ? 'text-white' : 'text-gray-900')
          }>Visual API Builder</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={
                'p-2.5 rounded-xl bg-gradient-to-br active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-sm hover:shadow-lg border ' +
                (isDarkMode
                  ? 'from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600/50 hover:border-gray-500/60'
                  : 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200/50 hover:border-gray-300/60')
              }
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={
                'p-2.5 rounded-xl bg-gradient-to-br active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-sm hover:shadow-lg border ' +
                (isDarkMode
                  ? 'from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600/50 hover:border-gray-500/60'
                  : 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200/50 hover:border-gray-300/60')
              }
            >
              <svg className={"w-5 h-5 " + (isDarkMode ? "text-gray-300" : "text-gray-700")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className={
          `hidden lg:flex px-6 py-4 items-center justify-between shadow-sm border-b ` +
          (isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200')
        }>
          <div className="flex items-center space-x-4">
            <h1 className={
              'text-xl font-semibold ' + (isDarkMode ? 'text-white' : 'text-gray-900')
            }>Visual API Builder</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => saveVersion('Manual save')}
                className={
                  'px-5 py-2.5 rounded-xl active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold ' +
                  (isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white border border-blue-400/30 hover:border-blue-300/50 shadow-blue-900/40'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-500/20 hover:border-blue-600/30 shadow-blue-500/25')
                }
              >
                Save
              </button>
              <button
                onClick={() => setActivePanel('docs')}
                className={
                  'px-5 py-2.5 rounded-xl active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold ' +
                  (isDarkMode
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white border border-cyan-400/30 hover:border-cyan-300/50 shadow-cyan-900/40'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border border-gray-500/20 hover:border-gray-600/30 shadow-gray-500/25')
                }
              >
                View Docs
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={
                'p-2.5 rounded-xl bg-gradient-to-br active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-sm hover:shadow-lg border ' +
                (isDarkMode
                  ? 'from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600/50 hover:border-gray-500/60'
                  : 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200/50 hover:border-gray-300/60')
              }
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setActivePanel('debugger')}
              className={
                'px-5 py-2.5 rounded-xl active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold ' +
                (isDarkMode
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white border border-indigo-400/30 hover:border-indigo-300/50 shadow-indigo-900/40'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border border-indigo-500/20 hover:border-indigo-600/30 shadow-indigo-500/25')
              }
            >
              Debugger
            </button>
            <button
              onClick={() => setActivePanel('versions')}
              className={
                'px-5 py-2.5 rounded-xl active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-lg hover:shadow-xl font-semibold ' +
                (isDarkMode
                  ? 'bg-gradient-to-r from-fuchsia-600 to-pink-700 hover:from-fuchsia-500 hover:to-pink-600 text-white border border-pink-400/30 hover:border-pink-300/50 shadow-pink-900/40'
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border border-slate-500/20 hover:border-slate-600/30 shadow-slate-500/25')
              }
            >
              History
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {showSidebar && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)} />
              <div className={
                'absolute left-0 top-0 h-full w-80 shadow-xl ' +
                (isDarkMode ? 'bg-gray-800' : 'bg-white')
              }>
                <div className={
                  'p-4 flex items-center justify-between border-b ' +
                  (isDarkMode ? 'border-gray-700' : 'border-gray-200')
                }>
                  <h2 className={
                    'text-lg font-medium ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                  }>Components</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className={
                      'p-2.5 rounded-xl bg-gradient-to-br active:scale-95 hover:scale-105 transition-all duration-300 ease-out shadow-sm hover:shadow-lg border ' +
                      (isDarkMode
                        ? 'from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600/50 hover:border-gray-500/60'
                        : 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200/50 hover:border-gray-300/60')
                    }
                  >
                    <svg className={"w-5 h-5 " + (isDarkMode ? "text-gray-300" : "text-gray-700")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {nodeTemplates.map((template) => (
                    <div
                      key={template.type}
                      draggable={!isMobile}
                      onDragStart={!isMobile ? (e) => handleTemplateDragStart(e, template) : undefined}
                      onClick={() => {
                        if (isMobile) {
                          handleMobileTapAdd(template);
                        } else if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                          handleDesktopTapAdd(template);
                        }
                      }}
                      className={
                        `p-4 rounded-2xl border-2 border-dashed transition-colors ${template.color} ` +
                        (isDarkMode
                          ? 'border-gray-600 hover:border-gray-500 bg-opacity-20 hover:bg-opacity-30'
                          : 'border-gray-300 hover:border-gray-400 bg-opacity-10 hover:bg-opacity-20') +
                        (isMobile
                          ? ' cursor-pointer active:scale-95 hover:scale-105'
                          : ' cursor-grab active:cursor-grabbing')
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${template.color}`}></div>
                        <span className={
                          'font-medium ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                        }>{template.label}</span>
                        {isMobile && (
                          <div className="ml-auto">
                            <svg className={"w-4 h-4 " + (isDarkMode ? "text-blue-400" : "text-blue-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={
            'hidden lg:flex w-80 flex-col border-r ' +
            (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')
          }>
            <div className={
              'p-6 border-b ' + (isDarkMode ? 'border-gray-700' : 'border-gray-200')
            }>
              <h2 className={
                'text-lg font-medium mb-4 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
              }>Components</h2>
              <div className="space-y-3">
                {nodeTemplates.map((template) => (
                  <div
                    key={template.type}
                    draggable={!isMobile}
                    onDragStart={!isMobile ? (e) => handleTemplateDragStart(e, template) : undefined}
                    onClick={() => {
                      if (isMobile) {
                        handleMobileTapAdd(template);
                      } else if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                        handleDesktopTapAdd(template);
                      }
                    }}
                    className={
                      `p-4 rounded-2xl border-2 border-dashed transition-colors ${template.color} ` +
                      (isDarkMode
                        ? 'border-gray-600 hover:border-gray-500 bg-opacity-20 hover:bg-opacity-30'
                        : 'border-gray-300 hover:border-gray-400 bg-opacity-10 hover:bg-opacity-20') +
                      (isMobile
                        ? ' cursor-pointer active:scale-95 hover:scale-105'
                        : ' cursor-grab active:cursor-grabbing')
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${template.color}`}></div>
                      <span className={
                        'font-medium ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                      }>{template.label}</span>
                      {isMobile && (
                        <div className="ml-auto">
                          <svg className={"w-4 h-4 " + (isDarkMode ? "text-blue-400" : "text-blue-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={
              'p-6 border-b ' + (isDarkMode ? 'border-gray-700' : 'border-gray-200')
            }>
              <h3 className={
                'text-base font-medium mb-2 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
              }>Node Settings</h3>
              {selectedNode ? (
                (() => {
                  const node = nodes.find(n => n.id === selectedNode);
                  if (!node) return null;
                  return (
                    <form className="space-y-3">
                      <div className={
                        'font-semibold mb-2 ' + (isDarkMode ? 'text-white' : 'text-gray-800')
                      }>{node.data.label}</div>
                      {Object.entries(node.data.config).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <label className={
                            'text-xs mb-1 capitalize ' + (isDarkMode ? 'text-gray-200 font-semibold' : 'text-gray-600')
                          }>{key}</label>
                          <input
                            className={
                              'rounded-lg border outline-none px-3 py-2 transition-colors ' +
                              (isDarkMode
                                ? 'bg-gray-700 border-gray-600 focus:border-blue-400 text-white placeholder-gray-400'
                                : 'bg-gray-50 border-gray-300 focus:border-blue-400 text-gray-900 placeholder-gray-400')
                            }
                            type="text"
                            value={value}
                            onChange={e => {
                              const newValue = e.target.value;
                              setNodes(prev => prev.map(n =>
                                n.id === node.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        config: {
                                          ...n.data.config,
                                          [key]: newValue
                                        }
                                      }
                                    }
                                  : n
                              ));
                            }}
                            placeholder={key}
                          />
                        </div>
                      ))}
                    </form>
                  );
                })()
              ) : (
                <div className={
                  'text-sm ' + (isDarkMode ? 'text-gray-300' : 'text-gray-500')
                }>Select a node to edit its settings.</div>
              )}
            </div>
          </div>

          <div className="flex-1 relative min-h-0">
            <div
              ref={canvasRef}
              style={{ touchAction: 'none' }}
              className={
                `w-full h-full relative overflow-hidden transition-colors duration-200 ` +
                (isDarkMode ? 'bg-gray-900 ' : 'bg-gray-50 ') +
                (isDraggingOver ? (isDarkMode ? 'bg-blue-900/20 ' : 'bg-blue-50 ') : '') +
                (isDragging ? 'cursor-grabbing' : 'cursor-default')
              }
              onMouseMove={handleCanvasDrag}
              onTouchMove={handleCanvasDrag}
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              onClick={handleCanvasClick}
            >
              <svg
                className="absolute inset-0 pointer-events-none"
                width="100%"
                height="100%"
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 2 }}
              >
                {connections.map(conn => {
                  const from = handlePositions[conn.from]?.output;
                  const to = handlePositions[conn.to]?.input;
                  if (!from || !to) return null;
                  const dx = Math.abs(to.x - from.x) * 0.5;
                  const path = `M${from.x},${from.y} C${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`;
                  return (
                    <path
                      key={conn.id}
                      d={path}
                      stroke={isDarkMode ? '#60a5fa' : '#2563eb'}
                      strokeWidth={3}
                      fill="none"
                      opacity={0.85}
                      style={{ filter: isDarkMode ? 'drop-shadow(0 2px 6px #1e293b88)' : 'drop-shadow(0 2px 6px #3b82f688)' }}
                    />
                  );
                })}
              </svg>

              {isDragging && draggedNode && (
                <div
                  className="absolute pointer-events-none opacity-20"
                  style={{
                    left: dragPosition.x + 4,
                    top: dragPosition.y + 4,
                    minWidth: '160px',
                    maxWidth: '200px',
                    height: '80px',
                    backgroundColor: '#000',
                    borderRadius: '16px',
                    filter: 'blur(8px)',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                />
              )}

              {nodes.map((node) => {
                const isBeingDragged = draggedNode === node.id && isDragging;
                const displayPosition = isBeingDragged ? dragPosition : node.position;
                const isNewlyAdded = lastAddedNode === node.id;
                let dragBg = '';
                if (isBeingDragged) {
                  dragBg = isDarkMode
                    ? 'bg-gray-800 border-blue-400 dark:border-blue-300'
                    : 'bg-white border-blue-500';
                }
                return (
                  <NodeComponent
                    key={node.id}
                    node={node}
                    selectedNode={selectedNode}
                    isBeingDragged={isBeingDragged}
                    displayPosition={displayPosition}
                    isNewlyAdded={isNewlyAdded}
                    isDarkMode={isDarkMode}
                    dragBg={dragBg}
                    draggedNode={draggedNode}
                    handleNodeDragStart={handleNodeDragStart}
                    handleOutputHandleClick={handleOutputHandleClick}
                    handleInputHandleClick={handleInputHandleClick}
                    setSelectedNode={setSelectedNode}
                    updateHandlePosition={updateHandlePosition}
                    connectFrom={connectFrom}
                  />
                );
              })}
            </div>
          </div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0">
            <div className={
              (isDarkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200') +
              ' shadow-lg'
            }>
              <div className="flex">
                <button
                  onClick={() => setActivePanel('debugger')}
                  className={
                    `flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ease-out active:scale-95 ` +
                    (activePanel === 'debugger'
                      ? (isDarkMode
                        ? 'text-blue-400 border-b-2 border-blue-400 bg-gradient-to-t from-blue-900/20 to-transparent shadow-sm'
                        : 'text-blue-600 border-b-2 border-blue-600 bg-gradient-to-t from-blue-50 to-transparent shadow-sm')
                      : (isDarkMode
                        ? 'text-gray-400 hover:text-blue-400 hover:bg-gradient-to-t hover:from-blue-900/10 hover:to-transparent hover:shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-t hover:from-blue-50 hover:to-transparent hover:shadow-sm'))
                  }
                >
                  Debugger
                </button>
                <button
                  onClick={() => setActivePanel('docs')}
                  className={
                    `flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ease-out active:scale-95 ` +
                    (activePanel === 'docs'
                      ? (isDarkMode
                        ? 'text-blue-400 border-b-2 border-blue-400 bg-gradient-to-t from-blue-900/20 to-transparent shadow-sm'
                        : 'text-blue-600 border-b-2 border-blue-600 bg-gradient-to-t from-blue-50 to-transparent shadow-sm')
                      : (isDarkMode
                        ? 'text-gray-400 hover:text-blue-400 hover:bg-gradient-to-t hover:from-blue-900/10 hover:to-transparent hover:shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-t hover:from-blue-50 hover:to-transparent hover:shadow-sm'))
                  }
                >
                  Docs
                </button>
                <button
                  onClick={() => setActivePanel('versions')}
                  className={
                    `flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ease-out active:scale-95 ` +
                    (activePanel === 'versions'
                      ? (isDarkMode
                        ? 'text-blue-400 border-b-2 border-blue-400 bg-gradient-to-t from-blue-900/20 to-transparent shadow-sm'
                        : 'text-blue-600 border-b-2 border-blue-600 bg-gradient-to-t from-blue-50 to-transparent shadow-sm')
                      : (isDarkMode
                        ? 'text-gray-400 hover:text-blue-400 hover:bg-gradient-to-t hover:from-blue-900/10 hover:to-transparent hover:shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-t hover:from-blue-50 hover:to-transparent hover:shadow-sm'))
                  }
                >
                  History
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {activePanel === 'debugger' && (
                  <div className="p-4">
                    <h3 className={
                      'text-sm font-medium mb-3 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                    }>Live Debugger</h3>
                    <div className="space-y-3">
                      {Object.entries(simulationData).map(([nodeId, data]) => {
                        const node = nodes.find(n => n.id === nodeId);
                        if (!node) return null;
                        return (
                          <div key={nodeId} className={
                            'p-3 rounded-xl border ' +
                            (isDarkMode
                              ? 'border-gray-600 bg-gray-700'
                              : 'border-gray-200 bg-gray-50')
                          }>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${
                                node.type === 'auth' ? 'bg-blue-500' :
                                node.type === 'transformer' ? 'bg-green-500' :
                                node.type === 'conditional' ? 'bg-yellow-500' :
                                'bg-purple-500'
                              }`}></div>
                              <span className={
                                'font-medium text-xs truncate ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                              }>{node.data.label}</span>
                            </div>
                            <div className={
                              'text-xs space-y-1 ' + (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                            }>
                              <div>Type: {node.type}</div>
                              <div>Variables:</div>
                              <pre className={isDarkMode ? 'bg-gray-800 text-gray-100 rounded p-2 text-xs' : 'bg-gray-100 text-gray-800 rounded p-2 text-xs'} style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                                {JSON.stringify(data.variables, null, 2)}
                              </pre>
                              <div>Log: {data.log}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {activePanel === 'docs' && (
                  <div className="p-4">
                    <h3 className={
                      'text-sm font-medium mb-3 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                    }>OpenAPI Documentation</h3>
                    <div className={
                      (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') + ' rounded-xl p-3'
                    }>
                      <pre className={
                        'text-xs overflow-x-auto ' + (isDarkMode ? 'text-gray-200' : 'text-gray-800')
                      }>
                        {JSON.stringify(generateOpenAPI(), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {activePanel === 'versions' && (
                  <div className="p-4">
                    <h3 className={
                      'text-sm font-medium mb-3 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                    }>Version History</h3>
                    <div className="space-y-3">
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className={
                            'p-3 rounded-xl border-2 cursor-pointer transition-colors ' +
                            (currentVersion === version.id
                              ? (isDarkMode
                                ? 'border-blue-400 bg-blue-900/20'
                                : 'border-blue-500 bg-blue-50')
                              : (isDarkMode
                                ? 'border-gray-600 hover:border-gray-500'
                                : 'border-gray-200 hover:border-gray-300'))
                          }
                          onClick={() => loadVersion(version.id)}
                        >
                          <div className={
                            'text-xs font-medium ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                          }>{version.description}</div>
                          <div className={
                            'text-xs mt-1 ' + (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                          }>
                            {version.timestamp.toLocaleString()}
                          </div>
                          <div className={
                            'text-xs mt-1 ' + (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                          }>
                            {version.nodes.length} nodes, {version.connections.length} connections
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={
            'hidden lg:flex w-96 flex-col border-l ' +
            (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')
          }>
            <div className={
              'p-4 border-b ' + (isDarkMode ? 'border-gray-700' : 'border-gray-200')
            }>
              <h4 className={'text-base font-semibold mb-2 ' + (isDarkMode ? 'text-white' : 'text-gray-900')}>How to use</h4>
              <ul className={'text-xs space-y-1 ' + (isDarkMode ? 'text-gray-200' : 'text-gray-700')}>
                <li><b>Add nodes:</b> Drag from the left panel or tap a component.</li>
                <li><b>Connect:</b> Click an output handle, then an input handle.</li>
                <li><b>Edit:</b> Select a node to change its settings.</li>
                <li><b>Simulate:</b> View results in the Debugger panel.</li>
              </ul>
            </div>
            {activePanel === 'debugger' && (
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className={
                  'text-lg font-medium mb-4 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                }>Live Debugger</h2>
                <div className="space-y-4">
                  {Object.entries(simulationData).map(([nodeId, data]) => {
                    const node = nodes.find(n => n.id === nodeId);
                    if (!node) return null;
                    return (
                      <div key={nodeId} className={
                        'p-4 rounded-2xl border ' +
                        (isDarkMode
                          ? 'border-gray-600 bg-gray-700'
                          : 'border-gray-200 bg-gray-50')
                      }>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${
                            node.type === 'auth' ? 'bg-blue-500' :
                            node.type === 'transformer' ? 'bg-green-500' :
                            node.type === 'conditional' ? 'bg-yellow-500' :
                            'bg-purple-500'
                          }`}></div>
                          <span className={
                            'font-medium text-sm ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                          }>{node.data.label}</span>
                        </div>
                        <div className={
                          'text-xs space-y-1 ' + (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                        }>
                          <div>Type: {node.type}</div>
                          <div>Variables:</div>
                          <pre className={isDarkMode ? 'bg-gray-800 text-gray-100 rounded p-2 text-xs' : 'bg-gray-100 text-gray-800 rounded p-2 text-xs'} style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                            {JSON.stringify(data.variables, null, 2)}
                          </pre>
                          <div>Log: {data.log}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activePanel === 'docs' && (
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className={
                  'text-lg font-medium mb-4 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                }>OpenAPI Documentation</h2>
                <div className={
                  (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') + ' rounded-2xl p-4'
                }>
                  <pre className={
                    'text-xs overflow-x-auto ' + (isDarkMode ? 'text-gray-200' : 'text-gray-800')
                  }>
                    {JSON.stringify(generateOpenAPI(), null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {activePanel === 'versions' && (
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className={
                  'text-lg font-medium mb-4 ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                }>Version History</h2>
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={
                        'p-4 rounded-2xl border-2 cursor-pointer transition-colors ' +
                        (currentVersion === version.id
                          ? (isDarkMode
                            ? 'border-blue-400 bg-blue-900/20'
                            : 'border-blue-500 bg-blue-50')
                          : (isDarkMode
                            ? 'border-gray-600 hover:border-gray-500'
                            : 'border-gray-200 hover:border-gray-300'))
                      }
                      onClick={() => loadVersion(version.id)}
                    >
                      <div className={
                        'text-sm font-medium ' + (isDarkMode ? 'text-white' : 'text-gray-900')
                      }>{version.description}</div>
                      <div className={
                        'text-xs mt-1 ' + (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                      }>
                        {version.timestamp.toLocaleString()}
                      </div>
                      <div className={
                        'text-xs mt-1 ' + (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                      }>
                        {version.nodes.length} nodes, {version.connections.length} connections
                      </div>
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

export default VisualAPIBuilder;