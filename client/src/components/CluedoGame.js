// src/components/CluedoGame.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import LoginView from './views/LoginView';
import LobbyView from './views/LobbyView';
import WaitingRoomView from './views/WaitingRoomView';
import GameBoardView from './views/GameBoardView';
import Notification from './ui/Notification';
import { gameData } from '../data/gameData';

const CluedoGame = () => {
  // Stati per l'interfaccia e il gioco
  const [connected, setConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [gameState, setGameState] = useState({
    players: [],
    myTurn: false,
    myCards: [],
    myPosition: null,
    status: 'waiting',
    winner: null,
    solution: null,
    gameLog: []
  });
  const [ui, setUi] = useState({
    view: 'login', // login, lobby, room, game
    creatingRoom: false,
    roomName: '',
    maxPlayers: 4,
    selectedSuspect: '',
    selectedWeapon: '',
    selectedRoom: '',
    makingAccusation: false,
    showCards: false,
    showNotes: true,
    error: null
  });
  const [detectiveNotes, setDetectiveNotes] = useState(() => {
    // Inizializza le note del detective
    const notes = {};
    gameData.suspects.forEach(s => notes[s.id] = { state: 'unknown' });
    gameData.weapons.forEach(w => notes[w.id] = { state: 'unknown' });
    gameData.rooms.forEach(r => notes[r.id] = { state: 'unknown' });
    return notes;
  });
  const [gameRooms, setGameRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Riferimento al socket.io
  const socketRef = useRef();

  // Connetti al server di gioco usando Socket.io
  useEffect(() => {
    // Inizializza la connessione
    const ENDPOINT = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://cluedo-server.onrender.com';

    socketRef.current = io(ENDPOINT);

    // Gestisce la connessione stabilita
    socketRef.current.on('connect', () => {
      console.log('Connessione al server stabilita');
      setConnected(true);
      
      // Ottieni la lista delle stanze di gioco disponibili
      fetchGameRooms();
    });

    // Gestisce gli errori dal server
    socketRef.current.on('error', (data) => {
      setUi(prev => ({ ...prev, error: data.message }));
      displayNotification(data.message);
    });

    // Gestisce aggiornamenti della stanza
    socketRef.current.on('roomUpdate', (data) => {
      console.log('Aggiornamento stanza:', data);
      setGameState(prev => ({
        ...prev,
        players: data.players
      }));
    });

    // Gestisce l'unione a una stanza
    socketRef.current.on('joinedRoom', (data) => {
      console.log('Unito alla stanza:', data);
      setCurrentRoomId(data.roomId);
      setUi(prev => ({ ...prev, view: 'room' }));
    });

    // Gestisce aggiornamenti del log di gioco
    socketRef.current.on('logUpdate', (data) => {
      setGameState(prev => ({
        ...prev,
        gameLog: data.log
      }));
    });

    // Gestisce l'inizio della partita
    socketRef.current.on('gameStarted', (data) => {
      console.log('Partita iniziata:', data);
      
      // Determina se è il nostro turno
      const isMyTurn = data.turn === socketRef.current.id;
      
      setGameState(prev => ({
        ...prev,
        players: data.players,
        status: 'playing',
        myTurn: isMyTurn,
        myPosition: data.players.find(p => p.id === socketRef.current.id)?.position
      }));
      
      setUi(prev => ({ ...prev, view: 'game' }));
    });

    // Gestisce la distribuzione delle carte
    socketRef.current.on('cardsDealt', (data) => {
      console.log('Carte ricevute:', data.cards);
      
      setGameState(prev => ({
        ...prev,
        myCards: data.cards
      }));
      
      // Aggiorna le note con le carte in mano
      const updatedNotes = { ...detectiveNotes };
      data.cards.forEach(card => {
        updatedNotes[card.id] = { state: 'in-hand' };
      });
      setDetectiveNotes(updatedNotes);
    });

    // Gestisce il cambio di turno
    socketRef.current.on('turnChanged', (data) => {
      console.log('Cambio turno:', data);
      
      const isMyTurn = data.playerId === socketRef.current.id;
      
      setGameState(prev => ({
        ...prev,
        myTurn: isMyTurn
      }));
    });

    // Gestisce il movimento di un giocatore
    socketRef.current.on('playerMoved', (data) => {
      console.log('Giocatore spostato:', data);
      
      // Aggiorna la propria posizione se siamo noi
      if (data.playerId === socketRef.current.id) {
        setGameState(prev => ({
          ...prev,
          myPosition: data.roomId
        }));
      }
      
      // Aggiorna i giocatori nella stanza
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === data.playerId 
            ? { ...p, position: data.roomId } 
            : p
        )
      }));
    });

    // Gestisce le ipotesi fatte
    socketRef.current.on('suggestionMade', (data) => {
      console.log('Ipotesi fatta:', data);
    });

    // Gestisce le richieste di verifica delle ipotesi
    socketRef.current.on('checkSuggestion', (data) => {
      console.log('Verifica ipotesi:', data);
      
      // Trova quali carte può mostrare
      const cards = gameState.myCards.filter(card => 
        card.id === data.suspect.id || 
        card.id === data.weapon.id || 
        card.id === data.room.id
      );
      
      if (cards.length > 0) {
        // Mostro un dialogo per selezionare quale carta mostrare
        displayNotification(`${data.suggester} ipotizza: ${data.suspect.name} con ${data.weapon.name} in ${data.room.name}. Seleziona una carta da mostrare.`);
        
        // In una implementazione reale, qui ci sarebbe un dialogo di selezione
        // Per ora, mostriamo automaticamente la prima carta disponibile
        setTimeout(() => {
          socketRef.current.emit('suggestionResponse', {
            roomId: currentRoomId,
            cardId: cards[0].id
          });
        }, 2000);
      } else {
        // Non può confutare l'ipotesi
        socketRef.current.emit('suggestionResponse', {
          roomId: currentRoomId,
          cardId: null
        });
      }
    });

    // Gestisce le carte mostrate a noi
    socketRef.current.on('cardShown', (data) => {
      console.log('Carta mostrata:', data);
      displayNotification(`${data.fromPlayer} ti ha mostrato: ${data.card.name}`);
      
      // Aggiorna le note del detective in base alla risposta
      const updatedNotes = { ...detectiveNotes };
      updatedNotes[data.card.id] = { state: 'not' };
      setDetectiveNotes(updatedNotes);
    });

    // Gestisce le risposte alle ipotesi
    socketRef.current.on('responseGiven', (data) => {
      console.log('Risposta data:', data);
    });

    // Gestisce l'eliminazione di un giocatore
    socketRef.current.on('playerEliminated', (data) => {
      console.log('Giocatore eliminato:', data);
      displayNotification(`${data.playerName} ha fatto un'accusa sbagliata ed è stato eliminato!`);
    });

    // Gestisce la fine della partita
    socketRef.current.on('gameEnded', (data) => {
      console.log('Partita terminata:', data);
      
      setGameState(prev => ({
        ...prev,
        status: 'ended',
        winner: data.winner,
        solution: data.solution
      }));
      
      if (data.winner) {
        displayNotification(`${data.winner} ha vinto la partita!`);
      } else {
        displayNotification(`Partita terminata. Nessun vincitore.`);
      }
    });

    // Gestisce la disconnessione dal server
    socketRef.current.on('disconnect', () => {
      console.log('Disconnesso dal server');
      setConnected(false);
    });

    // Cleanup alla smontaggio del componente
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Aggiorna le note quando cambiano le carte in mano
  useEffect(() => {
    if (gameState.myCards.length > 0) {
      const updatedNotes = { ...detectiveNotes };
      gameState.myCards.forEach(card => {
        updatedNotes[card.id] = { state: 'in-hand' };
      });
      setDetectiveNotes(updatedNotes);
    }
  }, [gameState.myCards]);

  // Funzioni per interagire con il server
  const fetchGameRooms = () => {
  const apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api/game-rooms' 
    : 'https://gamecluedo.onrender.com/api/game-rooms';
    
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      setGameRooms(data);
    })
    .catch(error => {
      console.error('Errore nel recupero delle stanze:', error);
    });
};

  const joinRoom = (roomId) => {
    if (!playerName || !selectedCharacter) {
      displayNotification("Inserisci il tuo nome e seleziona un personaggio");
      return;
    }

    socketRef.current.emit('joinRoom', {
      roomId,
      playerName,
      characterId: selectedCharacter
    });
  };

  const createRoom = () => {
    if (!ui.roomName || !playerName) {
      displayNotification("Inserisci il tuo nome e il nome della stanza");
      return;
    }
  
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api/create-room' 
      : 'https://gamecluedo.onrender.com/api/create-room';
  
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roomName: ui.roomName,
        maxPlayers: ui.maxPlayers,
        creatorName: playerName
      })
    })
    // resto del codice...

    fetch('http://localhost:3001/api/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roomName: ui.roomName,
        maxPlayers: ui.maxPlayers,
        creatorName: playerName
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          displayNotification(data.error);
        } else {
          // Stanza creata, aggiorna la lista e unisciti
          fetchGameRooms();
          setUi(prev => ({ ...prev, creatingRoom: false }));
          joinRoom(data.roomId);
        }
      })
      .catch(error => {
        console.error('Errore nella creazione della stanza:', error);
        displayNotification("Errore nella creazione della stanza");
      });
  };

  const setPlayerReady = () => {
    socketRef.current.emit('playerReady', {
      roomId: currentRoomId
    });
    
    // Aggiorna lo stato locale del giocatore
    setGameState(prev => {
      const updatedPlayers = prev.players.map(p => 
        p.id === socketRef.current.id ? { ...p, ready: true } : p
      );
      return { ...prev, players: updatedPlayers };
    });
  };

  const movePlayer = (roomId) => {
    socketRef.current.emit('movePlayer', {
      roomId: currentRoomId,
      roomId: roomId // destinationRoomId
    });
  };

  const makeSuggestion = () => {
    if (!ui.selectedSuspect || !ui.selectedWeapon) {
      displayNotification("Seleziona un sospetto e un'arma");
      return;
    }
    
    socketRef.current.emit('makeSuggestion', {
      roomId: currentRoomId,
      suspectId: ui.selectedSuspect,
      weaponId: ui.selectedWeapon
    });
    
    // Resetta la selezione
    setUi(prev => ({
      ...prev,
      selectedSuspect: '',
      selectedWeapon: ''
    }));
  };

  const makeAccusation = () => {
    if (!ui.selectedSuspect || !ui.selectedWeapon || !ui.selectedRoom) {
      displayNotification("Seleziona un sospetto, un'arma e una stanza");
      return;
    }
    
    socketRef.current.emit('makeAccusation', {
      roomId: currentRoomId,
      suspectId: ui.selectedSuspect,
      weaponId: ui.selectedWeapon,
      roomId: ui.selectedRoom
    });
    
    // Chiude il pannello dell'accusa
    setUi(prev => ({
      ...prev,
      makingAccusation: false,
      selectedSuspect: '',
      selectedWeapon: '',
      selectedRoom: ''
    }));
  };

  const endTurn = () => {
    socketRef.current.emit('endTurn', {
      roomId: currentRoomId
    });
  };

  const leaveRoom = () => {
    // In un'implementazione reale, informeremmo il server
    // Per ora, scolleghiamoci e riconnettiamoci
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
    
    setCurrentRoomId(null);
    setUi(prev => ({ ...prev, view: 'lobby' }));
    setGameState({
      players: [],
      myTurn: false,
      myCards: [],
      myPosition: null,
      status: 'waiting',
      winner: null,
      solution: null,
      gameLog: []
    });
  };

  const toggleNoteState = (id) => {
    const states = ['unknown', 'maybe', 'not', 'yes'];
    const currentState = detectiveNotes[id].state;
    
    // Se la carta è nelle mani del giocatore, non cambiare lo stato
    if (currentState === 'in-hand') return;
    
    const currentIndex = states.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % states.length;
    
    setDetectiveNotes({
      ...detectiveNotes,
      [id]: { state: states[nextIndex] }
    });
  };

  const displayNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Nasconde la notifica dopo 3 secondi
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Renderizzazione condizionale in base alla vista corrente
  const renderCurrentView = () => {
    switch (ui.view) {
      case 'login':
        return (
          <LoginView 
            playerName={playerName}
            setPlayerName={setPlayerName}
            selectedCharacter={selectedCharacter}
            setSelectedCharacter={setSelectedCharacter}
            connected={connected}
            onEnterLobby={() => setUi(prev => ({ ...prev, view: 'lobby' }))}
            suspects={gameData.suspects}
          />
        );
      case 'lobby':
        return (
          <LobbyView 
            gameRooms={gameRooms}
            ui={ui}
            setUi={setUi}
            joinRoom={joinRoom}
            createRoom={createRoom}
            fetchGameRooms={fetchGameRooms}
          />
        );
      case 'room':
        return (
          <WaitingRoomView 
            currentRoomId={currentRoomId}
            gameRooms={gameRooms}
            gameState={gameState}
            setPlayerReady={setPlayerReady}
            leaveRoom={leaveRoom}
            socketRef={socketRef}
          />
        );
      case 'game':
        return (
          <GameBoardView 
            gameState={gameState}
            ui={ui}
            setUi={setUi}
            suspects={gameData.suspects}
            weapons={gameData.weapons}
            rooms={gameData.rooms}
            playerName={playerName}
            selectedCharacter={selectedCharacter}
            detectiveNotes={detectiveNotes}
            toggleNoteState={toggleNoteState}
            movePlayer={movePlayer}
            makeSuggestion={makeSuggestion}
            makeAccusation={makeAccusation}
            endTurn={endTurn}
            leaveRoom={leaveRoom}
          />
        );
      default:
        return <div>Vista non riconosciuta</div>;
    }
  };

  return (
    <div className="container mx-auto">
      {renderCurrentView()}
      
      {showNotification && (
        <Notification 
          message={notificationMessage} 
          onClose={() => setShowNotification(false)} 
        />
      )}
    </div>
  );
};

export default CluedoGame;