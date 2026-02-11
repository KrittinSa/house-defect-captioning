
import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { X, Plus, Trash2, Home, Building } from 'lucide-react';

interface ProjectManagerProps {
    onClose: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onClose }) => {
    const projects = useStore((state) => state.projects);
    const currentProjectId = useStore((state) => state.currentProjectId);
    const addProject = useStore((state) => state.addProject);
    const switchProject = useStore((state) => state.switchProject);
    const deleteProject = useStore((state) => state.deleteProject);

    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectAddress, setNewProjectAddress] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        setIsCreating(true);
        await addProject(newProjectName, newProjectAddress);
        setNewProjectName('');
        setNewProjectAddress('');
        setIsCreating(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this project? All defects associated with it will be deleted.')) {
            await deleteProject(id);
        }
    };

    const handleSwitch = async (id: number) => {
        await switchProject(id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Building className="text-crimson" size={24} />
                        My Projects
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Create New Project */}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Project Name</label>
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g. Sukhumvit Condo, House #12"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-crimson focus:ring-2 focus:ring-crimson/20 outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={newProjectAddress}
                                onChange={(e) => setNewProjectAddress(e.target.value)}
                                placeholder="Address (Optional)"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-crimson focus:ring-2 focus:ring-crimson/20 outline-none transition-all text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newProjectName.trim() || isCreating}
                            className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            {isCreating ? 'Creating...' : 'Create Project'}
                        </button>
                    </form>

                    <div className="border-t border-slate-100 pt-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Your Projects</label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {projects.length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-4">No projects yet.</p>
                            )}
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => handleSwitch(project.id)}
                                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${currentProjectId === project.id
                                        ? 'bg-crimson/5 border-crimson/20'
                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${currentProjectId === project.id ? 'bg-crimson text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            <Home size={18} />
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${currentProjectId === project.id ? 'text-crimson' : 'text-slate-700'}`}>
                                                {project.name}
                                            </div>
                                            {project.address && (
                                                <div className="text-xs text-slate-400 truncate max-w-[150px]">
                                                    {project.address}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {currentProjectId === project.id ? (
                                        <div className="px-2 py-1 text-[10px] uppercase font-bold text-crimson bg-crimson/10 rounded-md">
                                            Active
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => handleDelete(e, project.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
