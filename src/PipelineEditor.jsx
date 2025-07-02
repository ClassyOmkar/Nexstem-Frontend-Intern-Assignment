import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  addEdge, useNodesState, useEdgesState, Connection, Edge, Node, 
  Background, Controls, MiniMap, useReactFlow, OnConnect, OnNodesChange, OnEdgesChange,
  ReactFlowProvider, Handle, Position
} from 'reactflow';
import { FiPlus, FiGrid, FiDatabase, FiSettings, FiTarget, FiTrash2 } from 'react-icons/fi';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Custom node component
function CustomNode({ id, data, selected }) {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    if (window.confirm(`Delete node "${data.label}"?`)) {
      // Remove the node by dispatching a custom event
      const deleteEvent = new CustomEvent('deleteNode', { detail: { nodeId: id } });
      window.dispatchEvent(deleteEvent);
    }
  };

  // Color-coded node types based on assignment
  const getNodeColor = (nodeType) => {
    switch (nodeType) {
      case 'dataSource': return '#2563eb'; // Blue
      case 'processing': return '#7c3aed'; // Purple  
      case 'output': return '#dc2626'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const getNodeIcon = (nodeType) => {
    switch (nodeType) {
      case 'dataSource': return <FiDatabase size={16} />;
      case 'processing': return <FiSettings size={16} />;
      case 'output': return <FiTarget size={16} />;
      default: return <FiSettings size={16} />;
    }
  };

  const getNodePrefix = (nodeType) => {
    switch (nodeType) {
      case 'dataSource': return 'DS';
      case 'processing': return 'PR';
      case 'output': return 'OUT';
      default: return 'N';
    }
  };

  return (
    <div 
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: getNodeColor(data.type),
        color: 'white',
        border: selected ? '3px solid #fbbf24' : '2px solid transparent',
        minWidth: '120px',
        textAlign: 'center',
        position: 'relative',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      {/* Node type indicator */}
      <div style={{ 
        backgroundColor: getNodeColor(data.type), 
        position: 'absolute', 
        top: '-8px', 
        right: '-8px', 
        fontSize: '10px', 
        padding: '2px 4px', 
        borderRadius: '10px', 
        color: 'white', 
        fontWeight: 'bold',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {getNodePrefix(data.type)}
      </div>
      
      {/* ReactFlow connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#fff',
          border: '2px solid ' + getNodeColor(data.type),
          width: '12px',
          height: '12px',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#fff',
          border: '2px solid ' + getNodeColor(data.type),
          width: '12px',
          height: '12px',
        }}
      />

      {/* Delete button */}
      {showDeleteButton && (
        <button 
          onClick={handleDeleteClick}
          style={{
            position: 'absolute',
            top: '-8px',
            left: '-8px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          title="Delete node"
        >
          <FiTrash2 size={12} />
        </button>
      )}

      {/* Node icon */}
      <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        {getNodeIcon(data.type)}
        <span>{data.label}</span>
      </div>
    </div>
  );
}

// Node Creation Modal Component
function NodeCreationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState('dataSource');

  React.useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('openNodeModal', handleOpenModal);
    return () => window.removeEventListener('openNodeModal', handleOpenModal);
  }, []);

  const handleCreateNode = () => {
    if (newNodeName.trim()) {
      const createEvent = new CustomEvent('createNode', { 
        detail: { name: newNodeName.trim(), nodeType: newNodeType } 
      });
      window.dispatchEvent(createEvent);
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewNodeName('');
    setNewNodeType('dataSource');
  };

  if (!isModalOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
        minWidth: '400px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>Add New Node</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Node Name:</label>
          <input 
            type="text" 
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Enter node name..."
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Node Type:</label>
          <select 
            value={newNodeType}
            onChange={(e) => setNewNodeType(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          >
            <option value="dataSource">Data Source</option>
            <option value="processing">Processing</option>
            <option value="output">Output</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleModalClose}
            style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateNode}
            disabled={!newNodeName.trim()}
            style={{ 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: newNodeName.trim() ? '#2563eb' : '#d1d5db',
              color: 'white', 
              cursor: newNodeName.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Create Node
          </button>
        </div>
      </div>
    </div>
  );
}

function PipelineFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [invalidConnection, setInvalidConnection] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const { fitView } = useReactFlow();

  // Connection validation
  const onConnect = useCallback((params) => {
    // Prevent self-connection
    if (params.source === params.target) {
      setInvalidConnection(true);
      setTimeout(() => setInvalidConnection(false), 2000); // Clear after 2 seconds
      return;
    }
    
    setEdges((eds) => addEdge({ ...params, type: 'default' }, eds));
  }, [setEdges]);

  // Custom event handlers
  React.useEffect(() => {
    const handleCreateNode = (event) => {
      const { name, nodeType } = event.detail;
      
      const newNode = {
        id: `node-${nodeIdCounter}`,
        type: 'custom',
        position: { 
          x: Math.random() * 400 + 200, 
          y: Math.random() * 300 + 100 
        },
        data: { label: name, type: nodeType }
      };
      
      setNodes((nds) => nds.concat(newNode));
      setNodeIdCounter(prev => prev + 1);
    };

    const handleDeleteNode = (event) => {
      const { nodeId } = event.detail;
      setNodes((nds) => nds.filter(node => node.id !== nodeId));
      setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    };

    window.addEventListener('createNode', handleCreateNode);
    window.addEventListener('deleteNode', handleDeleteNode);
    
    return () => {
      window.removeEventListener('createNode', handleCreateNode);
      window.removeEventListener('deleteNode', handleDeleteNode);
    };
  }, [nodeIdCounter, setNodes, setEdges]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Get selected node IDs before deletion
        const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
        
        // Delete selected nodes
        setNodes((nds) => nds.filter(node => !node.selected));
        
        // Delete selected edges AND edges connected to deleted nodes
        setEdges((eds) => eds.filter(edge => {
          // Keep edge if it's not selected AND not connected to deleted nodes
          return !edge.selected && 
                 !selectedNodeIds.includes(edge.source) && 
                 !selectedNodeIds.includes(edge.target);
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, setNodes, setEdges]);

  // Node types for ReactFlow
  const nodeTypes = useMemo(() => ({
    custom: CustomNode
  }), []);

  const handleAddNode = () => {
    window.dispatchEvent(new CustomEvent('openNodeModal'));
  };

  // Auto Layout with Dagre
  const getLayoutedElements = useCallback((nodes, edges, direction = 'TB') => {
    // Return original nodes if no nodes to layout
    if (nodes.length === 0) {
      return { nodes, edges };
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });

    // Add all nodes to dagre graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 60 });
    });

    // Add edges only if they exist
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run dagre layout
    dagre.layout(dagreGraph);

    // Map nodes to new positions, with fallback for missing positions
    const layoutedNodes = nodes.map((node, index) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      
      // Fallback positioning if dagre fails
      if (!nodeWithPosition) {
        return {
          ...node,
          position: {
            x: 200 + (index % 3) * 200,
            y: 100 + Math.floor(index / 3) * 100,
          },
        };
      }
      
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 75,
          y: nodeWithPosition.y - 30,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }, []);

  const handleAutoLayout = useCallback(() => {
    console.log('Auto Layout - Before:', { nodeCount: nodes.length, edgeCount: edges.length });
    
    if (nodes.length < 2) {
      console.log('Auto Layout - Not enough nodes for layout');
      return;
    }
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    console.log('Auto Layout - After layouting:', { 
      layoutedNodeCount: layoutedNodes.length, 
      layoutedEdgeCount: layoutedEdges.length 
    });
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // Call fitView after a short delay
    setTimeout(() => {
      console.log('Auto Layout - Calling fitView');
      fitView();
    }, 100);
  }, [nodes, edges, getLayoutedElements, setNodes, setEdges, fitView]);

  // DAG validation
  const dagStatus = useMemo(() => {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    
    // Check minimum nodes (at least 2)
    const hasMinimumNodes = nodeCount >= 2;
    
    // Check for cycles using DFS
    const adjacencyList = {};
    nodes.forEach(node => {
      adjacencyList[node.id] = [];
    });
    
    edges.forEach(edge => {
      if (adjacencyList[edge.source]) {
        adjacencyList[edge.source].push(edge.target);
      }
    });
    
    let hasCycles = false;
    const visited = new Set();
    const recStack = new Set();
    
    const dfsVisit = (nodeId) => {
      if (recStack.has(nodeId)) return true; // Cycle found
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recStack.add(nodeId);
      
      if (adjacencyList[nodeId]) {
        for (const neighbor of adjacencyList[nodeId]) {
          if (dfsVisit(neighbor)) {
            hasCycles = true;
            return true;
          }
        }
      }
      
      recStack.delete(nodeId);
      return false;
    };
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfsVisit(node.id)) {
          hasCycles = true;
          break;
        }
      }
    }
    
    const noCycles = !hasCycles;
    
    // Check if all nodes are connected (for nodes >= 2)
    let allNodesConnected = true;
    if (nodeCount >= 2) {
      const connectedNodes = new Set();
      edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      });
      allNodesConnected = connectedNodes.size === nodeCount;
    }
    
    const isValidDAG = hasMinimumNodes && noCycles && allNodesConnected;
    
    return {
      isValidDAG,
      hasMinimumNodes,
      noCycles,
      allNodesConnected,
      nodeCount,
      edgeCount
    };
  }, [nodes, edges]);

  // Context menu component
  const ContextMenu = ({ id, top, left, ...props }) => (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}
      {...props}
    >
      <button
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 12px',
          border: 'none',
          backgroundColor: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '14px'
        }}
        onClick={() => {
          const deleteEvent = new CustomEvent('deleteNode', { detail: { nodeId: id } });
          window.dispatchEvent(deleteEvent);
          setContextMenu(null);
        }}
      >
        🗑️ Delete Node
      </button>
    </div>
  );

  // Right-click context menu
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    
    setContextMenu({
      id: node.id,
      top: event.clientY,
      left: event.clientX,
    });
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '16px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>PE</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Pipeline Editor</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleAddNode}
            title="Add a new node to the pipeline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <FiPlus size={16} />
            Add Node
          </button>
          
          <button 
            onClick={handleAutoLayout}
            title="Automatically arrange nodes using dagre layout algorithm"
            disabled={nodes.length < 2}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: nodes.length < 2 ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: nodes.length < 2 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => nodes.length >= 2 && (e.target.style.backgroundColor = '#059669')}
            onMouseOut={(e) => nodes.length >= 2 && (e.target.style.backgroundColor = '#10b981')}
          >
            <FiGrid size={16} />
            Auto Layout
          </button>
          
          <button 
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            title="Toggle JSON preview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: showJsonPreview ? '#eab308' : '#6b7280',
              color: showJsonPreview ? 'black' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            📄 JSON
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left Validation Panel */}
        <div style={{ width: '320px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontWeight: '600', color: '#1e293b', fontSize: '18px', marginBottom: '16px', margin: 0 }}>Pipeline Status</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Status:</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: dagStatus.isValidDAG ? '#dcfce7' : '#fecaca',
                    color: dagStatus.isValidDAG ? '#166534' : '#dc2626'
                  }}>
                    {dagStatus.isValidDAG ? '✅ Valid DAG' : '❌ Invalid DAG'}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ color: '#64748b' }}>Nodes</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{dagStatus.nodeCount}</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ color: '#64748b' }}>Edges</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{dagStatus.edgeCount}</div>
                  </div>
                </div>
                
                {(dagStatus.nodeCount > 0 && !dagStatus.hasMinimumNodes) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '14px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                    Need at least 2 nodes
                  </div>
                )}
                {(dagStatus.nodeCount >= 2 && !dagStatus.allNodesConnected) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '14px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                    All nodes must be connected
                  </div>
                )}
                {(dagStatus.nodeCount >= 2 && !dagStatus.noCycles) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '14px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                    Cycles detected
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontWeight: '600', color: '#1e293b', fontSize: '18px', marginBottom: '16px', margin: 0 }}>Node Types</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', backgroundColor: '#dbeafe' }}>
                  <FiDatabase style={{ color: '#2563eb' }} size={16} />
                  <span style={{ fontWeight: '500', color: '#1e40af' }}>Data Source</span>
                  <span style={{ marginLeft: 'auto', backgroundColor: '#bfdbfe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>DS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', backgroundColor: '#f3e8ff' }}>
                  <FiSettings style={{ color: '#7c3aed' }} size={16} />
                  <span style={{ fontWeight: '500', color: '#6b21a8' }}>Processing</span>
                  <span style={{ marginLeft: 'auto', backgroundColor: '#ddd6fe', color: '#6b21a8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>PR</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', backgroundColor: '#fecaca' }}>
                  <FiTarget style={{ color: '#dc2626' }} size={16} />
                  <span style={{ fontWeight: '500', color: '#991b1b' }}>Output</span>
                  <span style={{ marginLeft: 'auto', backgroundColor: '#fca5a5', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>OUT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Invalid Connection Feedback */}
          {invalidConnection && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              fontWeight: '500'
            }}>
              ❌ Invalid Connection: Cannot connect node to itself
            </div>
          )}
          
          <ReactFlow 
            nodes={nodes} 
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            style={{ width: '100%', height: '100%' }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
          
          {contextMenu && (
            <ContextMenu
              id={contextMenu.id}
              top={contextMenu.top}
              left={contextMenu.left}
            />
          )}
        </div>
      </div>

      {/* JSON Preview Panel */}
      {showJsonPreview && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          zIndex: 50,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          padding: '16px',
          width: '320px',
          maxHeight: '384px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>Live JSON State</h3>
            <button 
              onClick={() => setShowJsonPreview(false)}
              style={{ color: '#9ca3af', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div>
              <h4 style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', margin: 0 }}>Nodes ({nodes.length})</h4>
              <pre style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px',
                margin: 0
              }}>
                {JSON.stringify(nodes, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', margin: 0 }}>Edges ({edges.length})</h4>
              <pre style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px',
                margin: 0
              }}>
                {JSON.stringify(edges, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <NodeCreationModal />
    </div>
  );
}

export default function PipelineEditor() {
  return (
    <ReactFlowProvider>
      <PipelineFlow />
    </ReactFlowProvider>
  );
}