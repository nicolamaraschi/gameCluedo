// src/components/ui/PlayerCards.js
import React from 'react';

const PlayerCards = ({ cards }) => {
  // Determina il tipo di carta
  const getCardType = (card) => {
    if (card.color) return "Sospetto";
    if (card.id === "candlestick" || card.id === "knife" || card.id === "pipe" ||
        card.id === "revolver" || card.id === "rope" || card.id === "wrench") {
      return "Arma";
    }
    return "Stanza";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card) => (
        <div key={card.id} className="p-2 bg-white border border-gray-300 rounded-lg w-full md:w-48">
          <div className="text-sm text-gray-500">{getCardType(card)}</div>
          <div className="font-medium">{card.name}</div>
        </div>
      ))}
      {cards.length === 0 && (
        <p className="text-gray-500">Nessuna carta ricevuta</p>
      )}
    </div>
  );
};

export default PlayerCards;