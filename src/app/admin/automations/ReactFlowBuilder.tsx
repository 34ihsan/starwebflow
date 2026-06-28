"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Connection,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Settings, Trash2, Mail, MessageCircle, Database, Globe, Zap, FileText, Activity, MessageSquare, Terminal } from 'lucide-react';

// Common node styling
const nodeStyle = "rounded-xl border border-white/10 shadow-xl bg-[#0A0A0F] p-4 min-w-[200px]";

// --- Custom Nodes ---

// Helper function to resolve dynamic summaries for node config parameters
const resolveNodeSummary = (data: any) => {
  const raw = data.rawData || {};
  const config = raw.config || {};
  const appName = (raw.app || data.label || "").toLowerCase();

  // If a custom description is explicitly provided
  if (config.description) return config.description;

  if (appName.includes("email") || appName.includes("posta")) {
    return config.subject ? `E-posta: "${config.subject}"` : "Kullanıcıya bildirim e-postası gönderilir.";
  }
  if (appName.includes("slack")) {
    return config.channel ? `Slack: ${config.channel}` : "Slack kanalına bildirim iletilir.";
  }
  if (appName.includes("whatsapp")) {
    return "Müşteriye WhatsApp şablon mesajı gönderilir.";
  }
  if (appName.includes("crm") || appName.includes("database")) {
    const actionMap: Record<string, string> = {
      create_project: "Proje Oluştur",
      create_task: "Görev Oluştur",
      update_lead: "Lead Güncelle",
      create_contract: "Sözleşme Hazırla"
    };
    return `CRM: ${actionMap[config.action] || "Veritabanı kaydı güncellenir."}`;
  }
  if (appName.includes("ai")) {
    return config.prompt ? `AI Görevi: "${config.prompt.substring(0, 30)}..."` : "Yapay Zeka otonom işlem gerçekleştirir.";
  }
  if (appName.includes("delay")) {
    return config.hours ? `Bekleme: ${config.hours} Saat` : "24 Saat bekleme uygulanır.";
  }
  if (appName.includes("webhook")) {
    return "Harici API tetikleyicisi dinlenir.";
  }
  if (appName.includes("cron")) {
    return "Zamanlanmış periyodik tetikleyici.";
  }
  if (appName.includes("typeform")) {
    return "Yeni bir form yanıtı tetikleyici.";
  }

  return "Otomasyon sistemi özel akış adımı.";
};

// 1. Trigger Node
const TriggerNode = ({ data }: any) => {
  const summary = resolveNodeSummary(data);
  return (
    <div className={nodeStyle}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#4F8EF7]/10 text-[#4F8EF7] shrink-0">
            {data.icon === 'Mail' ? <Mail className="w-5 h-5"/> : <Zap className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Tetikleyici (Trigger)</div>
            <div className="text-sm font-semibold text-white">{data.label}</div>
          </div>
        </div>
        <div className="text-[10px] text-[#94A3B8] border-t border-white/5 pt-2 leading-relaxed italic">
          {summary}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#4F8EF7] border-2 border-[#0A0A0F]" />
    </div>
  );
};

// 2. Action Node
const ActionNode = ({ data }: any) => {
  const summary = resolveNodeSummary(data);
  return (
    <div className={nodeStyle}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#10B981] border-2 border-[#0A0A0F]" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#10B981]/10 text-[#10B981] shrink-0">
            {data.icon === 'Mail' ? <Mail className="w-5 h-5"/> : 
             data.icon === 'Database' ? <Database className="w-5 h-5"/> : 
             <Zap className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Aksiyon (Action)</div>
            <div className="text-sm font-semibold text-white">{data.label}</div>
          </div>
        </div>
        <div className="text-[10px] text-[#94A3B8] border-t border-white/5 pt-2 leading-relaxed italic">
          {summary}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#10B981] border-2 border-[#0A0A0F]" />
    </div>
  );
};

// 3. Approval Node
const ApprovalNode = ({ data }: any) => {
  const summary = resolveNodeSummary(data);
  return (
    <div className={`${nodeStyle} border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500 border-2 border-[#0A0A0F]" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-500">Admin Onayı (Gate)</div>
            <div className="text-sm font-semibold text-white">{data.label}</div>
          </div>
        </div>
        <div className="text-[10px] text-[#94A3B8] border-t border-white/5 pt-2 leading-relaxed italic">
          {summary}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border-2 border-[#0A0A0F]" />
    </div>
  );
};

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  approvalNode: ApprovalNode,
};

export default function ReactFlowBuilder({ initialFlow, onSave, onCancel, onTest }: { initialFlow: any, onSave: (flow: any) => void, onCancel: () => void, onTest?: () => void }) {
  // Translate our custom JSON "nodes" into ReactFlow Nodes & Edges
  
  const mapToReactFlow = (dbNodes: any[]) => {
    if (!dbNodes || dbNodes.length === 0) {
      return {
        initialNodes: [{ id: '1', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Yeni Tetikleyici Ekle', icon: 'Zap' } }],
        initialEdges: []
      };
    }
    
    const rfNodes: any[] = [];
    const rfEdges: any[] = [];
    
    dbNodes.forEach((n, i) => {
      let type = 'actionNode';
      if (n.type === 'trigger' || i === 0) type = 'triggerNode';
      if (n.type === 'approval' || n.app === 'Admin Approval') type = 'approvalNode';
      
      rfNodes.push({
        id: n.id || `node-${i}`,
        type: type,
        position: { x: 250, y: 50 + (i * 150) },
        data: { label: n.label || n.app, icon: n.app === 'Email' ? 'Mail' : n.app === 'Database' ? 'Database' : 'Zap', rawData: n }
      });
      
      if (i > 0) {
        rfEdges.push({
          id: `e${dbNodes[i-1].id || `node-${i-1}`}-${n.id || `node-${i}`}`,
          source: dbNodes[i-1].id || `node-${i-1}`,
          target: n.id || `node-${i}`,
          animated: true,
          style: { stroke: '#4F8EF7', strokeWidth: 2 }
        });
      }
    });
    
    return { initialNodes: rfNodes, initialEdges: rfEdges };
  };

  const { initialNodes, initialEdges } = mapToReactFlow(initialFlow?.nodes || []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#4F8EF7', strokeWidth: 2 } }, eds)), [setEdges]);

  const onNodeClick = (event: any, node: any) => {
    setSelectedNodeId(node.id);
  };

  const handleSave = () => {
    // Translate back to our custom JSON format
    // Just a basic map back for now based on nodes ordering via edges
    const dbNodes = nodes.map(n => {
      return {
        id: n.id,
        type: n.type === 'triggerNode' ? 'trigger' : n.type === 'approvalNode' ? 'approval' : 'action',
        app: n.data.label,
        label: n.data.label,
        config: n.data.rawData?.config || {}
      };
    });
    
    onSave({ ...initialFlow, nodes: dbNodes });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05050A] flex flex-col">
      {/* Builder Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0F]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white">{initialFlow?.name || "Yeni Otomasyon"}</h2>
          <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">EDITING</span>
        </div>
        <div className="flex items-center gap-3">
          {onTest && (
            <button 
              onClick={onTest}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-all text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.3)] shrink-0 mr-2"
            >
              <Terminal className="w-4 h-4" /> Akışı Test Et (Dry Run)
            </button>
          )}
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-[#94A3B8] hover:text-white transition-colors text-sm font-medium">İptal</button>
          <button onClick={handleSave} className="bg-gradient-to-r from-[#10B981] to-[#4F8EF7] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:opacity-90 transition-all">
            Akışı Kaydet
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#05050A]"
          >
            <Background color="#1E293B" gap={16} size={1} />
            <Controls className="bg-[#0A0A0F] border-white/10 fill-white" />
            <MiniMap 
              nodeColor={(n) => {
                if (n.type === 'triggerNode') return '#4F8EF7';
                if (n.type === 'approvalNode') return '#F59E0B';
                return '#10B981';
              }}
              maskColor="rgba(5, 5, 10, 0.8)"
              className="bg-[#0A0A0F] border border-white/10"
            />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-white/10 bg-[#0A0A0F] flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white">Düğüm (Node) Ayarları</h3>
            <p className="text-xs text-[#64748B] mt-1">Canvas üzerinden bir düğüm seçin</p>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {selectedNodeId ? (() => {
              const selectedNode = nodes.find(n => n.id === selectedNodeId);
              if (!selectedNode) return null;
              const rawData = selectedNode.data.rawData || {};
              const app = rawData.app || selectedNode.data.label || "Custom";
              const config = rawData.config || {};

              const updateConfig = (key: string, value: any) => {
                setNodes(nds => nds.map(n => {
                  if (n.id !== selectedNodeId) return n;
                  const newRawData = { ...n.data.rawData, config: { ...(n.data.rawData?.config || {}), [key]: value } };
                  return { ...n, data: { ...n.data, rawData: newRawData } };
                }));
              };

              const updateApp = (newApp: string) => {
                setNodes(nds => nds.map(n => {
                  if (n.id !== selectedNodeId) return n;
                  const newRawData = { ...n.data.rawData, app: newApp };
                  return { ...n, data: { ...n.data, label: newApp, rawData: newRawData } };
                }));
              };

              return (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#94A3B8] uppercase">Adım İsmi</label>
                      <input 
                        type="text" 
                        value={selectedNode.data.label || ""}
                        onChange={(e) => {
                          setNodes(nds => nds.map(n => {
                            if (n.id !== selectedNodeId) return n;
                            const newRawData = { ...n.data.rawData, label: e.target.value };
                            return { ...n, data: { ...n.data, label: e.target.value, rawData: newRawData } };
                          }));
                        }}
                        className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#94A3B8] uppercase">Uygulama / Tip</label>
                      <select 
                        value={app}
                        onChange={(e) => updateApp(e.target.value)}
                        className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]"
                      >
                        <option value="Email">Email (E-posta)</option>
                        <option value="Slack">Slack (Bildirim)</option>
                        <option value="CRM">CRM (İşlemler)</option>
                        <option value="WhatsApp">WhatsApp (Mesaj)</option>
                        <option value="Star AI">Star AI (Zenginleştirme)</option>
                        <option value="Webhook">Webhook (Tetikleyici)</option>
                        <option value="Cron">Cron (Zamanlayıcı)</option>
                        <option value="Typeform">Typeform (Form)</option>
                        <option value="Delay">Delay (Bekleme Süresi)</option>
                        <option value="Admin Approval">Admin Approval (Onay)</option>
                        <option value="Custom">Custom (Özel)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#94A3B8] uppercase">Adım Açıklaması</label>
                      <textarea
                        value={config.description || ""}
                        onChange={(e) => updateConfig("description", e.target.value)}
                        className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4F8EF7] min-h-[60px]"
                        placeholder="Bu adımın ne yaptığını kısaca yazın (örn: Müşteriye hoşgeldin mesajı atar)."
                      />
                    </div>
                  </div>

                  {/* App Specific Configs */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5" /> Konfigürasyon
                    </h4>

                    {(app.includes("Email") || app.includes("posta")) && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Konu (Subject)</label>
                          <input type="text" value={config.subject || ""} onChange={e => updateConfig("subject", e.target.value)} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4F8EF7]" placeholder="E-posta Konusu" />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Şablon (Template)</label>
                          <input type="text" value={config.templateId || ""} onChange={e => updateConfig("templateId", e.target.value)} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4F8EF7]" placeholder="Şablon ID veya Adı" />
                        </div>
                      </div>
                    )}

                    {app.includes("Slack") && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Kanal / Kullanıcı</label>
                          <input type="text" value={config.channel || ""} onChange={e => updateConfig("channel", e.target.value)} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4F8EF7]" placeholder="#general veya @user" />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Mesaj İçeriği</label>
                          <textarea value={config.message || ""} onChange={e => updateConfig("message", e.target.value)} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4F8EF7] min-h-[60px]" placeholder="Gönderilecek mesaj..."></textarea>
                        </div>
                      </div>
                    )}

                    {(app.includes("CRM") || app.includes("Database")) && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Aksiyon (Action)</label>
                          <select value={config.action || "create_project"} onChange={e => updateConfig("action", e.target.value)} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4F8EF7]">
                            <option value="create_project">Proje Oluştur</option>
                            <option value="create_task">Görev Oluştur</option>
                            <option value="update_lead">Lead Güncelle</option>
                            <option value="create_contract">Sözleşme Hazırla</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {(app.includes("Star AI") || app.includes("AI")) && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Prompt (Görev)</label>
                          <textarea value={config.prompt || ""} onChange={e => updateConfig("prompt", e.target.value)} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4F8EF7] min-h-[80px]" placeholder="AI'dan ne yapmasını istiyorsunuz?"></textarea>
                        </div>
                      </div>
                    )}

                    {app.includes("Delay") && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Süre (Saat)</label>
                          <input type="number" value={config.hours || 24} onChange={e => updateConfig("hours", parseInt(e.target.value) || 0)} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4F8EF7]" placeholder="24" />
                        </div>
                      </div>
                    )}

                    {app === "Admin Approval" && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-[10px] text-amber-500 font-medium leading-relaxed">Bu adımda otomasyon durur ve bir yetkilinin onayını bekler. Onay verilmeden sonraki adımlara geçilmez.</p>
                      </div>
                    )}

                    {app === "Custom" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1 block">Özel Parametreler (JSON)</label>
                          <textarea value={JSON.stringify(config, null, 2)} onChange={e => {
                            try { updateConfig("custom", JSON.parse(e.target.value)); } catch(err) {}
                          }} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-[#94A3B8] focus:outline-none focus:border-[#4F8EF7] min-h-[100px]" placeholder="{}"></textarea>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-rose-500/10">
                    <button 
                      onClick={() => setNodes(nds => nds.filter(n => n.id !== selectedNodeId))}
                      className="w-full flex items-center justify-center gap-2 py-2 text-rose-500 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-colors text-sm font-bold"
                    >
                      <Trash2 className="w-4 h-4" /> Düğümü Sil
                    </button>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center text-[#64748B] text-sm mt-10">
                Lütfen ayarlamak için <br/>bir düğüm seçin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
