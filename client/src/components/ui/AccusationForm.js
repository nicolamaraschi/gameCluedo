// src/components/ui/AccusationForm.js
import React from 'react';

const AccusationForm = ({ suspects, weapons, rooms, ui, setUi, makeAccusation }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border-2 border-red-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-red-700">Accusa Finale</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setUi(prev => ({ ...prev, makingAccusation: false }))}
        >
          Annulla
        </button>
      </div>
      
      <p className="text-sm text-red-700 mb-4">
        Attenzione! Se la tua accusa è sbagliata, sarai eliminato dalla partita. 
        Assicurati di essere certo della soluzione.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 font-medium">Sospetto</label>
          <select 
            className="w-full p-2 border rounded"
            value={ui.selectedSuspect}
            onChange={(e) => setUi(prev => ({ ...prev, selectedSuspect: e.target.value }))}
          >
            <option value="">Seleziona...</option>
            {suspects.map(suspect => (
              <option key={suspect.id} value={suspect.id}>{suspect.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Arma</label>
          <select 
            className="w-full p-2 border rounded"
            value={ui.selectedWeapon}
            onChange={(e) => setUi(prev => ({ ...prev, selectedWeapon: e.target.value }))}
          >
            <option value="">Seleziona...</option>
            {weapons.map(weapon => (
              <option key={weapon.id} value={weapon.id}>{weapon.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Stanza</label>
          <select 
            className="w-full p-2 border rounded"
            value={ui.selectedRoom}
            onChange={(e) => setUi(prev => ({ ...prev, selectedRoom: e.target.value }))}
          >
            <option value="">Seleziona...</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <button 
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
        disabled={!ui.selectedSuspect || !ui.selectedWeapon || !ui.selectedRoom}
        onClick={makeAccusation}
      >
        Fai l'Accusa
      </button>
    </div>
  );
};

export default AccusationForm;