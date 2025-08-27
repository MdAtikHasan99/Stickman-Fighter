import React from 'react';
import { INITIAL_PLAYER_HEALTH } from '../constants';

interface HUDProps {
  player1Health: number;
  player2Health: number;
  player1Combo: number;
  player2Combo: number;
}

const HealthBar = ({ health, color, isReversed = false }: { health: number, color: string, isReversed?: boolean }) => {
  const healthPercentage = Math.max(0, (health / INITIAL_PLAYER_HEALTH) * 100);

  const barContainerClasses = `w-full h-8 bg-slate-700 rounded-full overflow-hidden border-2 border-slate-500 flex`;
  const reversedClass = isReversed ? 'flex-row-reverse' : '';

  return (
    <div className={`${barContainerClasses} ${reversedClass}`}>
      <div
        className={`${color} h-full transition-all duration-300 ease-in-out`}
        style={{ width: `${healthPercentage}%` }}
        role="progressbar"
        aria-valuenow={health}
        aria-valuemin={0}
        aria-valuemax={INITIAL_PLAYER_HEALTH}
      />
    </div>
  );
};

const HUD: React.FC<HUDProps> = ({ player1Health, player2Health, player1Combo, player2Combo }) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 grid grid-cols-2 gap-4 items-center px-4">
      {/* Player 1 Health & Combo */}
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-red-500 w-12 text-left">P1</span>
        <div className="flex-grow">
          <HealthBar health={player1Health} color="bg-red-500" />
          {player1Combo >= 2 && (
             <p className="text-orange-400 font-bold text-right text-xl mt-1 pr-2 animate-pulse">
                {player1Combo} HITS!
              </p>
          )}
        </div>
      </div>

      {/* Player 2 Health & Combo */}
      <div className="flex items-center gap-4 flex-row-reverse">
         <span className="text-2xl font-bold text-blue-500 w-12 text-right">P2</span>
         <div className="flex-grow">
            <HealthBar health={player2Health} color="bg-blue-500" isReversed={true} />
            {player2Combo >= 2 && (
              <p className="text-orange-400 font-bold text-left text-xl mt-1 pl-2 animate-pulse">
                {player2Combo} HITS!
              </p>
            )}
         </div>
      </div>
    </div>
  );
};

export default HUD;