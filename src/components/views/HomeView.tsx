import React from 'react';
import { useDefectAnalysis } from '../../hooks/useDefectAnalysis';
import { useStore } from '../../lib/store';
import { UploadZone } from '../UploadZone';
import { DefectCard } from '../DefectCard';
import type { DefectAnalysisUI } from '../../types/defect';

import { motion } from 'framer-motion';

export const HomeView: React.FC = () => {
    const { analyzeImage, isAnalyzing, analyses } = useDefectAnalysis();

    const setView = useStore((state) => state.setView);

    // Show up to 6 most recent analyses
    const recentAnalyses = analyses.slice(0, 6);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Scan Area */}
            <div className="lg:col-span-12 xl:col-span-12">
                <UploadZone onFileSelect={analyzeImage} isAnalyzing={isAnalyzing} />
            </div>

            {/* Recent Results */}
            <div className="lg:col-span-12 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Recent Results
                    </h2>
                    {analyses.length > 6 && (
                        <button
                            onClick={() => setView('history')}
                            className="text-sm font-bold text-crimson hover:text-crimson/80 transition-colors flex items-center gap-1"
                        >
                            View All <span className="text-lg">→</span>
                        </button>
                    )}
                </div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
                    {recentAnalyses.length === 0 ? (
                        <div className="col-span-full py-12 text-center premium-card bg-slate-50/50 border-dashed">
                            <p className="text-slate-400">No analysis data yet. Start by uploading an image.</p>
                        </div>
                    ) : (
                        recentAnalyses.map((analysis: DefectAnalysisUI) => (
                            <DefectCard key={analysis.id} data={analysis} />
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
};
