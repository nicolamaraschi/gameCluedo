// src/components/views/LoginView.js
import React from 'react';

const LoginView = ({ 
  playerName, 
  setPlayerName, 
  selectedCharacter, 
  setSelectedCharacter, 
  connected, 
  onEnterLobby,
  suspects
}) => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Cluedo Multiplayer</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Il tuo nome:</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Inserisci il tuo nome"
        />
      </div>
      
      <div className="mb-6">
        <label className="block mb-2">Seleziona il tuo personaggio:</label>
        <div className="grid grid-cols-2 gap-2">
          {suspects.map(suspect => (
            <div 
              key={suspect.id}
              className={`p-2 border rounded cursor-pointer flex items-center ${selectedCharacter === suspect.id ? 'border-blue-500 bg-blue-50' : ''}`}
              onClick={() => setSelectedCharacter(suspect.id)}
            >
              <div className={`w-3 h-3 rounded-full ${suspect.color} mr-2`}></div>
              <span className="text-sm">{suspect.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={!playerName || !selectedCharacter || !connected}
        onClick={onEnterLobby}
      >
        {connected ? 'Entra nella Lobby' : 'Connessione al server in corso...'}
      </button>
      
      {!connected && (
        <p className="mt-2 text-red-500 text-sm text-center">
          Non è possibile connettersi al server. Riprova più tardi.
        </p>
      )}
    </div>
  );
};

export default LoginView;