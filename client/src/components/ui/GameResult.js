// src/components/ui/GameResult.js
import React from 'react';

const GameResult = ({ winner, solution, leaveRoom }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className={`p-8 rounded-lg shadow-lg ${winner ? 'bg-green-50' : 'bg-red-50'}`}>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {winner ? '🎉 Vittoria! 🎉' : '⚠️ Partita Terminata ⚠️'}
        </h2>
        
        <div className="text-center mb-6">
          {winner ? (
            <p className="text-xl text-green-700">
              {winner === 'me' 
                ? 'Hai risolto correttamente il caso!' 
                : `${winner} ha risolto il caso!`}
            </p>
          ) : (
            <p className="text-xl text-red-700">
              Tutti i giocatori sono stati eliminati. Nessun vincitore.
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-center">La soluzione era:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-sm text-gray-500 mb-1">Colpevole</div>
              <div className="font-bold text-lg">{solution?.suspect?.name || 'Sconosciuto'}</div>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-sm text-gray-500 mb-1">Arma</div>
              <div className="font-bold text-lg">{solution?.weapon?.name || 'Sconosciuta'}</div>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-sm text-gray-500 mb-1">Luogo</div>
              <div className="font-bold text-lg">{solution?.room?.name || 'Sconosciuto'}</div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={leaveRoom}
          >
            Torna alla Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;