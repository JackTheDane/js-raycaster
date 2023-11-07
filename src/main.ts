import './index.css';

const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const INTERVAL = 1 / 60 * 1000;

const pressedKeys = new Set<string>();

const playerPosition = {
  x: 300,
  y: 300,
  deltaX: 0,
  deltaY: 0,
  angle: 0
}

const MAP_DATA = {
  xCells: 8,
  yCells: 8,
  cellSize: 64
}

const mapLayout = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
]

function clearScreen() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
}

function drawPlayer() {
  const size = 8;
  const playerCenter = {
    x: playerPosition.x + size/2,
    y: playerPosition.y + size/2,
  }

  ctx.fillStyle = 'yellow';
  ctx.fillRect(playerPosition.x, playerPosition.y, size, size);

  ctx.lineWidth = 3;
  ctx.strokeStyle = 'yellow';

  ctx.beginPath();
  ctx.moveTo(playerCenter.x, playerCenter.y);
  ctx.lineTo(playerCenter.x + playerPosition.deltaX*10, playerCenter.y + playerPosition.deltaY*10)

  ctx.stroke();
}

const SPEED = 2;
const MAX_ANGLE = 2* Math.PI;
const TURNING_INCREMENT = 0.05;

function checkForPressedKeys() {

  if (pressedKeys.has('a')) {
    playerPosition.angle -= TURNING_INCREMENT;
    if (playerPosition.angle < 0) {
      playerPosition.angle += MAX_ANGLE;
    }
    playerPosition.deltaX = Math.cos(playerPosition.angle) * SPEED;
    playerPosition.deltaY = Math.sin(playerPosition.angle) * SPEED;
  }
  if (pressedKeys.has('d')) {
    playerPosition.angle += TURNING_INCREMENT;
    if (playerPosition.angle > MAX_ANGLE) {
      playerPosition.angle -= MAX_ANGLE;
    }
    playerPosition.deltaX = Math.cos(playerPosition.angle) * SPEED;
    playerPosition.deltaY = Math.sin(playerPosition.angle) * SPEED;
  }
  if (pressedKeys.has('w')) {
    playerPosition.x += playerPosition.deltaX;
    playerPosition.y += playerPosition.deltaY;
  }
  if (pressedKeys.has('s')) {
    playerPosition.x -= playerPosition.deltaX;
    playerPosition.y -= playerPosition.deltaY;
  }
}

function drawMap2d() {
  for (let y = 0; y < MAP_DATA.yCells; y++) {
    for (let x = 0; x < MAP_DATA.xCells; x++) {
      const isWall = mapLayout[y][x] === 1;
      ctx.fillStyle = isWall ? 'white' : 'black';
      const posX = x * MAP_DATA.cellSize;
      const posY = y * MAP_DATA.cellSize;
      ctx.fillRect(posX + 1, posY + 1, MAP_DATA.cellSize - 1, MAP_DATA.cellSize - 1);
    }
  }
}

function display() {
  clearScreen();
  drawMap2d();
  checkForPressedKeys();
  drawPlayer();
}

function init() {
  playerPosition.deltaX = Math.cos(playerPosition.angle) * SPEED;
  playerPosition.deltaY = Math.sin(playerPosition.angle) * SPEED;

  document.addEventListener('keydown', (event) => {
    pressedKeys.add(event.key);
  })

  document.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.key);
  })

  setInterval(() => {
    window.requestAnimationFrame(display);
  }, INTERVAL)
}

init();
