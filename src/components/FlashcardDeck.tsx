import React, { useState, useEffect } from 'react';
import { getFlashcards, saveFlashcards, addFlashcard } from '../services/storageService';
import { Flashcard, Subject } from '../types';
import { SUBJECTS } from '../constants';
import { Layers, Plus, RotateCcw, Check, X, Brain } from 'lucide-react';

const FlashcardDeck: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubject, setNewSubject] = useState<Subject>(Subject.CN);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    const allCards = getFlashcards();
    setCards(allCards);
    
    const today = new Date().toISOString().split('T')[0];
    const due = allCards.filter(c => c.nextReviewDate <= today);
    setDueCards(due);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront || !newBack) return;

    const newCard: Flashcard = {
      id: `fc_${Date.now()}`,
      front: newFront,
      back: newBack,
      subject: newSubject,
      box: 1,
      nextReviewDate: new Date().toISOString().split('T')[0]
    };

    addFlashcard(newCard);
    setNewFront('');
    setNewBack('');
    setShowAddForm(false);
    loadCards();
  };

  const processReview = (quality: 'forgot' | 'hard' | 'good' | 'easy') => {
    if (!dueCards[currentCardIndex]) return;

    const card = { ...dueCards[currentCardIndex] };
    let nextBox = card.box;
    let daysToAdd = 1;

    if (quality === 'forgot') {
        nextBox = 1;
        daysToAdd = 0; 
    } else if (quality === 'hard') {
        nextBox = 1;
        daysToAdd = 1;
    } else if (quality === 'good') {
        nextBox = Math.min(card.box + 1, 5);
        daysToAdd = Math.pow(2, nextBox); 
    } else if (quality === 'easy') {
        nextBox = Math.min(card.box + 2, 5);
        daysToAdd = Math.pow(2, nextBox) + 2; 
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    
    card.box = nextBox;
    card.nextReviewDate = nextDate.toISOString().split('T')[0];
    card.lastReviewed = new Date().toISOString();

    const updatedCards = cards.map(c => c.id === card.id ? card : c);
    saveFlashcards(updatedCards);

    if (currentCardIndex < dueCards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
    } else {
        loadCards(); 
    }
  };

  const currentCard = dueCards[currentCardIndex];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in relative z-10">
      
      <div className="flex justify-between items-center bg-gate-800 p-4 rounded-xl border border-gate-700">
         <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Brain className="text-pink-500" /> Memory Forge
            </h2>
            <p className="text-xs text-gate-500">Spaced Repetition System (Leitner)</p>
         </div>
         <div className="flex gap-4 items-center">
            <div className="text-right">
               <div className="text-2xl font-bold text-white leading-none">{dueCards.length}</div>
               <div className="text-[10px] text-gate-400 uppercase font-bold">Due Today</div>
            </div>
            <div className="w-px h-8 bg-gate-700"></div>
            <div className="text-right">
               <div className="text-2xl font-bold text-gate-300 leading-none">{cards.length}</div>
               <div className="text-[10px] text-gate-500 uppercase font-bold">Total Cards</div>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="ml-4 bg-gate-700 hover:bg-gate-600 text-white p-2 rounded-lg transition-colors"
            >
               <Plus size={20} />
            </button>
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative perspective-1000">
         
         {currentCard ? (
             <div className="w-full max-w-2xl aspect-[3/2] relative cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                
                <div className={`w-full h-full relative transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    <div className="absolute inset-0 backface-hidden bg-gate-800 border-2 border-gate-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                        <div className="absolute top-4 left-4 bg-gate-900 text-gate-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-gate-700">
                            {currentCard.subject}
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white leading-tight">
                            {currentCard.front}
                        </div>
                        <div className="absolute bottom-6 text-xs text-gate-500 font-mono animate-pulse">
                            Tap to Reveal
                        </div>
                    </div>

                    <div className="absolute inset-0 backface-hidden bg-white rotate-y-180 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl border-4 border-gate-600">
                        <div className="text-xl md:text-2xl font-medium text-black whitespace-pre-wrap leading-relaxed">
                            {currentCard.back}
                        </div>
                    </div>
                </div>

                <div className={`absolute -bottom-20 left-0 right-0 flex justify-center gap-3 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={e => e.stopPropagation()}>
                    <button onClick={() => processReview('forgot')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs transition-transform hover:scale-105 flex flex-col items-center gap-1 pointer-events-auto">
                        <RotateCcw size={16}/> Forgot
                    </button>
                    <button onClick={() => processReview('hard')} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs transition-transform hover:scale-105 flex flex-col items-center gap-1 pointer-events-auto">
                        Hard
                    </button>
                    <button onClick={() => processReview('good')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs transition-transform hover:scale-105 flex flex-col items-center gap-1 pointer-events-auto">
                        Good
                    </button>
                    <button onClick={() => processReview('easy')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs transition-transform hover:scale-105 flex flex-col items-center gap-1 pointer-events-auto">
                        <Check size={16}/> Easy
                    </button>
                </div>

             </div>
         ) : (
             <div className="text-center space-y-4">
                <div className="inline-block p-6 bg-green-900/20 rounded-full mb-4 animate-pulse-slow">
                   <Layers size={64} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">All Caught Up!</h3>
                <p className="text-gate-400 max-w-md mx-auto">
                    You've reviewed all cards due for today. Come back tomorrow or add new cards to the deck.
                </p>
                <button onClick={() => setShowAddForm(true)} className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gate-200 transition-colors pointer-events-auto">
                    Add New Cards
                </button>
             </div>
         )}
      </div>

      {/* Modal Boosted to z-[100] */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-gate-800 w-full max-w-lg border border-gate-600 rounded-xl p-6 shadow-2xl relative animate-slide-up z-[110]">
              <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-gate-400 hover:text-white pointer-events-auto"><X size={20}/></button>
              
              <h3 className="text-lg font-bold text-white mb-4">Add Flashcard</h3>
              
              <form onSubmit={handleAddCard} className="space-y-4">
                 <div>
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-1">Subject</label>
                    <select 
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value as Subject)}
                      className="w-full bg-black border border-gate-600 rounded-lg p-2 text-white text-sm focus:border-white outline-none pointer-events-auto"
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-1">Front (Question)</label>
                    <textarea 
                      required
                      rows={2}
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      className="w-full bg-black border border-gate-600 rounded-lg p-3 text-white text-sm focus:border-white outline-none resize-none pointer-events-auto"
                    />
                 </div>

                 <div>
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-1">Back (Answer)</label>
                    <textarea 
                      required
                      rows={4}
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      className="w-full bg-black border border-gate-600 rounded-lg p-3 text-white text-sm focus:border-white outline-none resize-none pointer-events-auto"
                    />
                 </div>

                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors pointer-events-auto">
                    Forging Memory
                 </button>
              </form>
           </div>
        </div>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardDeck;