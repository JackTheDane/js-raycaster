import './index.css';
import { RangeInputController } from "./InputController";
import { MouseController } from './MouseController';

const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const INTERVAL = 1 / 60 * 1000;
const ONE_DEGREE_IN_RADIANS = 0.0174533;
const SPEED = 3;
const TURNING_SPEED_INCREMENT = 0.05;

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

type MapCell = number;

const mapLayout: MapCell[] = [
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 0, 1,
  1, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1,
]

let mapCellIndexHoveredByMouse: number | null = null;

const getDistanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt( (x2-x1) * (x2-x1) + (y2-y1) * (y2-y1) );

const getPlayerDistanceToPoint = (x: number, y: number) => getDistanceBetweenPoints(playerPosition.x, playerPosition.y, x, y);

const getMapCellIndexForCoordinate = (x: number, y: number): number | null => {
  const isOutOfBoundsX = x >= CANVAS_WIDTH / 2;
  const isOutOfBoundsY = y >= CANVAS_HEIGHT;

  if (isOutOfBoundsX || isOutOfBoundsY) {
    return null;
  }

  const mapX = (x - x % MAP_DATA.cellSize) / MAP_DATA.cellSize;
  const mapY = (y - y % MAP_DATA.cellSize) / MAP_DATA.cellSize;
  const mapIndex = mapY * MAP_DATA.xCells+mapX;

  if (mapLayout[mapIndex] == null) {
    return null;
  }

  return mapIndex;
}

const getMapCellValueForCoordinate = (x: number, y: number): number | null => {
  const mapIndex = getMapCellIndexForCoordinate(x, y);

  return mapIndex ? mapLayout[mapIndex] : null;
}

const fovSlider = new RangeInputController('#field-of-view-input');
const numberOfRaysSlider = new RangeInputController('#number-of-rays-input');

const mouseController = new MouseController(canvas, (x, y, clickType) => {
  const mapCellIndexForCoordinate = getMapCellIndexForCoordinate(x, y);

  if (mapCellIndexForCoordinate == null) {
    return;
  }

  mapLayout[mapCellIndexForCoordinate] = clickType === 'left' ? 1 : 0;
});

function checkForMapCellHoveredByMouse() {
  mapCellIndexHoveredByMouse = mouseController.mousePosition ? getMapCellIndexForCoordinate(mouseController.mousePosition.x, mouseController.mousePosition.y) : null;
}

function clearScreen() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function drawSkybox() {
  // Sky
  ctx.fillStyle = 'blue';
  ctx.fillRect(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  // Ground
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
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

const MAX_ANGLE = 2* Math.PI;

const checkForCollision = (x: number, y: number) => getMapCellValueForCoordinate(x, y) === 1;

function checkForPressedKeys() {
  if (pressedKeys.has('a')) {
    playerPosition.angle -= TURNING_SPEED_INCREMENT;
    if (playerPosition.angle < 0) {
      playerPosition.angle += MAX_ANGLE;
    }
    playerPosition.deltaX = Math.cos(playerPosition.angle) * SPEED;
    playerPosition.deltaY = Math.sin(playerPosition.angle) * SPEED;
  }
  if (pressedKeys.has('d')) {
    playerPosition.angle += TURNING_SPEED_INCREMENT;
    if (playerPosition.angle > MAX_ANGLE) {
      playerPosition.angle -= MAX_ANGLE;
    }
    playerPosition.deltaX = Math.cos(playerPosition.angle) * SPEED;
    playerPosition.deltaY = Math.sin(playerPosition.angle) * SPEED;
  }
  if (pressedKeys.has('w')) {
    let newPlayerX = playerPosition.x + playerPosition.deltaX;
    let newPlayerY = playerPosition.y + playerPosition.deltaY;

    if (checkForCollision(newPlayerX, playerPosition.y)) {
      newPlayerX = playerPosition.x;
    }

    if (checkForCollision(playerPosition.x, newPlayerY)) {
      newPlayerY = playerPosition.y;
    }

    playerPosition.x = newPlayerX
    playerPosition.y = newPlayerY
  }
  if (pressedKeys.has('s')) {
    let newPlayerX = playerPosition.x - playerPosition.deltaX;
    let newPlayerY = playerPosition.y - playerPosition.deltaY;

    if (checkForCollision(newPlayerX, playerPosition.y)) {
      newPlayerX = playerPosition.x;
    }

    if (checkForCollision(playerPosition.x, newPlayerY)) {
      newPlayerY = playerPosition.y;
    }

    playerPosition.x = newPlayerX
    playerPosition.y = newPlayerY
  }
}

function setCursorType() {
  canvas.style.cursor = mapCellIndexHoveredByMouse == null ? 'unset' : 'pointer';
}

function drawMapCell(color: string, mapCellX: number, mapCellY: number) {
  ctx.fillStyle = color;
  const posX = mapCellX * MAP_DATA.cellSize;
  const posY = mapCellY * MAP_DATA.cellSize;
  ctx.fillRect(posX + 1, posY + 1, MAP_DATA.cellSize - 1, MAP_DATA.cellSize - 1);
}



function getColorForMapCellIndex(mapCellIndex: number) {
  const mapCell = mapLayout.at(mapCellIndex);
  if (mapCell == null) return;
  const isWall = mapCell === 1;

  return isWall ? 'black' : 'white';
}

function drawMap2d() {
  for (let y = 0; y < MAP_DATA.yCells; y++) {
    for (let x = 0; x < MAP_DATA.xCells; x++) {
      const mapCellIndex = y*MAP_DATA.xCells+x;
      const colorForMapCellIndex = getColorForMapCellIndex(mapCellIndex);

      if (colorForMapCellIndex == null) return;

      drawMapCell(colorForMapCellIndex, x, y);
    }
  }
}

function drawHoveredMapCellHighlight() {
  if (mapCellIndexHoveredByMouse == null) return;

  const mapCellX = mapCellIndexHoveredByMouse % MAP_DATA.xCells;
  const mapCellY = Math.floor(mapCellIndexHoveredByMouse/MAP_DATA.yCells);

  drawMapCell('hsla(0, 0%, 50%, 0.4)', mapCellX, mapCellY);
}


const MAX_DEPTH_OF_FIELD = 8;
const HALF_OF_PI = Math.PI/2;
const ONE_AND_A_HALF_OF_PI = HALF_OF_PI*3;


function drawRays() {
  let rayX: number;
  let rayY: number;
  let xOffset = 0;
  let yOffset = 0;
  let depthOfField: number;
  let rayAngle = playerPosition.angle - ONE_DEGREE_IN_RADIANS*(fovSlider.value/2);
  const rayScreenWidth = CANVAS_WIDTH/2/numberOfRaysSlider.value;
  let color: string;

  if (rayAngle<0) rayAngle += 2*Math.PI;
  if (rayAngle>2*Math.PI) rayAngle -= 2*Math.PI;

  for (let r = 0; r < numberOfRaysSlider.value; r++) {
    depthOfField = 0;

    // ---- Check vertical lines ---- //
    const negativeTan = -Math.tan(rayAngle);
    let distanceToHitVertical = 100000;
    let verticalRayX = 0;
    let verticalRayY = 0;

    // Looking left
    if (rayAngle > HALF_OF_PI && rayAngle < ONE_AND_A_HALF_OF_PI) {
      rayX = playerPosition.x - playerPosition.x % MAP_DATA.cellSize - 0.0001;
      rayY = (playerPosition.x - rayX) * negativeTan + playerPosition.y;
      xOffset = -MAP_DATA.cellSize;
      yOffset = -xOffset*negativeTan;
    }
    // Looking right
    else if (rayAngle < HALF_OF_PI || rayAngle > ONE_AND_A_HALF_OF_PI) {
      rayX = playerPosition.x - playerPosition.x % MAP_DATA.cellSize + MAP_DATA.cellSize;
      rayY = (playerPosition.x - rayX) * negativeTan + playerPosition.y;
      xOffset = MAP_DATA.cellSize;
      yOffset = -xOffset*negativeTan;
    }
    // Looking straight up or down
    else {
      rayX = playerPosition.x;
      rayY = playerPosition.y;
      depthOfField = MAX_DEPTH_OF_FIELD;
    }

    while (depthOfField < MAX_DEPTH_OF_FIELD) {
      if (getMapCellValueForCoordinate(rayX, rayY) === 1) {
        // Hit wall
        depthOfField = MAX_DEPTH_OF_FIELD;
        verticalRayX = rayX;
        verticalRayY = rayY;
        distanceToHitVertical = getPlayerDistanceToPoint(rayX, rayY);
      }
      else {
        rayX += xOffset;
        rayY += yOffset;
        depthOfField += 1;
      }
    }

    // ---- Check horizontal lines ---- //
    const inverseTan = -1/Math.tan(rayAngle);
    let distanceToHitHorizontal = 100000;
    let horizontalRayX = 0;
    let horizontalRayY = 0;
    depthOfField = 0;

    // Looking up
    if (rayAngle > Math.PI) {
      rayY = playerPosition.y - playerPosition.y % MAP_DATA.cellSize - 0.0001;
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
      if (getMapCellValueForCoordinate(rayX, rayY) === 1) {
          horizontalRayX = rayX;
          horizontalRayY = rayY;
          distanceToHitHorizontal = getPlayerDistanceToPoint(rayX, rayY);
        // Hit wall
        depthOfField = MAX_DEPTH_OF_FIELD;
      }
      else {
        rayX += xOffset;
        rayY += yOffset;
        depthOfField += 1;
      }
    }

    let shortestDistanceToHit: number;

    if (distanceToHitHorizontal < distanceToHitVertical) {
      rayX = horizontalRayX;
      rayY = horizontalRayY;
      shortestDistanceToHit = distanceToHitHorizontal
      color = 'hsl(205 100% 40%)';
    } else {
      rayX = verticalRayX;
      rayY = verticalRayY;
      shortestDistanceToHit = distanceToHitVertical
      color = 'hsl(205 100% 35%)';
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playerPosition.x, playerPosition.y);
    ctx.lineTo(rayX, rayY);
    ctx.stroke();

    // Draw 3d walls
    let angleDifference = playerPosition.angle - rayAngle;
    if (angleDifference<0) angleDifference += 2*Math.PI;
    if (angleDifference>2*Math.PI) angleDifference -= 2*Math.PI;
    shortestDistanceToHit = shortestDistanceToHit*Math.cos(angleDifference);

    let lineHeight = (MAP_DATA.cellSize*CANVAS_HEIGHT) / shortestDistanceToHit;
    if (lineHeight > CANVAS_HEIGHT) lineHeight = CANVAS_HEIGHT;
    const topLeftPointX = CANVAS_WIDTH / 2 + rayScreenWidth*r;
    const topLeftPointY = CANVAS_HEIGHT / 2 - lineHeight/2;

    ctx.fillStyle = color;
    ctx.fillRect(
      topLeftPointX,
      topLeftPointY,
      rayScreenWidth + 1, // Add 1px to reduce empty space between rects
      lineHeight
    );

    rayAngle += ONE_DEGREE_IN_RADIANS*(fovSlider.value / numberOfRaysSlider.value);
    if (rayAngle<0) rayAngle += 2*Math.PI;
    if (rayAngle>2*Math.PI) rayAngle -= 2*Math.PI;
  }
}

function display() {
  clearScreen();
  checkForMapCellHoveredByMouse();
  setCursorType();
  drawSkybox();
  drawMap2d();
  drawRays();
  checkForPressedKeys();
  drawPlayer();
  drawHoveredMapCellHighlight();
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
