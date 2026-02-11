import React from 'react';
import { useStore } from '../../lib/store';
import { DefectCard } from '../DefectCard';
import type { DefectAnalysisUI } from '../../types/defect';
import { motion } from 'framer-motion';

export const HistoryView: React.FC = () => {
    const analyses = useStore((state) => state.analyses);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Defect History</h2>

            {analyses.length === 0 ? (
                <div className="py-32 text-center">
                    <p className="text-slate-400 text-lg">No defect history found</p>
                    <p className="text-slate-300 text-sm mt-2">Data will appear here after you scan.</p>
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                >
                    {analyses.map((analysis: DefectAnalysisUI) => (
                        <DefectCard key={analysis.id} data={analysis} />
                    ))}
                </motion.div>
            )}
        </div>
    );
};
