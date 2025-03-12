// src/components/views/GameBoardView.js
import React from 'react';
import { getNoteStateClass } from '../../data/gameData';
import GameLog from '../ui/GameLog';
import DetectiveNotes from '../ui/DetectiveNotes';
import PlayerCards from '../ui/PlayerCards';
import SuggestionForm from '../ui/SuggestionForm';
import AccusationForm from '../ui/AccusationForm';
import GameResult from '../ui/GameResult';

const GameBoardView = ({
  gameState,
  ui,
  setUi,
  suspects,
  weapons,
  rooms,
  playerName,
  selectedCharacter,
  detectiveNotes,
  toggleNoteState,
  movePlayer,
  makeSuggestion,
  makeAccusation,
  endTurn,
  leaveRoom
}) => {
  // Gioco terminato
  if (gameState.status === 'ended') {
    return (
      <GameResult 
        winner={gameState.winner}
        solution={gameState.solution}
        leaveRoom={leaveRoom}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonna sinistra: Informazioni e azioni del giocatore */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-2">Le tue Informazioni</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Nome:</span> {playerName}</p>
              <p><span className="font-medium">Personaggio:</span> {suspects.find(s => s.id === selectedCharacter)?.name}</p>
              <p><span className="font-medium">Posizione:</span> {rooms.find(r => r.id === gameState.myPosition)?.name}</p>
              <p><span className="font-medium">Stato:</span> {gameState.myTurn ? 'È il tuo turno' : 'In attesa'}</p>
            </div>
          </div>
          
          {gameState.myTurn && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-bold mb-2">Il tuo Turno</h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-2 font-medium">Movimenti</p>
                  <div className="grid grid-cols-3 gap-1">
                    {rooms.map(room => (
                      <button 
                        key={room.id} 
                        className={`p-2 text-xs rounded ${gameState.myPosition === room.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                        onClick={() => movePlayer(room.id)}
                      >
                        {room.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 font-medium">Azioni</p>
                  <div className="space-y-2">
                    <button 
                      className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => setUi(prev => ({ ...prev, makingAccusation: false }))}
                    >
                      Fai un'Ipotesi
                    </button>
                    <button 
                      className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => setUi(prev => ({ ...prev, makingAccusation: true }))}
                    >
                      Fai un'Accusa
                    </button>
                    <button 
                      className="w-full p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      onClick={endTurn}
                    >
                      Termina Turno
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Le tue Carte</h3>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setUi(prev => ({ ...prev, showCards: !prev.showCards }))}
              >
                {ui.showCards ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
            
            {ui.showCards && (
              <PlayerCards cards={gameState.myCards} />
            )}
          </div>
          
          <button 
            className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={leaveRoom}
          >
            Abbandona Partita
          </button>
        </div>
        
        {/* Colonna centrale/destra: Area di gioco */}
        <div className="lg:col-span-2 space-y-4">
          {ui.makingAccusation ? (
            <AccusationForm 
              suspects={suspects}
              weapons={weapons}
              rooms={rooms}
              ui={ui}
              setUi={setUi}
              makeAccusation={makeAccusation}
            />
          ) : (
            <SuggestionForm 
              suspects={suspects}
              weapons={weapons}
              currentRoom={rooms.find(r => r.id === gameState.myPosition)}
              ui={ui}
              setUi={setUi}
              makeSuggestion={makeSuggestion}
              disabled={!gameState.myTurn}
            />
          )}
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Blocco Note</h3>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setUi(prev => ({ ...prev, showNotes: !prev.showNotes }))}
              >
                {ui.showNotes ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
            
            {ui.showNotes && (
              <DetectiveNotes 
                suspects={suspects}
                weapons={weapons}
                rooms={rooms}
                detectiveNotes={detectiveNotes}
                toggleNoteState={toggleNoteState}
                getNoteStateClass={getNoteStateClass}
              />
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-2">Log di Gioco</h3>
            <GameLog gameLog={gameState.gameLog} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoardView;