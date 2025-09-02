import React, { useState, useEffect } from 'react';
import { Crown, Sword, Ship, Coins, Users, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import "./App.css";
type Resource = 'treasury' | 'military' | 'navy' | 'diplomacy' | 'colonies';
type Territory = 'europe' | 'americas' | 'india';
type Alliance = 'austria' | 'russia' | 'spain';
type Enemy = 'britain' | 'prussia';
interface EventOption { 
  text: string;
  [key: string]: any;
}

interface GameEvent {
  id: number;
  title: string;
  description: string;
  year: number;
  options: EventOption[];
}

interface GameState {
  turn: number;
  year: number;
  resources: Record<Resource, number>;
  territories: Record<Territory, number>;
  alliances: Record<Alliance, number>;
  enemies: Record<Enemy, number>;
  events: number[];
  gameOver: boolean;
  victory: boolean;
  currentEvent: GameEvent | null;
}

type Action = 'military' | 'navy' | 'diplomacy' | 'economy';

const SevenYearsWarGame = () => {
  const [showManual, setShowManual] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    turn: 1,
    year: 1754, // Start at 1754 so events 1 and 2 show up
    resources: { treasury: 100, military: 80, navy: 60, diplomacy: 70, colonies: 75 },
    territories: { europe: 85, americas: 40, india: 30 },
    alliances: { austria: 60, russia: 45, spain: 30 },
    enemies: { britain: 90, prussia: 85 },
    events: [],
    gameOver: false,
    victory: false,
    currentEvent: null
  });

  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showResults, setShowResults] = useState(false);

  const events: GameEvent[] = [
    { id: 1, title: "French british conflict begins in america", description: "Skirmishes between british and french forces begin. How should France respond?", year: 1754, options: [
        { text: "Send army", military: -10, diplomacy: -5, british: -40 ,americas: +10},
        { text: "Send financial aid only", treasury: -20, diplomacy: +10},
        { text: "Wait and see", diplomacy: -5, british: 60}
      ]},
      { id: 2, title: "French indian battles", description: "French and indian allies spot a force of british soldiers trying to take fort duquesne", year: 1755, options: [
        { text: "defend fort", military: 10, british: -80 ,americas: +10},
        { text: "Send financial aid only", treasury: -20, diplomacy: +10},
        { text: "Wait and see", diplomacy: 15, british: 70,military: -30}
      ]},
    { id: 3, title: "Frederick Invades Saxony", description: "Prussia has invaded Saxony! How should France respond?", year: 1756, options: [
        { text: "Mobilize immediately to support Austria", military: -10, diplomacy: +15, austria: +20 },
        { text: "Send financial aid only", treasury: -20, diplomacy: +10, austria: +10 },
        { text: "Wait and see", diplomacy: -5, austria: -10, europe: -40}
      ]},
    { id: 4, title: "Battle of Rossbach Opportunity", description: "A chance to defeat Frederick at Rossbach!", year: 1757, options: [
        { text: "Launch coordinated assault with Austria", military: -15, europe: +20, prussia: -15 },
        { text: "Feint attack to tie down Prussian forces", military: -5, diplomacy: +10 },
        { text: "Focus on other theaters", americas: +10, india: +10, europe: -30}
      ]},
    { id: 5, title: "British Naval Supremacy", description: "British fleets dominate the seas. How do we counter?", year: 1758, options: [
        { text: "Build massive new fleet", treasury: -30, navy: +25,military: -20 },
        { text: "Form anti-British naval coalition", diplomacy: +15, spain: +20, navy: +10 },
        { text: "Focus on land warfare", military: +15, navy: -5, europe: -20}
      ]},
    { id: 6, title: "Opportunity in India", description: "Dupleix reports chances for gains in India", year: 1759, options: [
        { text: "Massive reinforcement to India", treasury: -25, military: -10, india: +30 },
        { text: "Coordinate with local rulers", diplomacy: +10, india: +20, treasury: -10 },
        { text: "Maintain current forces", india: +5 }
      ]},
    { id: 7, title: "Spanish Entry", description: "Spain considers joining the war. Negotiate?", year: 1760, options: [
        { text: "Generous terms for Spanish alliance", treasury: -15, spain: +30, navy: +15 },
        { text: "Standard alliance terms", spain: +20, navy: +10 },
        { text: "Go it alone", treasury: +10, spain: -10 ,military: -20,europe: -50}
      ]},
    { id: 8, title: "Siege of Pondicherry", description: "The British captured the French capital in India, what should france do", year: 1761, options: [
        { text: "All-out offensive in Europe", military: -20, europe: +25, prussia: -20 },
        { text: "Secure colonies and India", americas: +15, india: +15, treasury: -10 },
        { text: "Strengthen alliances", diplomacy: +20, austria: +10, russia: +10 }
      ]},
    { id: 9, title: "Spanish french coalition", description: " British forces capture Havana (Cuba) and Manila (Philippines) from Spain, what should france do", year: 1762, options: [
        { text: "Massive offensives", military: -25, treasury: -15, europe: +30, britain: -30 },
        { text: "Consolidate gains and defend", military: -10, diplomacy: +15, austria: +10},
        { text: "Seek peace negotiations", diplomacy: +20, treasury: -5 ,europe: -60}
      ]},
  ];
  const checkForEvent = () => {
    const currentYearEvents = events.filter(e => e.year === gameState.year);
    if (currentYearEvents.length > 0 && !gameState.events.includes(currentYearEvents[0].id)) {
      setGameState(prev => ({ ...prev, currentEvent: currentYearEvents[0] }));
    }
  };

  const handleEventChoice = (option: EventOption) => {
    const newState = { ...gameState };
    Object.keys(option).forEach(key => {
      if (key === 'text') return;
      if (key in newState.resources) {
        newState.resources[key as Resource] = Math.max(0, Math.min(100, newState.resources[key as Resource] + option[key]));
      } else if (key in newState.territories) {
        newState.territories[key as Territory] = Math.max(0, Math.min(100, newState.territories[key as Territory] + option[key]));
      } else if (key in newState.alliances) {
        newState.alliances[key as Alliance] = Math.max(0, Math.min(100, newState.alliances[key as Alliance] + option[key]));
      } else if (key in newState.enemies) {
        newState.enemies[key as Enemy] = Math.max(0, Math.min(100, newState.enemies[key as Enemy] + option[key]));
      }
    });
    if (newState.currentEvent) {
      newState.events.push(newState.currentEvent.id);
    }
    newState.currentEvent = null;
    setGameState(newState);
    setShowResults(true);
    setTimeout(() => setShowResults(false), 2000);
  };

  const executeAction = (action: Action) => {
    const newState = { ...gameState };
    switch(action) {
      case 'military':
        if (newState.resources.treasury >= 15) {
          newState.resources.treasury -= 15;
          newState.resources.military += 10;
          newState.territories.europe += 5;
        }
        break;
      case 'navy':
        if (newState.resources.treasury >= 20) {
          newState.resources.treasury -= 20;
          newState.resources.navy += 15;
          newState.territories.americas += 5;
          newState.territories.india += 5;
        }
        break;
      case 'diplomacy':
        if (newState.resources.treasury >= 10) {
          newState.resources.treasury -= 10;
          newState.resources.diplomacy += 8;
          newState.alliances.austria += 5;
          newState.alliances.russia += 5;
        }
        break;
      case 'economy':
        newState.resources.treasury += 20;
        newState.resources.military -= 5;
        break;
    }
    const randomFactor = Math.random() * 10 - 5;
    newState.enemies.britain = Math.max(60, Math.min(100, newState.enemies.britain + randomFactor));
    newState.enemies.prussia = Math.max(60, Math.min(100, newState.enemies.prussia + randomFactor));
    setGameState(newState);
    setSelectedAction(null);
    setShowResults(true);
    setTimeout(() => setShowResults(false), 2000);
  };

  const nextTurn = () => {
    const newState = { ...gameState };
    newState.turn += 1;
    newState.year += 1;
    newState.resources.military = Math.max(50, newState.resources.military - 2);
    newState.resources.treasury = Math.max(20, newState.resources.treasury + 15 - Math.floor(newState.resources.military / 10));
    
    if (newState.year >= 1763) {
      const totalTerritorialControl = newState.territories.europe + newState.territories.americas + newState.territories.india;
      const totalAlliances = newState.alliances.austria + newState.alliances.russia + newState.alliances.spain;
      const enemyWeakness = (200 - newState.enemies.britain - newState.enemies.prussia);
      const victoryScore = totalTerritorialControl + totalAlliances/3 + enemyWeakness + newState.resources.military;
      if (victoryScore >= 300) {
        newState.victory = true;
        newState.gameOver = true;
      } else if (newState.territories.europe < 50) {
        newState.gameOver = true;
      }
    }
    setGameState(newState);
  };

  useEffect(() => {
    if (!gameState.gameOver && !gameState.currentEvent) {
      checkForEvent();
    }
  }, [gameState.year]);
const colorMap = {
  amber: { text: "text-amber-400", bg: "bg-amber-500" },
  rose: { text: "text-rose-400", bg: "bg-rose-500" },
  indigo: { text: "text-indigo-400", bg: "bg-indigo-500" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500" },
  purple: { text: "text-purple-400", bg: "bg-purple-500" },
  orange: { text: "text-orange-400", bg: "bg-orange-500" },
};
  const ResourceBar = ({ label, value, icon: Icon, color = "indigo" }: { label: string, value: number, icon: LucideIcon, color?: keyof typeof colorMap }) => {
  const colors = colorMap[color] || colorMap.indigo;
  return (
    <div className="flex items-center space-x-3 mb-4">
      <Icon className={`w-6 h-6 ${colors.text} animate-pulse`} />
      <span className="text-sm font-medium w-24 text-amber-200 font-lora">{label}:</span>
      <div className="flex-1 bg-gray-800/50 rounded-full h-3 border border-amber-400/50">
        <div 
          className={`h-3 rounded-full ${colors.bg} transition-all duration-500 ease-in-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm w-8 text-amber-200">{value}</span>
    </div>
  );
};
  return (
    <div className="min-h-screen font-lora">
      <button onClick={() => setShowManual(true)} className="manual-btn" style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 100
      }}>
        Game Manual
      </button>
      {/* --- MANUAL MODAL --- */}
      {showManual && (
        <div className="manual-modal" style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200
        }}>
          <div className="manual-content" style={{
            background: "#fff",
            color: "#222",
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 2px 16px rgba(0,0,0,0.2)"
          }}>
            <p>
              Welcome to the Seven Years War game!<br /><br />
              <b>Goal:</b> Lead France to victory by managing resources, alliances, and territory.<br /><br />
              <b>How to Play:</b><br />
              - Each turn, choose a strategy or respond to events which will affect your diplomacy, Territorial Control and Resources<br />
              - Build your army, navy, or economy, or use diplomacy.<br />
              - Survive until 1763 and achieve victory conditions!<br /><br />
              <b>Conditions:</b><br />
              - To win your territorial control over europe must be 50 or above<br /><br />
              Good luck, Général!
            </p>
            <button onClick={() => setShowManual(false)} style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1.5rem",
              background: "#f59e42",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}>Close</button>
          </div>
        </div>
      )}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:wght@400;700&display=swap');
          body {
            background-image: linear-gradient(to bottom right, #3730a3, #9f1239, #b45309);
            background-size: 200% 200%;
            animation: gradient 12s ease infinite;
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          .glow {
            box-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
          }
          .font-cinzel {
            font-family: 'Cinzel', serif;
          }
          .font-lora {
            font-family: 'Lora', serif;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto">
        {gameState.gameOver ? (
        <div className="flex items-center justify-center min-h-screen">  
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 text-amber-200 rounded-2xl shadow-2xl p-8 border-2 border-amber-400/70 max-w-3xl mx-auto">
            <div className="text-center">
              <Crown className="w-24 h-24 mx-auto mb-6 text-amber-400 animate-spin-slow" />
              <h1 className="text-5xl font-cinzel mb-6 text-amber-300 tracking-wide glow">
                {gameState.victory ? "Victory! France Triumphant!" : "La Défaite..."}
              </h1>
              {gameState.victory ? (
                <div className="text-lg space-y-4 text-amber-100">
                  <p>Through masterful strategy, France has reshaped history!</p>
                  <p>The Seven Years' War ends with French dominance.</p>
                  <p className="font-cinzel text-amber-400">Vive le Roi! Vive la France!</p>
                </div>
              ) : (
                <div className="text-lg space-y-4 text-amber-100">
                  <p>Despite valiant efforts, France has fallen.</p>
                  <p>History remains unchanged, yet hope endures...</p>
                </div>
              )}
              <button 
                onClick={() => window.location.reload()}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-lg font-cinzel text-lg hover:scale-105 transition-transform duration-300 shadow-lg glow"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
        ) : gameState.currentEvent ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 text-amber-200 rounded-2xl shadow-2xl p-8 border-2 border-amber-400/70 max-w-3xl mx-auto">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-10 h-10 mr-3 text-rose-500 animate-pulse" />
              <h2 className="text-3xl font-cinzel text-amber-300">{gameState.currentEvent.title}</h2>
            </div>
            <p className="text-lg mb-8 text-amber-100">{gameState.currentEvent.description}</p>
            <div className="space-y-4">
              {gameState.currentEvent.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleEventChoice(option)}
                  className="w-full p-4 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-lg font-lora text-left hover:scale-105 transition-transform duration-300 shadow-lg glow"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-5xl font-cinzel text-amber-300 mb-3 tracking-wide glow">The Seven Years' War</h1>
              <h2 className="text-2xl text-amber-200 font-lora">France's Path to Victory</h2>
              <div className="text-lg mt-3 text-amber-100">Year: {gameState.year} | Turn: {gameState.turn}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-700/90 to-indigo-900/90 rounded-2xl p-6 shadow-2xl border-2 border-amber-400/70">
                <h3 className="text-xl font-cinzel mb-4 flex items-center text-amber-300">
                  <Coins className="w-6 h-6 mr-2 text-amber-400 animate-pulse" />
                  Resources
                </h3>
                <ResourceBar label="Treasury" value={gameState.resources.treasury} icon={Coins} color="amber" />
                <ResourceBar label="Military" value={gameState.resources.military} icon={Sword} color="rose" />
                <ResourceBar label="Navy" value={gameState.resources.navy} icon={Ship} color="indigo" />
                <ResourceBar label="Diplomacy" value={gameState.resources.diplomacy} icon={Users} color="emerald" />
              </div>

              <div className="bg-gradient-to-br from-emerald-700/90 to-emerald-900/90 rounded-2xl p-6 shadow-2xl border-2 border-amber-400/70">
                <h3 className="text-xl font-cinzel mb-4 text-amber-300">Territorial Control</h3>
                <ResourceBar label="Europe" value={gameState.territories.europe} icon={Crown} color="purple" />
                <ResourceBar label="Americas" value={gameState.territories.americas} icon={Ship} color="emerald" />
                <ResourceBar label="India" value={gameState.territories.india} icon={Sword} color="orange" />
              </div>

              <div className="bg-gradient-to-br from-rose-700/90 to-rose-900/90 rounded-2xl p-6 shadow-2xl border-2 border-amber-400/70">
                <h3 className="text-xl font-cinzel mb-4 text-amber-300">Diplomatic Relations</h3>
                <div className="space-y-3">
                  <div className="text-sm text-amber-100">
                    <span className="font-medium">Austria:</span> {gameState.alliances.austria}/100
                  </div>
                  <div className="text-sm text-amber-100">
                    <span className="font-medium">Russia:</span> {gameState.alliances.russia}/100
                  </div>
                  <div className="text-sm text-amber-100">
                    <span className="font-medium">Spain:</span> {gameState.alliances.spain}/100
                  </div>
                  <div className="text-sm text-rose-400 mt-4">
                    <span className="font-medium">Enemy Strength:</span>
                  </div>
                  <div className="text-sm text-rose-400">
                    <span className="font-medium">Britain:</span> {gameState.enemies.britain}/100
                  </div>
                  <div className="text-sm text-rose-400">
                    <span className="font-medium">Prussia:</span> {gameState.enemies.prussia}/100
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-purple-700/90 to-purple-900/90 rounded-2xl p-6 shadow-2xl border-2 border-amber-400/70">
              <h3 className="text-xl font-cinzel mb-4 text-amber-300">Choose Your Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => executeAction('military')}
                  className="p-4 bg-gradient-to-r from-rose-600 to-rose-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg glow disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={gameState.resources.treasury < 15}
                >
                  <Sword className="w-6 h-6 mx-auto mb-2 text-amber-300 animate-pulse" />
                  <div className="font-semibold">Build Army</div>
                  <div className="text-sm">Cost: 15 Treasury</div>
                </button>

                <button
                  onClick={() => executeAction('navy')}
                  className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg glow disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={gameState.resources.treasury < 20}
                >
                  <Ship className="w-6 h-6 mx-auto mb-2 text-amber-300 animate-pulse" />
                  <div className="font-semibold">Expand Navy</div>
                  <div className="text-sm">Cost: 20 Treasury</div>
                </button>

                <button
                  onClick={() => executeAction('diplomacy')}
                  className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg glow disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={gameState.resources.treasury < 10}
                >
                  <Users className="w-6 h-6 mx-auto mb-2 text-amber-300 animate-pulse" />
                  <div className="font-semibold">Diplomacy</div>
                  <div className="text-sm">Cost: 10 Treasury</div>
                </button>

                <button
                  onClick={() => executeAction('economy')}
                  className="p-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg glow"
                >
                  <Coins className="w-6 h-6 mx-auto mb-2 text-amber-300 animate-pulse" />
                  <div className="font-semibold">Focus Economy</div>
                  <div className="text-sm">Gain Treasury</div>
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={nextTurn}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-rose-600 text-white rounded-lg font-cinzel text-lg hover:scale-105 transition-transform duration-300 shadow-lg glow"
                >
                  Next Turn →
                </button>
              </div>
            </div>

            {showResults && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 text-amber-200 p-6 rounded-2xl max-w-md shadow-2xl border-2 border-amber-400/70">
                  <h3 className="text-xl font-cinzel mb-2 text-amber-300">Action Complete!</h3>
                  <p className="text-amber-100">Your decision has been implemented. The war continues...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SevenYearsWarGame;