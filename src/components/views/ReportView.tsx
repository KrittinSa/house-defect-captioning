import React from 'react';
import { useStore } from '../../lib/store';
import { StatCard } from '../StatCard';
import { ProxiedImage } from '../ProxiedImage';
import { Activity, ShieldAlert, CheckCircle, List } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReportView: React.FC = () => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const analyses = useStore((state) => state.analyses);
    const stats = useStore((state) => state.stats);

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === analyses.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(analyses.map(a => a.id));
        }
    };

    const handleGenerateReport = async () => {
        if (selectedIds.length === 0) return;
        setIsGenerating(true);
        try {
            const { defectService } = await import('../../services/defectService');
            await defectService.generateReportFromIds(selectedIds);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-2xl font-bold text-slate-800">Summary Report</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard
                    label="Total Defects"
                    value={stats.totalDefects}
                    icon={List}
                    subValue="Total defects detected"
                />
                <StatCard
                    label="Rooms Inspected"
                    value={Object.keys(stats.roomDistribution).length}
                    icon={ShieldAlert}
                    color="text-blue-500"
                    subValue="Rooms with defects"
                />
                <StatCard
                    label="Processed"
                    value={stats.processedCount}
                    icon={CheckCircle}
                    color="text-emerald-500"
                    subValue="Successfully analyzed by AI"
                />
                <StatCard
                    label="System Accuracy"
                    value="98.7%"
                    icon={Activity}
                    color="text-slate-400"
                    subValue="Current model accuracy"
                />
            </div>

            {/* Selection & Generation Section */}
            <div className="premium-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <List size={20} className="text-slate-400" />
                        Select Defects for Report
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelectAll}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {selectedIds.length === analyses.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 mb-6">
                    {analyses.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">No defects found.</p>
                    ) : (
                        analyses.map((defect) => (
                            <div
                                key={defect.id}
                                onClick={() => handleToggleSelect(defect.id)}
                                className={`p-3 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${selectedIds.includes(defect.id)
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedIds.includes(defect.id) ? 'bg-white border-white' : 'border-slate-300'
                                    }`}>
                                    {selectedIds.includes(defect.id) && <div className="w-2.5 h-2.5 rounded-sm bg-slate-900" />}
                                </div>
                                <ProxiedImage src={defect.imageUrl} alt={defect.labelEn} className="w-10 h-10 rounded-lg object-cover bg-slate-200" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm line-clamp-1">{defect.labelThai}</div>
                                    <div className={`text-[10px] uppercase font-bold tracking-wider ${selectedIds.includes(defect.id) ? 'text-slate-400' : 'text-slate-400'
                                        }`}>{defect.room}</div>
                                </div>
                                <div className="text-xs font-mono opacity-60">
                                    {(defect.confidence * 100).toFixed(0)}%
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={handleGenerateReport}
                    disabled={selectedIds.length === 0 || isGenerating}
                    className="w-full py-4 rounded-xl font-bold text-white bg-crimson hover:bg-red-700 transition-colors shadow-lg shadow-crimson/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>Generating PDF...</>
                    ) : (
                        <>Generate Report ({selectedIds.length})</>
                    )}
                </button>
            </div>

            {/* Room Breakdown (Moved down) */}
            <div className="premium-card p-6 opacity-60 hover:opacity-100 transition-opacity">
                {/* Existing Code for Room Breakdown */}
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <List size={20} className="text-slate-400" />
                    Room Breakdown
                </h3>
                <div className="space-y-6">
                    {Object.entries(stats.roomDistribution).length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm italic">
                            No in-depth analysis data yet.
                        </div>
                    ) : (
                        Object.entries(stats.roomDistribution)
                            .sort((a, b) => b[1] - a[1]) // Sort by count
                            .map(([room, count]) => (
                                <div key={room}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-slate-600">{room}</span>
                                        <span className="font-bold text-slate-900">{count} <span className="text-[10px] text-slate-400 font-normal">pts</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / stats.totalDefects) * 100}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="bg-slate-900 h-full rounded-full"
                                        />
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};
