import React from 'react';
import { useStore } from '../../lib/store';
import { StatCard } from '../StatCard';
import { Activity, ShieldAlert, CheckCircle, List } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReportView: React.FC = () => {
    const stats = useStore((state) => state.stats);

    return (
        <div className="space-y-8">
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

            {/* Room Breakdown */}
            <div className="premium-card p-6">
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
