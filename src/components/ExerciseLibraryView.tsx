import React, { useState, useMemo } from 'react';
import {
  Search,
  Dumbbell,
  AlertTriangle,
  Wind,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  X,
  Play
} from 'lucide-react';
import { Exercise } from '../types';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';

interface ExerciseLibraryViewProps {
  exercises: Exercise[];
  onStartSingleExerciseWorkout?: (exercise: Exercise) => void;
  onExerciseUpdated?: (updated: Exercise) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  exercises,
  onStartSingleExerciseWorkout,
  onExerciseUpdated
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

  const handleVideoUpdated = (updated: Exercise) => {
    setActiveExerciseModal(updated);
    if (onExerciseUpdated) {
      onExerciseUpdated(updated);
    }
  };

  const muscleCategories = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Legs',
    'Core',
    'Cardio'
  ];

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchMuscle =
        selectedMuscle === 'All' || ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.muscleGroup.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        (ex.secondaryMuscles && ex.secondaryMuscles.some((m) => m.toLowerCase().includes(q)));

      return matchMuscle && matchSearch;
    });
  }, [exercises, selectedMuscle, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            EXERCISE LIBRARY
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Master proper biomechanics, starting postures, breathing cadences, and safety standards.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises or muscles..."
            className="w-full bg-[#15151D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#FF6B35]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-[#A1A1AA] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Muscle Filter Buttons (Interactive filter segmented buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {muscleCategories.map((muscle) => (
          <button
            key={muscle}
            type="button"
            onClick={() => setSelectedMuscle(muscle)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center ${
              selectedMuscle === muscle
                ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                : 'bg-[#15151D] text-[#A1A1AA] hover:text-white hover:bg-[#1f1f2b] border border-white/5'
            }`}
          >
            {muscle}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => setActiveExerciseModal(exercise)}
              className="bg-[#15151D] rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:border-[#FF6B35]/40 transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-[#1c1c26] overflow-hidden">
                <img
                  src={exercise.thumbnail}
                  alt={exercise.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15151D] via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-wider">
                    {exercise.muscleGroup}
                  </span>
                  <span className="text-[11px] text-white/80 font-medium">
                    {exercise.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#FF6B35] transition-colors">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">
                    {exercise.startingPosition}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span className="truncate max-w-[150px]">{exercise.equipment}</span>
                  <span className="text-[#FF6B35] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Technique Guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#15151D] rounded-2xl border border-white/5">
          <Dumbbell className="w-10 h-10 text-[#A1A1AA] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white">No exercises found</h3>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Try adjusting your search query or selecting another muscle category.
          </p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#15151D] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in">
            {/* Modal Header */}
            <div className="h-16 px-6 bg-[#1c1c26] border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">
                  {activeExerciseModal.muscleGroup} Protocol
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {activeExerciseModal.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Interactive Video Demonstration Player */}
              <ExerciseVideoPlayer
                exercise={activeExerciseModal}
                onVideoUpdated={handleVideoUpdated}
                allowEdit={true}
              />

              {/* Starting Position */}
              <div className="bg-[#1C1C26] rounded-xl p-4 border border-white/5 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B35]">
                  Starting Setup & Alignment
                </span>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeExerciseModal.startingPosition}
                </p>
              </div>

              {/* Execution Steps */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Step-by-Step Execution
                </h3>
                <div className="space-y-2.5">
                  {activeExerciseModal.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                      <span className="font-display font-bold text-white text-base shrink-0 w-6">
                        0{idx + 1}.
                      </span>
                      <p className="text-white/90">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breathing & Cadence */}
              <div className="bg-[#1C1C26] rounded-xl p-4 border border-white/5 flex gap-3">
                <Wind className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block mb-0.5">
                    Breathing & Intra-Abdominal Pressure
                  </span>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {activeExerciseModal.breathing}
                  </p>
                </div>
              </div>

              {/* Common Mistakes */}
              {activeExerciseModal.commonMistakes && (
                <div className="bg-[#1C1C26] rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Common Biomechanical Faults to Avoid</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#A1A1AA]">
                    {activeExerciseModal.commonMistakes.map((mistake, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety Guidance */}
              <div className="bg-amber-950/20 rounded-xl p-4 border border-amber-500/20 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-300 block mb-0.5">
                    Safety & Spotting Standards
                  </span>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    {activeExerciseModal.safetyTips}
                  </p>
                </div>
              </div>

              {/* Alternatives Regression & Progression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#1C1C26] rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">Easier Alternative (Regression)</span>
                  <p className="text-xs font-semibold text-white mt-1">
                    {activeExerciseModal.easierAlternative}
                  </p>
                </div>
                <div className="bg-[#1C1C26] rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] font-bold text-[#FF6B35] uppercase">Harder Alternative (Progression)</span>
                  <p className="text-xs font-semibold text-white mt-1">
                    {activeExerciseModal.harderAlternative}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="h-16 px-6 bg-[#1c1c26] border-t border-white/5 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveExerciseModal(null)}
                className="px-6 py-2 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md shadow-[#FF6B35]/20 text-xs min-h-[44px]"
              >
                Close Technique Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
