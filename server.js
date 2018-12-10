const WebSocket = require('ws');
const url = require('url');

const port = 7777;
const server = new WebSocket.Server({ port });
console.log(`listening on port ${port}`);

const broadcast = (str) => {
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  });
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class vec2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  normalize() {
    const length = Math.sqrt((this.x * this.x) + (this.y * this.y));
    if (length !== 0) {
      this.x /= length;
      this.y /= length;
    }
  }
}

class Player {
  constructor(id) {
    this.id = id;
    this.pos = new vec2(getRandomInt(300, 800), getRandomInt(300, 800));
    this.dir = new vec2();
  }

  update(dir) {
    if (!dir || (typeof dir.x !== 'number' || typeof dir.y !== 'number')) {
      return;
    }

    this.dir.x = dir.x;
    this.dir.y = dir.y;
    this.dir.normalize();
  }
}

const game = {
  players: {},

  getState() {
    return Object.values(this.players).reduce((result, player) => {
      result[player.id] = {
        id: player.id,
        x: player.pos.x.toFixed(2),
        y: player.pos.y.toFixed(2)
      };

      return result;
    }, {});
  },

  addPlayer(player) {
    return this.players[player.id] = player;
  },

  removePlayer(playerId) {
    delete this.players[playerId];
  },

  update() {
    Object.values(this.players).forEach(player => {
      player.pos.x += player.dir.x * 10;
      player.pos.y += player.dir.y * 10;
    });
  }
};

setInterval(() => {
  game.update();
  broadcast(JSON.stringify({
    type: 'update',
    data: game.getState()
  }));
}, 1000 / 60);

server.on('connection', (ws, request) => {
  const parsedUrl = url.parse(request.url, true);
  console.log(parsedUrl.query);
  if (!parsedUrl || !parsedUrl.query || !parsedUrl.query.id) {
    ws.close();
    return;
  }

  const player = game.addPlayer(new Player(parsedUrl.query.id));
  broadcast(JSON.stringify({
    type: 'chat',
    data: `SERVER: ${player.id} joined!`
  }));

  ws.on('message', rawMessage => {
    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch (error) {
      console.log('message doesn\'t appear to be JSON', error);
      return;
    }

    switch (message.type) {
      case 'input': {
        player.update(message.data);
        break;
      }
      case 'chat': {
        broadcast(JSON.stringify({
          type: 'chat',
          data: `${player.id}: ${message.data}`
        }));
        break;
      }
    }
  });

  ws.on('close', () => {
    game.removePlayer(player.id);

    broadcast(JSON.stringify({
      type: 'chat',
      data: `SERVER: ${player.id} left the game :(`
    }));
  });

  ws.send(JSON.stringify({ message: 'connected' }));
});
