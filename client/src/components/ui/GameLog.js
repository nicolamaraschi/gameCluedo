// src/components/ui/GameLog.js
import React from 'react';

const GameLog = ({ gameLog }) => {
  // Utility per formattare il timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determina la classe CSS in base al tipo di log
  const getLogTypeClass = (type) => {
    switch (type) {
      case 'system':
        return 'text-blue-600';
      case 'action':
        return 'text-gray-700';
      case 'suggestion':
        return 'text-yellow-600';
      case 'accusation':
        return 'text-red-600';
      case 'response':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="h-64 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
      {gameLog.length === 0 ? (
        <p className="text-center text-gray-500 py-4">Nessun messaggio nel log</p>
      ) : (
        <ul className="space-y-1">
          {gameLog.map((entry, index) => (
            <li key={index} className="text-sm border-b border-gray-100 pb-1">
              <span className="text-gray-400 text-xs mr-2">{formatTimestamp(entry.timestamp)}</span>
              <span className={getLogTypeClass(entry.type)}>{entry.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GameLog;