import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import StartMenu from './components/StartMenu';
import GameOverScreen from './components/GameOverScreen';
import HUD from './components/HUD';
import { GameState, Player, Controls } from './types';
import { INITIAL_PLAYER_HEALTH, PLAYER_1_CONTROLS, PLAYER_2_CONTROLS } from './constants';

const ControlDisplay: React.FC<{ controls: Controls }> = ({ controls }) => {
  const formatKey = (key: string) => {
    switch (key) {
      case 'arrowleft': return '←';
      case 'arrowright': return '→';
      case 'arrowup': return '↑';
      case 'arrowdown': return '↓';
      default: return key.toUpperCase();
    }
  };

  return (
    <>
      <p><span className="font-semibold text-white">Move:</span> {formatKey(controls.left)} / {formatKey(controls.right)}</p>
      <p><span className="font-semibold text-white">Jump:</span> {formatKey(controls.jump)}</p>
      <p><span className="font-semibold text-white">Attack:</span> {formatKey(controls.attack)}</p>
      <p><span className="font-semibold text-white">Block:</span> {formatKey(controls.block)}</p>
    </>
  );
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isTie, setIsTie] = useState(false);
  const [player1Health, setPlayer1Health] = useState(INITIAL_PLAYER_HEALTH);
  const [player2Health, setPlayer2Health] = useState(INITIAL_PLAYER_HEALTH);
  const [player1Combo, setPlayer1Combo] = useState(0);
  const [player2Combo, setPlayer2Combo] = useState(0);

  const startGame = useCallback(() => {
    setPlayer1Health(INITIAL_PLAYER_HEALTH);
    setPlayer2Health(INITIAL_PLAYER_HEALTH);
    setPlayer1Combo(0);
    setPlayer2Combo(0);
    setWinner(null);
    setIsTie(false);
    setGameState(GameState.Playing);
  }, []);

  const handleGameOver = useCallback((winningPlayer: Player | null) => {
    if (winningPlayer) {
      setWinner(winningPlayer);
      setIsTie(false);
    } else {
      setWinner(null);
      setIsTie(true);
    }
    setGameState(GameState.GameOver);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Menu:
        return <StartMenu onStart={startGame} />;
      case GameState.Playing:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
             <HUD 
                player1Health={player1Health} 
                player2Health={player2Health}
                player1Combo={player1Combo}
                player2Combo={player2Combo}
             />
            <GameCanvas 
              onGameOver={handleGameOver}
              setPlayer1Health={setPlayer1Health}
              setPlayer2Health={setPlayer2Health}
              setPlayer1Combo={setPlayer1Combo}
              setPlayer2Combo={setPlayer2Combo}
            />
          </div>
        );
      case GameState.GameOver:
        const winnerName = isTie ? "It's a Tie!" : `Player ${winner!.id}`;
        return <GameOverScreen winnerName={winnerName} onRestart={startGame} />;
      default:
        return <StartMenu onStart={startGame} />;
    }
  };
  
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-5xl font-bold text-cyan-400 mb-2 tracking-wider" style={{ textShadow: '0 0 10px #0891b2' }}>
        Stickman Fighter
      </h1>
      <div className="w-[1024px] h-[576px] bg-slate-800 rounded-lg shadow-2xl shadow-cyan-500/20 overflow-hidden border-2 border-cyan-400">
        {renderContent()}
      </div>
       <div className="w-[1024px] mt-4 grid grid-cols-2 gap-4 text-slate-300">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-red-400 mb-2">Player 1 Controls</h3>
            <ControlDisplay controls={PLAYER_1_CONTROLS} />
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-blue-400 mb-2">Player 2 Controls</h3>
            <ControlDisplay controls={PLAYER_2_CONTROLS} />
          </div>
      </div>
    </main>
  );
};

export default App;