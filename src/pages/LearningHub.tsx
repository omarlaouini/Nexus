import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { generateMilestones } from '../services/ai';
import { BrainCircuit, Loader2, Sparkles, Trash2, ChevronDown, ChevronUp, Play, BookOpen, CheckCircle2, Circle, Save, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { FocusTimer } from '../components/FocusTimer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function LearningHubView() {
  const { learningPaths, addLearningPath, deleteLearningPath, updateMilestone, addMilestone } = useStore();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPathId, setExpandedPathId] = useState<string | null>(null);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [timerConfig, setTimerConfig] = useState<{isOpen: boolean, refId: string, title: string} | null>(null);
  const [editingNotes, setEditingNotes] = useState<{id: string, content: string} | null>(null);

  // Manual Add Path State
  const [isAddPathOpen, setIsAddPathOpen] = useState(false);
  const [newPathTitle, setNewPathTitle] = useState('');
  const [newPathDesc, setNewPathDesc] = useState('');

  // Manual Add Milestone State
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [targetPathId, setTargetPathId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const milestones = await generateMilestones(topic.trim());
      addLearningPath(topic.trim(), "AI Generated Learning Path", milestones);
      setTopic('');
      
      setTimeout(() => {
        const firstPath = useStore.getState().learningPaths[0];
        if (firstPath) setExpandedPathId(firstPath.id);
      }, 100);
    } catch (error) {
      alert("Failed to generate learning plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAddPath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPathTitle.trim()) return;
    addLearningPath(newPathTitle.trim(), newPathDesc.trim(), []);
    setNewPathTitle('');
    setNewPathDesc('');
    setIsAddPathOpen(false);
  };

  const handleManualAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !targetPathId) return;
    addMilestone(targetPathId, {
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim(),
      status: 'todo',
      resources: [],
      notes: ''
    });
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setIsAddMilestoneOpen(false);
    setExpandedPathId(targetPathId);
  };

  const togglePath = (id: string) => setExpandedPathId(expandedPathId === id ? null : id);
  const toggleMilestone = (id: string) => setExpandedMilestoneId(expandedMilestoneId === id ? null : id);

  const saveNotes = (pathId: string, milestoneId: string) => {
    if (editingNotes && editingNotes.id === milestoneId) {
      updateMilestone(pathId, milestoneId, { notes: editingNotes.content });
      setEditingNotes(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Generator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Learning Hub
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider">AI Powered</span>
          </h1>
          <p className="text-slate-500 mt-2">Enter a topic you want to learn, and AI will break it down into an actionable plan.</p>
        </div>
        <Button onClick={() => setIsAddPathOpen(true)} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Create Path Manually
        </Button>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-1 shadow-lg">
        <div className="bg-white rounded-xl p-6">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Computing, React Hooks, French Basics..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="px-8 py-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating Plan...</>
              ) : (
                <><Sparkles className="w-5 h-5 text-indigo-400" /> Break it down</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Learning Paths List */}
      <div className="space-y-4">
        {(!learningPaths || learningPaths.length === 0) ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
            <BrainCircuit className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p>No learning paths yet. Start by entering a topic above or create one manually!</p>
          </div>
        ) : (
          learningPaths.map((path) => {
            const isPathExpanded = expandedPathId === path.id;
            const completedMilestones = path.milestones.filter(m => m.status === 'done').length;
            const progress = path.milestones.length === 0 ? 0 : Math.round((completedMilestones / path.milestones.length) * 100);

            return (
              <div key={path.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                <div 
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => togglePath(path.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">{path.title}</h3>
                    {path.description && <p className="text-sm text-slate-500 mt-1">{path.description}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-sm text-slate-500 font-medium">{progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-8">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLearningPath(path.id); }}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="p-2 text-slate-400">
                      {isPathExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
                
                {isPathExpanded && (
                  <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Milestones</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1"
                          onClick={() => {
                            setTargetPathId(path.id);
                            setIsAddMilestoneOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4" /> Add Milestone
                        </Button>
                      </div>
                      
                      {path.milestones.length === 0 && (
                        <div className="text-center py-6 text-sm text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                          No milestones yet. Add one to get started!
                        </div>
                      )}

                      {path.milestones.map((milestone) => {
                        const isMilestoneExpanded = expandedMilestoneId === milestone.id;
                        return (
                          <div key={milestone.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div 
                              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => toggleMilestone(milestone.id)}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateMilestone(path.id, milestone.id, { status: milestone.status === 'done' ? 'todo' : 'done' });
                                }}
                                className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                              >
                                {milestone.status === 'done' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={cn("font-medium text-slate-900 transition-all", milestone.status === 'done' && "text-slate-400 line-through")}>
                                  {milestone.title}
                                </p>
                                <p className="text-sm text-slate-500 truncate">{milestone.description}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTimerConfig({ isOpen: true, refId: milestone.id, title: milestone.title });
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                              >
                                <Play className="w-4 h-4" /> Focus
                              </button>
                            </div>

                            {isMilestoneExpanded && (
                              <div className="p-4 border-t border-slate-100 bg-slate-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Notes & Resources
                                  </h5>
                                  {editingNotes?.id !== milestone.id ? (
                                    <button 
                                      onClick={() => setEditingNotes({ id: milestone.id, content: milestone.notes || '' })}
                                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                      Edit Notes
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => saveNotes(path.id, milestone.id)}
                                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                      <Save className="w-4 h-4" /> Save
                                    </button>
                                  )}
                                </div>

                                {editingNotes?.id === milestone.id ? (
                                  <textarea
                                    value={editingNotes.content}
                                    onChange={(e) => setEditingNotes({ ...editingNotes, content: e.target.value })}
                                    className="w-full h-48 p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
                                    placeholder="Use Markdown to write notes, paste links, etc..."
                                  />
                                ) : (
                                  <div className="prose prose-sm prose-slate max-w-none bg-white p-4 rounded-lg border border-slate-200 min-h-[100px]">
                                    {milestone.notes ? (
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{milestone.notes}</ReactMarkdown>
                                    ) : (
                                      <p className="text-slate-400 italic m-0">No notes yet. Click edit to add some.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {timerConfig && (
        <FocusTimer
          isOpen={timerConfig.isOpen}
          onClose={() => setTimerConfig(null)}
          referenceId={timerConfig.refId}
          type="learning"
          title={timerConfig.title}
        />
      )}

      {/* Manual Add Path Dialog */}
      <Dialog open={isAddPathOpen} onOpenChange={setIsAddPathOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Learning Path</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualAddPath} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Path Title *</label>
              <Input 
                value={newPathTitle} 
                onChange={(e) => setNewPathTitle(e.target.value)} 
                placeholder="e.g. Learn Rust Programming" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                value={newPathDesc} 
                onChange={(e) => setNewPathDesc(e.target.value)} 
                placeholder="Briefly describe your goal..." 
                className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
              />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Create Path
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Add Milestone Dialog */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualAddMilestone} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Milestone Title *</label>
              <Input 
                value={newMilestoneTitle} 
                onChange={(e) => setNewMilestoneTitle(e.target.value)} 
                placeholder="e.g. Complete Chapter 1" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                value={newMilestoneDesc} 
                onChange={(e) => setNewMilestoneDesc(e.target.value)} 
                placeholder="What exactly needs to be done?" 
                className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
              />
            </div>
            <DialogFooter className="mt-6">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Add Milestone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
