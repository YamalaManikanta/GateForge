
import React, { useState, useEffect } from 'react';
import { getFlashcards } from '../../services/storageService';
import { Flashcard } from '../../types';
import { Zap, Timer, Trophy, RotateCcw } from 'lucide-react';

const Gauntlet: React.FC = () => {
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState<Flashcard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');

  useEffect(() => {
    setDeck(getFlashcards().sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0 && !isRevealed) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isRevealed) {
      handleVerify(false);
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState, isRevealed]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    nextCard();
  };

  const nextCard = () => {
    const next = deck[Math.floor(Math.random() * deck.length)];
    setCurrent(next);
    setIsRevealed(false);
    setTimeLeft(5);
  };

  const handleVerify = (correct: boolean) => {
    if (correct) setScore(prev => prev + 1);
    setIsRevealed(true);
    setTimeout(nextCard, 1500);
  };

  return (
    <div className="max-w-xl mx-auto h-[500px] flex flex-col justify-center animate-fade-in text-center">
      {gameState === 'idle' && (
        <div className="space-y-6">
          <div className="bg-yellow-950/20 p-6 rounded-full inline-block animate-pulse">
            <Zap size={64} className="text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">The Gauntlet</h2>
          <p className="text-gate-400">5 seconds. 1 formula. Zero hesitation. Ready?</p>
          <button onClick={startGame} className="bg-white text-black px-12 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
            ENTER THE ARENA
          </button>
        </div>
      )}

      {gameState === 'playing' && current && (
        <div className="space-y-8 animate-scale-in">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 text-xl font-bold text-white"><Trophy className="text-yellow-500"/> {score}</div>
             <div className={`text-3xl font-mono font-bold ${timeLeft < 2 ? 'text-red-500 animate-bounce' : 'text-white'}`}>00:0{timeLeft}</div>
          </div>
          
          <div className={`p-10 rounded-3xl border-4 transition-all h-64 flex items-center justify-center ${isRevealed ? 'bg-white text-black border-white' : 'bg-gate-800 border-gate-600'}`}>
             <div className="text-2xl font-bold leading-tight">
                {isRevealed ? current.back : current.front}
             </div>
          </div>

          {!isRevealed && (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleVerify(false)} className="bg-red-900/20 text-red-500 border border-red-900 py-4 rounded-xl font-bold">I FORGOT</button>
              <button onClick={() => setIsRevealed(true)} className="bg-gate-900 text-white border border-gate-700 py-4 rounded-xl font-bold">REVEAL</button>
            </div>
          )}
          
          {isRevealed && (
             <div className="text-xs font-bold text-gate-500 uppercase tracking-widest animate-pulse">Next Challenge Loading...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gauntlet;
