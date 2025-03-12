// src/components/ui/DetectiveNotes.js
import React from 'react';

const DetectiveNotes = ({ 
  suspects, 
  weapons, 
  rooms, 
  detectiveNotes, 
  toggleNoteState, 
  getNoteStateClass 
}) => {
  return (
    <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-bold mb-2">Sospetti</h3>
          <ul className="space-y-1">
            {suspects.map(suspect => (
              <li 
                key={suspect.id} 
                className={`p-2 rounded cursor-pointer flex items-center ${getNoteStateClass(detectiveNotes[suspect.id].state)}`}
                onClick={() => toggleNoteState(suspect.id)}
              >
                <div className={`w-4 h-4 rounded-full ${suspect.color} mr-2`}></div>
                {suspect.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Armi</h3>
          <ul className="space-y-1">
            {weapons.map(weapon => (
              <li 
                key={weapon.id} 
                className={`p-2 rounded cursor-pointer ${getNoteStateClass(detectiveNotes[weapon.id].state)}`}
                onClick={() => toggleNoteState(weapon.id)}
              >
                {weapon.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Stanze</h3>
          <ul className="space-y-1">
            {rooms.map(room => (
              <li 
                key={room.id} 
                className={`p-2 rounded cursor-pointer ${getNoteStateClass(detectiveNotes[room.id].state)}`}
                onClick={() => toggleNoteState(room.id)}
              >
                {room.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm">
          <span className="inline-block w-4 h-4 bg-gray-100 mr-1"></span> Sconosciuto
          <span className="inline-block w-4 h-4 bg-yellow-200 ml-4 mr-1"></span> Forse
          <span className="inline-block w-4 h-4 bg-red-200 ml-4 mr-1"></span> Non è
          <span className="inline-block w-4 h-4 bg-green-200 ml-4 mr-1"></span> Sì
          <span className="inline-block w-4 h-4 bg-blue-200 ml-4 mr-1"></span> In mano
        </p>
      </div>
    </div>
  );
};

export default DetectiveNotes;