import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { X, Calendar, Activity, AlertTriangle, SquarePen, Trash2, Save, Home } from 'lucide-react';
import type { RoomType, DefectAnalysisUI } from '../types/defect';
import { toast } from 'sonner';
import { ProxiedImage } from './ProxiedImage';

const ROOM_OPTIONS: RoomType[] = [
    'General',
    'Bedroom 1',
    'Bedroom 2',
    'Bathroom',
    'Kitchen',
    'Living Room',
    'Exterior'
];

interface ModalContentProps {
    analysis: DefectAnalysisUI;
    onUpdate: (id: string, updates: Partial<DefectAnalysisUI>) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ analysis, onUpdate, onDelete, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(analysis.labelThai);
    const [editRoom, setEditRoom] = useState<RoomType>(analysis.room);
    const [editSeverity, setEditSeverity] = useState<string>(analysis.severity || 'Low');

    const handleDelete = () => {
        toast('Confirm Delete?', {
            description: 'This analysis data will be permanently deleted.',
            action: {
                label: 'Delete',
                onClick: () => {
                    onDelete(analysis.id);
                    onClose();
                    toast.success('Data deleted successfully');
                }
            }
        });
    };

    const handleSave = () => {
        onUpdate(analysis.id, {
            labelThai: editLabel,
            room: editRoom,
            severity: editSeverity,
        });
        setIsEditing(false);
        toast.success('Changes saved successfully');
    };

    return (
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header Image */}
            <div className="relative h-64 sm:h-80 bg-slate-100 group">
                <ProxiedImage
                    src={analysis.imageUrl}
                    alt={analysis.labelEn}
                    className="w-full h-full object-contain bg-black/5"
                />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-full text-slate-800 transition-all z-10"
                >
                    <X size={20} />
                </button>

                {!isEditing && (
                    <div className="absolute top-4 left-4 flex gap-2 transition-all">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2.5 bg-white/90 hover:bg-white backdrop-blur-md rounded-full text-slate-700 shadow-premium border border-white/50 transition-all active:scale-95"
                            title="Edit"
                        >
                            <SquarePen size={20} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2.5 bg-white/90 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-red-500 shadow-premium border border-white/50 transition-all active:scale-95"
                            title="Delete"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}

                {!isEditing && (
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200 bg-white shadow-sm text-slate-500">
                            {analysis.room}
                        </div>
                        {analysis.severity && (
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${analysis.severity === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : analysis.severity === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                    : analysis.severity === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100'
                                        : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                {analysis.severity}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
                {isEditing ? (
                    <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Defect Name</label>
                            <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Select Room / Zone</label>
                            <select
                                value={editRoom}
                                onChange={(e) => setEditRoom(e.target.value as RoomType)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm"
                            >
                                {ROOM_OPTIONS.map(room => (
                                    <option key={room} value={room}>{room}</option>
                                ))}
                            </select>
                        </div>

                        {/* Severity Selector */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Severity Level</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setEditSeverity(level)}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${editSeverity === level
                                            ? level === 'Low' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md transform scale-105'
                                                : level === 'Medium' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md transform scale-105'
                                                    : level === 'High' ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105'
                                                        : 'bg-red-600 text-white border-red-600 shadow-md transform scale-105'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 group/title">
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                    {analysis.labelThai}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 text-slate-300 hover:text-crimson transition-colors rounded-lg hover:bg-slate-100 sm:opacity-0 sm:group-hover/title:opacity-100"
                                    title="Edit label"
                                >
                                    <SquarePen size={16} />
                                </button>
                            </div>
                            <p className="text-slate-500 font-medium text-sm mt-0.5">{analysis.labelEn}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-slate-800">
                                {(analysis.confidence * 100).toFixed(1)}<span className="text-lg text-slate-400">%</span>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Confidence</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Detected At</span>
                        </div>
                        <p className="text-xs font-medium text-slate-700">
                            {new Date(analysis.timestamp).toLocaleString('th-TH')}
                        </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Home size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Location / Room</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                            {analysis.room}
                        </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Activity size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 capitalize">
                            {analysis.status}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-orange-500" />
                        AI Insight
                    </h3>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed">
                        <p>
                            Potential defect detected in <strong>{analysis.room}</strong>: {analysis.labelEn} <br />
                            <span className="mt-2 block text-slate-400 italic">Recommendation: Please check the surface texture and any cracks to evaluate depth and severity.</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors text-sm">
                    Close
                </button>
                <button className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 text-sm">
                    Export Report
                </button>
            </div>
        </div>
    );
};

export const DefectDetailModal: React.FC = () => {
    const currentAnalysisId = useStore((state) => state.currentAnalysisId);
    const setCurrentAnalysisId = useStore((state) => state.setCurrentAnalysisId);
    const analyses = useStore((state) => state.analyses);
    const updateAnalysis = useStore((state) => state.updateAnalysis);
    const deleteAnalysis = useStore((state) => state.deleteAnalysis);

    const analysis = analyses.find(a => a.id === currentAnalysisId);

    if (!analysis) return null;

    const closeModal = () => setCurrentAnalysisId(null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            ></div>

            <ModalContent
                key={analysis.id}
                analysis={analysis}
                onUpdate={updateAnalysis}
                onDelete={deleteAnalysis}
                onClose={closeModal}
            />
        </div>
    );
};
