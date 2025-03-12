// src/components/views/WaitingRoomView.js
import React from 'react';

const WaitingRoomView = ({ 
  currentRoomId, 
  gameRooms, 
  gameState, 
  setPlayerReady, 
  leaveRoom, 
  socketRef
}) => {
  const room = gameRooms.find(r => r.id === currentRoomId);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Stanza: {room?.name}</h2>
        <button 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          onClick={leaveRoom}
        >
          Esci dalla Stanza
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-3">Giocatori ({gameState.players.length})</h3>
          <ul className="divide-y divide-gray-200">
            {gameState.players.map(player => (
              <li key={player.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${player.character?.color || 'bg-gray-300'} mr-2`}></div>
                  <span>{player.name}</span>
                  {player.id === socketRef.current?.id && <span className="ml-2 text-xs text-gray-500">(Tu)</span>}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${player.ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {player.ready ? 'Pronto' : 'In Attesa'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-3">Informazioni Partita</h3>
          <div className="text-sm space-y-2">
            <p><span className="font-medium">Stanza:</span> {room?.name}</p>
            <p><span className="font-medium">Stato:</span> In attesa di giocatori</p>
            <p><span className="font-medium">Giocatori necessari:</span> Minimo 2</p>
            <p className="text-gray-500 mt-4">Tutti i giocatori devono essere pronti per iniziare la partita.</p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button 
          className={`px-6 py-3 rounded text-white font-bold ${gameState.players.find(p => p.id === socketRef.current?.id)?.ready ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
          disabled={gameState.players.find(p => p.id === socketRef.current?.id)?.ready}
          onClick={setPlayerReady}
        >
          {gameState.players.find(p => p.id === socketRef.current?.id)?.ready ? 'Sei Pronto' : 'Segna come Pronto'}
        </button>
      </div>
    </div>
  );
};

export default WaitingRoomView;