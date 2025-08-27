import React from 'react';

interface GameOverScreenProps {
  winnerName: string;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ winnerName, onRestart }) => {
  const isTie = winnerName.includes('Tie');

  return (
    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-6xl font-extrabold text-cyan-400 mb-4">Game Over</h2>
      
      <div className="h-24 flex items-center justify-center">
        <p className="text-4xl text-white">
          {isTie ? (
            <span>{winnerName}</span>
          ) : (
            <>
              <span className={winnerName === 'Player 1' ? 'text-red-500' : 'text-blue-500'}>{winnerName}</span> wins!
            </>
          )}
        </p>
      </div>

      <button
        onClick={onRestart}
        className="mt-4 px-8 py-4 bg-cyan-500 text-slate-900 font-bold text-2xl rounded-lg shadow-lg hover:bg-cyan-400 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300"
      >
        Restart Game
      </button>
    </div>
  );
};

export default GameOverScreen;