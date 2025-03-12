// src/components/ui/SuggestionForm.js
import React from 'react';

const SuggestionForm = ({ 
  suspects, 
  weapons, 
  currentRoom, 
  ui, 
  setUi, 
  makeSuggestion, 
  disabled 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-3">Fai un'Ipotesi</h3>
      <p className="text-sm text-gray-600 mb-4">
        Scegli un sospetto e un'arma per fare un'ipotesi. 
        La stanza sarà automaticamente quella in cui ti trovi ({currentRoom?.name || 'Nessuna'}).
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">Sospetto</label>
          <select 
            className="w-full p-2 border rounded"
            value={ui.selectedSuspect}
            onChange={(e) => setUi(prev => ({ ...prev, selectedSuspect: e.target.value }))}
            disabled={disabled}
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
            disabled={disabled}
          >
            <option value="">Seleziona...</option>
            {weapons.map(weapon => (
              <option key={weapon.id} value={weapon.id}>{weapon.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
          disabled={!ui.selectedSuspect || !ui.selectedWeapon || !currentRoom || disabled}
          onClick={makeSuggestion}
        >
          Fai l'Ipotesi
        </button>
        
        {!currentRoom && (
          <p className="text-sm text-red-600 mt-2">
            Devi essere in una stanza per fare un'ipotesi.
          </p>
        )}
        
        {disabled && (
          <p className="text-sm text-gray-600 mt-2">
            Puoi fare un'ipotesi solo durante il tuo turno.
          </p>
        )}
      </div>
    </div>
  );
};

export default SuggestionForm;