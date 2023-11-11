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
} as const;

const mapLayout = [
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1,
]

function clearScreen() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
}

function drawPlayer() {
  const size = 8;

  ctx.fillStyle = 'yellow';
  ctx.fillRect(playerPosition.x - size/2, playerPosition.y - size/2, size, size);

  ctx.lineWidth = 3;
  ctx.strokeStyle = 'yellow';

  ctx.beginPath();
  ctx.moveTo(playerPosition.x, playerPosition.y);
  ctx.lineTo(playerPosition.x + playerPosition.deltaX*10, playerPosition.y + playerPosition.deltaY*10)

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
      const isWall = mapLayout[y*MAP_DATA.xCells+x] === 1;
      ctx.fillStyle = isWall ? 'white' : 'black';
      const posX = x * MAP_DATA.cellSize;
      const posY = y * MAP_DATA.cellSize;
      ctx.fillRect(posX + 1, posY + 1, MAP_DATA.cellSize - 1, MAP_DATA.cellSize - 1);
    }
  }
}

const MAX_DEPTH_OF_FIELD = 8;

function drawRays2d() {
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
      rayY = playerPosition.y - playerPosition.y % MAP_DATA.cellSize
      rayX = (playerPosition.y - rayY) * inverseTan + playerPosition.x;
      yOffset = -MAP_DATA.cellSize;
      xOffset = -yOffset*inverseTan;
    }
    // Looking down
    else if (rayAngle < Math.PI) {
      rayY = playerPosition.y - playerPosition.y % MAP_DATA.cellSize + MAP_DATA.cellSize;
      rayX = (playerPosition.y - rayY) * inverseTan + playerPosition.x;
      yOffset = MAP_DATA.cellSize;
      xOffset = -yOffset*inverseTan;
    }
    // Looking straight left or right
    else {
      rayX = playerPosition.x;
      rayY = playerPosition.y;
      depthOfField = MAX_DEPTH_OF_FIELD;
    }

    while (depthOfField < MAX_DEPTH_OF_FIELD) {
      const mapX = (rayX - rayX % MAP_DATA.cellSize) / MAP_DATA.cellSize;
      const mapY = (rayY - rayY % MAP_DATA.cellSize) / MAP_DATA.cellSize;
      const mapPosition = mapY * MAP_DATA.xCells+mapX;

      if (
        mapPosition < MAP_DATA.xCells*MAP_DATA.yCells &&
        mapLayout[mapPosition] === 1) {
          console.log('HitWall!');
        // Hit wall
        depthOfField = MAX_DEPTH_OF_FIELD;
      }
      else {
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
    ctx.fillStyle = 'red';
    ctx.fillRect(rayX - 2, rayY - 2, 4, 4);
  }
}

function display() {
  clearScreen();
  drawMap2d();
  drawRays2d();
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
