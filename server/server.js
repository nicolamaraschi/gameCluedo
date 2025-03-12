// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Definizioni dei dati di gioco
const suspects = [
  { id: 'mustard', name: 'Colonnello Mustard', color: 'yellow' },
  { id: 'plum', name: 'Professor Plum', color: 'purple' },
  { id: 'green', name: 'Reverendo Green', color: 'green' },
  { id: 'peacock', name: 'Signora Peacock', color: 'blue' },
  { id: 'scarlet', name: 'Signorina Scarlet', color: 'red' },
  { id: 'white', name: 'Signora White', color: 'white' }
];

const weapons = [
  { id: 'candlestick', name: 'Candelabro' },
  { id: 'knife', name: 'Coltello' },
  { id: 'pipe', name: 'Tubo di Piombo' },
  { id: 'revolver', name: 'Revolver' },
  { id: 'rope', name: 'Corda' },
  { id: 'wrench', name: 'Chiave Inglese' }
];

const rooms = [
  { id: 'hall', name: 'Ingresso' },
  { id: 'lounge', name: 'Salotto' },
  { id: 'dining', name: 'Sala da Pranzo' },
  { id: 'kitchen', name: 'Cucina' },
  { id: 'ballroom', name: 'Sala da Ballo' },
  { id: 'conservatory', name: 'Serra' },
  { id: 'billiard', name: 'Sala Biliardo' },
  { id: 'library', name: 'Biblioteca' },
  { id: 'study', name: 'Studio' }
];

// Gestione delle stanze di gioco
const gameRooms = {};

// Funzione per mescolare un array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// API Endpoints
app.get('/api/game-rooms', (req, res) => {
  const roomList = Object.keys(gameRooms).map(roomId => ({
    id: roomId,
    name: gameRooms[roomId].name,
    playerCount: Object.keys(gameRooms[roomId].players).length,
    maxPlayers: gameRooms[roomId].maxPlayers,
    status: gameRooms[roomId].status
  }));
  res.json(roomList);
});

app.post('/api/create-room', (req, res) => {
  const { roomName, maxPlayers, creatorName } = req.body;
  
  if (!roomName || !maxPlayers || !creatorName) {
    return res.status(400).json({ error: 'Informazioni mancanti' });
  }
  
  const roomId = uuidv4();
  
  gameRooms[roomId] = {
    id: roomId,
    name: roomName,
    maxPlayers: maxPlayers,
    players: {},
    status: 'waiting', // waiting, playing, ended
    turn: null,
    solution: null,
    cards: [],
    gameLog: []
  };
  
  res.json({ roomId });
});

// Socket.io gestione delle connessioni
io.on('connection', (socket) => {
  console.log('Nuovo client connesso', socket.id);
  
  // Unisciti a una stanza
  socket.on('joinRoom', ({ roomId, playerName, characterId }) => {
    const room = gameRooms[roomId];
    
    if (!room) {
      socket.emit('error', { message: 'La stanza non esiste' });
      return;
    }
    
    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'La partita è già iniziata' });
      return;
    }
    
    if (Object.keys(room.players).length >= room.maxPlayers) {
      socket.emit('error', { message: 'La stanza è piena' });
      return;
    }
    
    // Controlla se il personaggio è già stato scelto
    const characterTaken = Object.values(room.players).some(player => player.character.id === characterId);
    if (characterTaken) {
      socket.emit('error', { message: 'Questo personaggio è già stato scelto' });
      return;
    }
    
    // Aggiunge il giocatore alla stanza
    const character = suspects.find(s => s.id === characterId);
    
    room.players[socket.id] = {
      id: socket.id,
      name: playerName,
      character: character,
      cards: [],
      position: null,
      ready: false
    };
    
    socket.join(roomId);
    
    // Invia aggiornamento a tutti i giocatori nella stanza
    io.to(roomId).emit('roomUpdate', {
      roomId,
      players: Object.values(room.players),
      status: room.status
    });
    
    socket.emit('joinedRoom', { roomId, players: Object.values(room.players) });
    
    // Aggiunge un messaggio al log
    room.gameLog.push({
      type: 'system',
      message: `${playerName} si è unito alla partita come ${character.name}`,
      timestamp: new Date().toISOString()
    });
    io.to(roomId).emit('logUpdate', { log: room.gameLog });
  });
  
  // Segnalazione di pronto
  socket.on('playerReady', ({ roomId }) => {
    const room = gameRooms[roomId];
    
    if (!room || !room.players[socket.id]) {
      socket.emit('error', { message: 'Stanza o giocatore non valido' });
      return;
    }
    
    room.players[socket.id].ready = true;
    
    // Invia aggiornamento
    io.to(roomId).emit('roomUpdate', {
      roomId,
      players: Object.values(room.players),
      status: room.status
    });
    
    // Controlla se tutti i giocatori sono pronti
    const allReady = Object.values(room.players).every(player => player.ready);
    const playerCount = Object.keys(room.players).length;
    
    if (allReady && playerCount >= 2) {
      // Inizia la partita
      startGame(roomId);
    }
  });
  
  // Muovi il personaggio
  socket.on('movePlayer', ({ roomId, roomId: destinationRoomId }) => {
    const room = gameRooms[roomId];
    
    if (!room || !room.players[socket.id]) {
      socket.emit('error', { message: 'Stanza o giocatore non valido' });
      return;
    }
    
    if (room.turn !== socket.id) {
      socket.emit('error', { message: 'Non è il tuo turno' });
      return;
    }
    
    // Aggiorna la posizione del giocatore
    room.players[socket.id].position = destinationRoomId;
    
    // Invia aggiornamento
    io.to(roomId).emit('playerMoved', {
      playerId: socket.id,
      playerName: room.players[socket.id].name,
      roomId: destinationRoomId
    });
    
    // Aggiorna il log
    room.gameLog.push({
      type: 'action',
      message: `${room.players[socket.id].name} si è spostato in ${rooms.find(r => r.id === destinationRoomId).name}`,
      timestamp: new Date().toISOString()
    });
    io.to(roomId).emit('logUpdate', { log: room.gameLog });
  });
  
  // Fare un'ipotesi
  socket.on('makeSuggestion', ({ roomId, suspectId, weaponId }) => {
    const room = gameRooms[roomId];
    
    if (!room || !room.players[socket.id]) {
      socket.emit('error', { message: 'Stanza o giocatore non valido' });
      return;
    }
    
    if (room.turn !== socket.id) {
      socket.emit('error', { message: 'Non è il tuo turno' });
      return;
    }
    
    // Controlla se il giocatore è in una stanza
    if (!room.players[socket.id].position) {
      socket.emit('error', { message: 'Devi essere in una stanza per fare un\'ipotesi' });
      return;
    }
    
    const currentRoomId = room.players[socket.id].position;
    const suspect = suspects.find(s => s.id === suspectId);
    const weapon = weapons.find(w => w.id === weaponId);
    const currentRoom = rooms.find(r => r.id === currentRoomId);
    
    if (!suspect || !weapon || !currentRoom) {
      socket.emit('error', { message: 'Dati non validi per l\'ipotesi' });
      return;
    }
    
    // Invia l'ipotesi a tutti i giocatori
    io.to(roomId).emit('suggestionMade', {
      playerId: socket.id,
      playerName: room.players[socket.id].name,
      suspect: suspect,
      weapon: weapon,
      room: currentRoom
    });
    
    // Aggiorna il log
    room.gameLog.push({
      type: 'suggestion',
      message: `${room.players[socket.id].name} ipotizza: ${suspect.name} con ${weapon.name} in ${currentRoom.name}`,
      timestamp: new Date().toISOString()
    });
    io.to(roomId).emit('logUpdate', { log: room.gameLog });
    
    // Trova il prossimo giocatore che deve rispondere
    const playerIds = Object.keys(room.players);
    const currentPlayerIndex = playerIds.indexOf(socket.id);
    let nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
    
    // Il prossimo giocatore deve controllare se può confutare l'ipotesi
    const nextPlayerId = playerIds[nextPlayerIndex];
    
    // Invia richiesta al prossimo giocatore
    io.to(nextPlayerId).emit('checkSuggestion', {
      suggester: room.players[socket.id].name,
      suspect: suspect,
      weapon: weapon,
      room: currentRoom
    });
    
    // Salva temporaneamente l'ipotesi per gestire le risposte
    room.currentSuggestion = {
      suggester: socket.id,
      suspect: suspect,
      weapon: weapon,
      room: currentRoom,
      currentResponder: nextPlayerId
    };
  });
  
  // Risposta all'ipotesi
  socket.on('suggestionResponse', ({ roomId, cardId }) => {
    const room = gameRooms[roomId];
    
    if (!room || !room.players[socket.id] || !room.currentSuggestion) {
      socket.emit('error', { message: 'Stato di gioco non valido' });
      return;
    }
    
    if (room.currentSuggestion.currentResponder !== socket.id) {
      socket.emit('error', { message: 'Non è il tuo turno di rispondere' });
      return;
    }
    
    // Aggiorna il log
    const suggester = room.players[room.currentSuggestion.suggester];
    const responder = room.players[socket.id];
    
    if (cardId) {
      // Ha mostrato una carta
      const card = [...suspects, ...weapons, ...rooms].find(c => c.id === cardId);
      
      // Invia la carta solo al giocatore che ha fatto l'ipotesi
      io.to(room.currentSuggestion.suggester).emit('cardShown', {
        fromPlayer: responder.name,
        card: card
      });
      
      // Informa tutti che una carta è stata mostrata (ma non quale)
      room.gameLog.push({
        type: 'response',
        message: `${responder.name} ha mostrato una carta a ${suggester.name}`,
        timestamp: new Date().toISOString()
      });
      
      // Informa gli altri giocatori
      socket.to(roomId).emit('responseGiven', {
        responder: responder.name,
        wasAbleToDisprove: true
      });
      
      // Passa al turno successivo
      nextTurn(roomId);
    } else {
      // Non può confutare, passa al prossimo giocatore
      const playerIds = Object.keys(room.players);
      const currentResponderIndex = playerIds.indexOf(socket.id);
      let nextResponderIndex = (currentResponderIndex + 1) % playerIds.length;
      
      // Salta il giocatore che ha fatto l'ipotesi
      if (playerIds[nextResponderIndex] === room.currentSuggestion.suggester) {
        nextResponderIndex = (nextResponderIndex + 1) % playerIds.length;
      }
      
      // Se siamo tornati al giocatore originale, nessuno può confutare
      if (playerIds[nextResponderIndex] === room.currentSuggestion.suggester) {
        room.gameLog.push({
          type: 'response',
          message: `Nessuno può confutare l'ipotesi di ${suggester.name}`,
          timestamp: new Date().toISOString()
        });
        io.to(roomId).emit('logUpdate', { log: room.gameLog });
        
        // Passa al turno successivo
        nextTurn(roomId);
      } else {
        // Passa al prossimo responder
        const nextResponder = playerIds[nextResponderIndex];
        room.currentSuggestion.currentResponder = nextResponder;
        
        // Informa che il giocatore non poteva confutare
        room.gameLog.push({
          type: 'response',
          message: `${responder.name} non può confutare l'ipotesi`,
          timestamp: new Date().toISOString()
        });
        
        // Informa tutti
        io.to(roomId).emit('responseGiven', {
          responder: responder.name,
          wasAbleToDisprove: false
        });
        
        // Chiedi al prossimo giocatore
        io.to(nextResponder).emit('checkSuggestion', {
          suggester: suggester.name,
          suspect: room.currentSuggestion.suspect,
          weapon: room.currentSuggestion.weapon,
          room: room.currentSuggestion.room
        });
      }
    }
    
    io.to(roomId).emit('logUpdate', { log: room.gameLog });
  });
  
  // Fare un'accusa
  socket.on('makeAccusation', ({ roomId, suspectId, weaponId, roomId: accusationRoomId }) => {
    const room = gameRooms[roomId];
    
    if (!room || !room.players[socket.id]) {
      socket.emit('error', { message: 'Stanza o giocatore non valido' });
      return;
    }
    
    if (room.turn !== socket.id) {
      socket.emit('error', { message: 'Non è il tuo turno' });
      return;
    }
    
    const suspect = suspects.find(s => s.id === suspectId);
    const weapon = weapons.find(w => w.id === weaponId);
    const accusationRoom = rooms.find(r => r.id === accusationRoomId);
    
    if (!suspect || !weapon || !accusationRoom) {
      socket.emit('error', { message: 'Dati non validi per l\'accusa' });
      return;
    }
    
    // Verifica l'accusa
    const isCorrect = 
      room.solution.suspect.id === suspectId &&
      room.solution.weapon.id === weaponId &&
      room.solution.room.id === accusationRoomId;
    
    // Aggiorna il log
    room.gameLog.push({
      type: 'accusation',
      message: `${room.players[socket.id].name} accusa: ${suspect.name} con ${weapon.name} in ${accusationRoom.name}`,
      timestamp: new Date().toISOString()
    });
    
    if (isCorrect) {
      // Vittoria!
      room.status = 'ended';
      room.winner = socket.id;
      
      io.to(roomId).emit('gameEnded', {
        winner: room.players[socket.id].name,
        solution: room.solution
      });
      
      room.gameLog.push({
        type: 'system',
        message: `${room.players[socket.id].name} ha risolto il caso! Partita terminata.`,
        timestamp: new Date().toISOString()
      });
    } else {
      // Accusa sbagliata, il giocatore è eliminato
      room.players[socket.id].eliminated = true;
      
      io.to(roomId).emit('playerEliminated', {
        playerName: room.players[socket.id].name,
        accusation: {
          suspect: suspect,
          weapon: weapon,
          room: accusationRoom
        }
      });
      
      room.gameLog.push({
        type: 'system',
        message: `${room.players[socket.id].name} ha fatto un'accusa sbagliata ed è stato eliminato!`,
        timestamp: new Date().toISOString()
      });
      
      // Controlla se tutti i giocatori sono stati eliminati
      const allEliminated = Object.values(room.players).every(player => player.eliminated);
      
      if (allEliminated) {
        // Partita terminata, nessun vincitore
        room.status = 'ended';
        
        io.to(roomId).emit('gameEnded', {
          winner: null,
          solution: room.solution
        });
        
        room.gameLog.push({
          type: 'system',
          message: `Tutti i giocatori sono stati eliminati! La soluzione era: ${room.solution.suspect.name} con ${room.solution.weapon.name} in ${room.solution.room.name}`,
          timestamp: new Date().toISOString()
        });
      } else {
        // Passa al turno successivo
        nextTurn(roomId);
      }
    }
    
    io.to(roomId).emit('logUpdate', { log: room.gameLog });
  });
  
  // Fine turno
  socket.on('endTurn', ({ roomId }) => {
    const room = gameRooms[roomId];
    
    if (!room || !room.players[socket.id]) {
      socket.emit('error', { message: 'Stanza o giocatore non valido' });
      return;
    }
    
    if (room.turn !== socket.id) {
      socket.emit('error', { message: 'Non è il tuo turno' });
      return;
    }
    
    nextTurn(roomId);
  });
  
  // Gestione della disconnessione
  socket.on('disconnect', () => {
    console.log('Client disconnesso', socket.id);
    
    // Trova tutte le stanze in cui il giocatore è presente
    Object.keys(gameRooms).forEach(roomId => {
      const room = gameRooms[roomId];
      
      if (room.players[socket.id]) {
        const playerName = room.players[socket.id].name;
        
        // Rimuovi il giocatore
        delete room.players[socket.id];
        
        // Se la stanza è vuota, rimuovila
        if (Object.keys(room.players).length === 0) {
          delete gameRooms[roomId];
          return;
        }
        
        // Aggiorna il log
        room.gameLog.push({
          type: 'system',
          message: `${playerName} si è disconnesso`,
          timestamp: new Date().toISOString()
        });
        
        // Se la partita è in corso, gestisci la disconnessione
        if (room.status === 'playing') {
          // Se era il turno del giocatore disconnesso, passa al prossimo
          if (room.turn === socket.id) {
            nextTurn(roomId);
          }
        }
        
        // Invia aggiornamento
        io.to(roomId).emit('roomUpdate', {
          roomId,
          players: Object.values(room.players),
          status: room.status
        });
        
        io.to(roomId).emit('logUpdate', { log: room.gameLog });
      }
    });
  });
});

// Funzione per iniziare la partita
function startGame(roomId) {
  const room = gameRooms[roomId];
  
  if (!room || room.status !== 'waiting') {
    return;
  }
  
  // Imposta lo stato della partita
  room.status = 'playing';
  
  // Seleziona la soluzione
  const mysterySuspect = suspects[Math.floor(Math.random() * suspects.length)];
  const mysteryWeapon = weapons[Math.floor(Math.random() * weapons.length)];
  const mysteryRoom = rooms[Math.floor(Math.random() * rooms.length)];
  
  room.solution = {
    suspect: mysterySuspect,
    weapon: mysteryWeapon,
    room: mysteryRoom
  };
  
  // Prepara le carte da distribuire
  const remainingCards = [
    ...suspects.filter(s => s.id !== mysterySuspect.id),
    ...weapons.filter(w => w.id !== mysteryWeapon.id),
    ...rooms.filter(r => r.id !== mysteryRoom.id)
  ];
  
  // Mescola le carte
  const shuffledCards = shuffleArray([...remainingCards]);
  room.cards = shuffledCards;
  
  // Distribuisci le carte ai giocatori
  const players = Object.values(room.players);
  const cardsPerPlayer = Math.floor(shuffledCards.length / players.length);
  
  players.forEach((player, index) => {
    const startIndex = index * cardsPerPlayer;
    const playerCards = shuffledCards.slice(startIndex, startIndex + cardsPerPlayer);
    room.players[player.id].cards = playerCards;
    
    // Posiziona i giocatori in stanze casuali
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    room.players[player.id].position = randomRoom.id;
  });
  
  // Seleziona casualmente il primo giocatore
  const firstPlayerIndex = Math.floor(Math.random() * players.length);
  room.turn = players[firstPlayerIndex].id;
  
  // Aggiungi messaggio al log
  room.gameLog.push({
    type: 'system',
    message: 'La partita è iniziata!',
    timestamp: new Date().toISOString()
  });
  
  room.gameLog.push({
    type: 'system',
    message: `È il turno di ${players[firstPlayerIndex].name}`,
    timestamp: new Date().toISOString()
  });
  
  // Invia lo stato di gioco a tutti i giocatori
  io.to(roomId).emit('gameStarted', {
    roomId,
    players: Object.values(room.players).map(p => ({
      id: p.id,
      name: p.name,
      character: p.character,
      position: p.position,
      eliminated: p.eliminated || false
    })),
    turn: room.turn
  });
  
  // Invia le carte a ciascun giocatore
  players.forEach(player => {
    io.to(player.id).emit('cardsDealt', { cards: room.players[player.id].cards });
  });
  
  io.to(roomId).emit('logUpdate', { log: room.gameLog });
}

// Funzione per passare al turno successivo
function nextTurn(roomId) {
  const room = gameRooms[roomId];
  
  if (!room || room.status !== 'playing') {
    return;
  }
  
  // Trova il prossimo giocatore che non è stato eliminato
  const playerIds = Object.keys(room.players);
  const currentTurnIndex = playerIds.indexOf(room.turn);
  let nextPlayerIndex = (currentTurnIndex + 1) % playerIds.length;
  
  // Salta i giocatori eliminati
  while (room.players[playerIds[nextPlayerIndex]].eliminated) {
    nextPlayerIndex = (nextPlayerIndex + 1) % playerIds.length;
    
    // Se abbiamo fatto un giro completo, tutti sono eliminati
    if (nextPlayerIndex === currentTurnIndex) {
      room.status = 'ended';
      
      io.to(roomId).emit('gameEnded', {
        winner: null,
        solution: room.solution
      });
      
      room.gameLog.push({
        type: 'system',
        message: `Tutti i giocatori sono stati eliminati! La soluzione era: ${room.solution.suspect.name} con ${room.solution.weapon.name} in ${room.solution.room.name}`,
        timestamp: new Date().toISOString()
      });
      
      io.to(roomId).emit('logUpdate', { log: room.gameLog });
      
      return;
    }
  }
  
  // Imposta il nuovo turno
  room.turn = playerIds[nextPlayerIndex];
  
  // Aggiungi messaggio al log
  room.gameLog.push({
    type: 'system',
    message: `È il turno di ${room.players[room.turn].name}`,
    timestamp: new Date().toISOString()
  });
  
  // Resetta lo stato dell'ipotesi attuale
  room.currentSuggestion = null;
  
  // Invia l'aggiornamento del turno
  io.to(roomId).emit('turnChanged', {
    playerId: room.turn,
    playerName: room.players[room.turn].name
  });
  
  io.to(roomId).emit('logUpdate', { log: room.gameLog });
}

// Avvia il server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});