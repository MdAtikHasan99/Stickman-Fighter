
import React from 'react';

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  return (
    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-6xl font-extrabold text-white mb-4">Welcome to the Arena</h2>
      <p className="text-xl text-slate-300 mb-8 max-w-lg">
        Two stickmen enter, one stickman leaves. Use your skills to defeat your opponent in a fast-paced physics battle.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-cyan-500 text-slate-900 font-bold text-2xl rounded-lg shadow-lg hover:bg-cyan-400 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300"
      >
        Start Fight
      </button>
    </div>
  );
};

export default StartMenu;
