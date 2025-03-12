// src/data/gameData.js

export const gameData = {
    suspects: [
      { id: 'mustard', name: 'Colonnello Mustard', color: 'bg-yellow-500' },
      { id: 'plum', name: 'Professor Plum', color: 'bg-purple-700' },
      { id: 'green', name: 'Reverendo Green', color: 'bg-green-600' },
      { id: 'peacock', name: 'Signora Peacock', color: 'bg-blue-600' },
      { id: 'scarlet', name: 'Signorina Scarlet', color: 'bg-red-600' },
      { id: 'white', name: 'Signora White', color: 'bg-gray-100' }
    ],
  
    weapons: [
      { id: 'candlestick', name: 'Candelabro' },
      { id: 'knife', name: 'Coltello' },
      { id: 'pipe', name: 'Tubo di Piombo' },
      { id: 'revolver', name: 'Revolver' },
      { id: 'rope', name: 'Corda' },
      { id: 'wrench', name: 'Chiave Inglese' }
    ],
  
    rooms: [
      { id: 'hall', name: 'Ingresso' },
      { id: 'lounge', name: 'Salotto' },
      { id: 'dining', name: 'Sala da Pranzo' },
      { id: 'kitchen', name: 'Cucina' },
      { id: 'ballroom', name: 'Sala da Ballo' },
      { id: 'conservatory', name: 'Serra' },
      { id: 'billiard', name: 'Sala Biliardo' },
      { id: 'library', name: 'Biblioteca' },
      { id: 'study', name: 'Studio' }
    ]
  };
  
  export const getNoteStateClass = (state) => {
    switch (state) {
      case 'maybe': return 'bg-yellow-200';
      case 'not': return 'bg-red-200';
      case 'yes': return 'bg-green-200';
      case 'in-hand': return 'bg-blue-200';
      default: return 'bg-gray-100';
    }
  };