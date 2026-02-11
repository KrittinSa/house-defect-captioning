import React from 'react';
import type { DefectAnalysisUI } from '../types/defect';
// import { Clock } from 'lucide-react';

interface DefectCardProps {
    data: DefectAnalysisUI;
}

import { SkeletonCard } from './SkeletonCard';
import { useStore } from '../lib/store';

import { motion } from 'framer-motion';

export const DefectCard: React.FC<DefectCardProps> = ({ data }) => {
    const isDone = data.status === 'done';
    const isProcessing = data.status === 'processing';
    const setCurrentAnalysisId = useStore((state) => state.setCurrentAnalysisId);

    if (isProcessing) {
        return <SkeletonCard imageSrc={data.imageUrl} />;
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
            }}
            onClick={() => setCurrentAnalysisId(data.id)}
            className="premium-card overflow-hidden flex flex-col sm:flex-row h-auto sm:min-h-[140px] cursor-pointer hover:shadow-lg transition-shadow bg-white"
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
        >
            <div className="w-full sm:w-32 h-40 sm:h-full relative overflow-hidden bg-slate-100 shrink-0">
                <img
                    src={data.imageUrl}
                    alt={data.labelEn}
                    className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
                />
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-base sm:text-lg leading-tight line-clamp-2" title={data.labelThai}>
                            {data.labelThai}
                        </h4>
                        {data.labelEn && data.labelEn !== data.labelThai && (
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-tight mt-0.5 truncate">
                                {data.labelEn}
                            </p>
                        )}
                    </div>

                    {isDone && (
                        <div className="flex flex-wrap gap-2">
                            {data.severity && (
                                <div className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[9px] font-bold uppercase tracking-widest border shadow-sm ${data.severity === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : data.severity === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                        : data.severity === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100'
                                            : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                    {data.severity}
                                </div>
                            )}
                            <div className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[9px] font-bold uppercase tracking-widest border border-slate-200 bg-slate-50 text-slate-500">
                                {data.room}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-end mt-3 border-t border-slate-50 pt-2">
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {isDone && (
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <span className="text-slate-400 font-normal text-[10px] uppercase tracking-wider">Confidence</span>
                            {(data.confidence * 100).toFixed(0)}%
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
