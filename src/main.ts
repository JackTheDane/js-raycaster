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

function drawRays3d() {
  let rayX: number;
  let rayY: number;
  let xOffset = 0;
  let yOffset = 0;
  let depthOfField: number;

  const rayAngle = playerPosition.angle;
  for (let r = 0; r < 1; r++) {
    depthOfField = 0;
    // Check horizontal lines
    const inverseTan = -1/Math.tan(rayAngle);

    // Looking up
    if (rayAngle > Math.PI) {
      rayY = ((playerPosition.y>>6)<<6) - 0.0001; // TODO: Make work w. cellSize
      rayX = (playerPosition.y - rayY) * inverseTan + playerPosition.x;
      yOffset = -MAP_DATA.cellSize;
      xOffset = -yOffset*inverseTan;
    }
    // Looking down
    else if (rayAngle < Math.PI) {
      rayY = ((playerPosition.y>>6)<<6) + MAP_DATA.cellSize; // TODO: Make work w. cellSize
      rayX = (playerPosition.y - rayY) * inverseTan + playerPosition.x;
      yOffset = MAP_DATA.cellSize;
      xOffset = -yOffset*inverseTan;
    }
    // Looking straight left or right
    else {
      rayX = playerPosition.x;
      rayY = playerPosition.y;
      depthOfField = 8;
    }

    while (depthOfField < 8) {
      const mapX = Math.floor(rayX/MAP_DATA.cellSize);
      const mapY = Math.floor(rayY/MAP_DATA.cellSize);
      const mapPosition = mapY * MAP_DATA.xCells+mapX;


      if (mapPosition < mapX*mapY && mapLayout[mapY][mapX] === 1) {
        // Hit wall
        depthOfField = 8;
      } else {
        rayX += xOffset;
        rayY += yOffset;
        depthOfField += 1;
      }
    }

    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playerPosition.x, playerPosition.y);
    ctx.lineTo(rayX, rayY);
    ctx.stroke();
  }
}

function display() {
  clearScreen();
  drawMap2d();
  drawRays3d();
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
