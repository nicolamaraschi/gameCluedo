// src/components/views/LobbyView.js
import React from 'react';

const LobbyView = ({ 
  gameRooms, 
  ui, 
  setUi, 
  joinRoom, 
  createRoom, 
  fetchGameRooms 
}) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Stanze di Gioco</h2>
        <div>
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            onClick={() => setUi(prev => ({ ...prev, creatingRoom: true }))}
          >
            Crea Stanza
          </button>
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => setUi(prev => ({ ...prev, view: 'login' }))}
          >
            Indietro
          </button>
        </div>
      </div>
      
      {ui.creatingRoom ? (
        <div className="p-4 bg-white rounded-lg shadow mb-4">
          <h3 className="text-lg font-bold mb-2">Crea una Nuova Stanza</h3>
          <div className="mb-4">
            <label className="block mb-1">Nome della Stanza:</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              value={ui.roomName}
              onChange={(e) => setUi(prev => ({ ...prev, roomName: e.target.value }))}
              placeholder="Inserisci un nome"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Numero Massimo di Giocatori:</label>
            <select 
              className="w-full p-2 border rounded"
              value={ui.maxPlayers}
              onChange={(e) => setUi(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
            >
              {[2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button 
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => setUi(prev => ({ ...prev, creatingRoom: false }))}
            >
              Annulla
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={createRoom}
            >
              Crea
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nome Stanza</th>
                <th className="px-4 py-2 text-center">Giocatori</th>
                <th className="px-4 py-2 text-center">Stato</th>
                <th className="px-4 py-2 text-center">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gameRooms.map(room => (
                <tr key={room.id}>
                  <td className="px-4 py-3">{room.name}</td>
                  <td className="px-4 py-3 text-center">{room.playerCount} / {room.maxPlayers}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${room.status === 'waiting' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {room.status === 'waiting' ? 'In Attesa' : 'In Corso'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={room.status !== 'waiting'}
                      onClick={() => joinRoom(room.id)}
                    >
                      Unisciti
                    </button>
                  </td>
                </tr>
              ))}
              {gameRooms.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                    Nessuna stanza disponibile. Creane una!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <button 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={fetchGameRooms}
      >
        Aggiorna Lista
      </button>
    </div>
  );
};

export default LobbyView;