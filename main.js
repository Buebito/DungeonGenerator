var canvas, ctx;
var mapa = [];
var puntosMapa = [];
var finalBoss = null;

// Las cambiamos a variables para que se puedan modificar por el user
var block_size = 40;
var canvas_size = 18;

// Posición de aparición del jugador: siempre en el centro del dungeon
var posAparicion = { x: canvas_size / 2, y: canvas_size / 2};

//-----------------------------------------------------------------------------------------------
// Carga la imagen del suelo antes de iniciar la generación del mapa
var imagenesCargadas = 0;
var totalImagenes = 7; // Actualiza este número con el total de imágenes a cargar

var imgSuelo = new Image();
imgSuelo.src = 'floor.png';

var imgSpawn = new Image();
imgSpawn.src = 'warrior.gif';

var imgFinalBoss = new Image();
imgFinalBoss.src = 'eye.gif';

var imgGoblin = new Image();
imgGoblin.src = 'goblin.gif';

var imgChest = new Image();
imgChest.src = 'chest.gif';

var imgWall = new Image();
imgWall.src = 'wall.png';

var imgHeart = new Image();
imgHeart.src = 'heart.gif'

imgSuelo.onload = imagenCargada;
imgSpawn.onload = imagenCargada;
imgFinalBoss.onload = imagenCargada;
imgGoblin.onload = imagenCargada;
imgChest.onload = imagenCargada;
imgWall.onload = imagenCargada;
imgHeart.onload = imagenCargada;

function imagenCargada() {
  imagenesCargadas++;
  if (imagenesCargadas === totalImagenes) {
      caminataAleatoria_DungGen();
  }
}

let dibujarPunto = (x, y) => {
  // Usamos drawImage en lugar de fillRect
  ctx.drawImage(imgSuelo, block_size * x, block_size * y, block_size, block_size);
};
//-----------------------------------------------------------------------------------------------

// Dibuja elementos como el punto de aparición, el jefe final, cofres o goblins
let dibujarElemento = (elementoMapa, x, y) => {
  switch (elementoMapa) {
    case "spawn":
      ctx.drawImage(imgSpawn, block_size * x, block_size * y, block_size, block_size);
      break;
    case "FinalBoss":
      ctx.drawImage(imgFinalBoss, block_size * x, block_size * y, block_size, block_size);
      break;
    case "chest":
      ctx.drawImage(imgChest, block_size * x, block_size * y, block_size, block_size);
      break;
    case "goblin":
      ctx.drawImage(imgGoblin, block_size * x, block_size * y, block_size, block_size);
      break;
    case "heart":
      ctx.drawImage(imgHeart, block_size * x, block_size * y, block_size, block_size);
      break;
  }
};

// Calcula la distancia euclidiana entre dos puntos para gestionar la proximidad de enemigos o cofres
let norma_euclidiana = (pos1, pos2) => {
  let v = {
    x: Math.abs(pos2.x - pos1.x),
    y: Math.abs(pos2.y - pos1.y),
  };
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

// Retorna la siguiente posición basada en la dirección proporcionada
function siguientePaso(pos, dir) {
  switch (dir) {
    case 3:
      return { x: pos.x - 1, y: pos.y };
    case 2:
      return { x: pos.x, y: pos.y + 1 };
    case 1:
      return { x: pos.x + 1, y: pos.y };
    default:
    case 0:
      return { x: pos.x, y: pos.y - 1 };
  }
}

// Verifica si el próximo paso es válido, dentro de los límites del mapa y no sobre otro camino
function validacionPaso(next_pos) {
  let verificacionLimites =
    next_pos.x > 0 && next_pos.x < canvas_size && next_pos.y > 0 && next_pos.y < canvas_size;
  let chequeoMapa = false;
  if (verificacionLimites) {
    chequeoMapa = mapa[next_pos.y][next_pos.x] == false;
  }
  return verificacionLimites && chequeoMapa;
}

// Realiza la caminata aleatoria para generar caminos en el mapa
function pasoAleatorio(posInicial, pasos) {
  let pos = posInicial;
  let proxPos = null;
  let direccionesDisponibles = [0, 1, 2, 3]; // Norte, Este, Sur, Oeste

  for (let paso = 0; paso < pasos; paso++) {
    let direccionesValidas = direccionesDisponibles.filter(dir => validacionPaso(siguientePaso(pos, dir)));
    if (direccionesValidas.length > 0) {
      let dir = direccionesValidas[Math.floor(Math.random() * direccionesValidas.length)];
      proxPos = siguientePaso(pos, dir);
      pos = proxPos;
      mapa[pos.y][pos.x] = true;
      puntosMapa.push(pos);
      dibujarPunto(pos.x, pos.y);
    } else {
      break; // Termina si no hay direcciones válidas
    }
  }
}

// Función principal para iniciar la generación del mapa
function caminataAleatoria_DungGen() {
  dibujarPunto(posAparicion.x, posAparicion.y);
  dibujarElemento("spawn", posAparicion.x, posAparicion.y);
  mapa[posAparicion.y][posAparicion.x] = true;

  pasoAleatorio(posAparicion, 100);

  finalBoss = puntosMapa.pop();
  dibujarElemento("FinalBoss", finalBoss.x, finalBoss.y);

  if (Math.random() > 0.7) {
    const ramificaciones = Math.round(Math.random() * canvas_size);
    const longitudRama = Math.round(Math.random() * canvas_size);
    for (let indice = 0; indice < ramificaciones; indice++) {
      var puntoInicioRama =
        puntosMapa[Math.round(Math.random() * (puntosMapa.length - 1))];
      pasoAleatorio(puntoInicioRama, longitudRama);
    }
  }

  colocarGoblins(10);
  colocarCofresEnExtremos();
  colocarCorazones(3);
}

// Coloca cofres en puntos terminales de los caminos
function colocarCofresEnExtremos() {
  for (let y = 1; y < canvas_size-1; y++) {
    for (let x = 1; x < canvas_size-1; x++) {
      if (mapa[y][x] && x != posAparicion.x && y != posAparicion.y && x != finalBoss.x && y != finalBoss.y) {
        if (!mapa[y - 1][x] && !mapa[y + 1][x]) {
          if (!mapa[y][x - 1] && mapa[y][x + 1]) {
            dibujarElemento("chest", x, y);
          } else if (mapa[y][x - 1] && !mapa[y][x + 1]) {
            dibujarElemento("chest", x, y);
          }
        }
        if (!mapa[y][x - 1] && !mapa[y][x + 1]) {
          if (!mapa[y - 1][x] && mapa[y + 1][x]) {
            dibujarElemento("chest", x, y);
          } else if (mapa[y - 1][x] && !mapa[y + 1][x]) {
            dibujarElemento("chest", x, y);
          }
        }
      }
    }
  }
}

// Coloca goblins en el mapa, asegurando que no estén demasiado cerca del punto de aparición
function colocarGoblins(numero) {
  for (let indice = 0; indice < numero; indice++) {
    let intentos = 10;
    do {
      var posGoblin =
        puntosMapa[Math.round(Math.random() * (puntosMapa.length - 1))];
      intentos--;
    } while (norma_euclidiana(posAparicion, posGoblin) < 5 && intentos > 0);

    if (intentos > 0) dibujarElemento("goblin", posGoblin.x, posGoblin.y);
  }
}

// Coloca un número especificado de cofres en el mapa
function colocarCorazones(numero) {
  for (let indice = 0; indice < numero; indice++) {
    var posCofre =
      puntosMapa[Math.round(Math.random() * (puntosMapa.length - 1))];
    dibujarElemento("heart", posCofre.x, posCofre.y);
  }
}
function nuevoDungeon() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  mapa = Array(canvas_size).fill().map(() => Array(canvas_size).fill(false));
  puntosMapa = [];
  finalBoss = null;
  caminataAleatoria_DungGen();
}

function aplicarCambios() {
  // Obtiene los nuevos valores
  const nuevoBlockSize = parseInt(document.getElementById('blockSizeInput').value);
  const nuevoCanvasSize = parseInt(document.getElementById('canvasSizeInput').value);

  // Verifica si son diferentes y válidos antes de aplicarlos
  if (!isNaN(nuevoBlockSize) && !isNaN(nuevoCanvasSize) && nuevoBlockSize > 0 && nuevoCanvasSize > 0) {
    block_size = nuevoBlockSize;
    canvas_size = nuevoCanvasSize;
    canvas.width = canvas_size * block_size;
    canvas.height = canvas_size * block_size;
    nuevoDungeon(); // Regenera el dungeon con los nuevos valores
  } else {
    alert('Por favor ingrese valores válidos.');
  }
}

document.addEventListener("DOMContentLoaded", function () {
  canvas = document.getElementById("canvas");
  canvas.width = canvas_size * block_size; 
  canvas.height = canvas_size * block_size; 

  ctx = canvas.getContext("2d");
  ctx.fillStyle = "#222035";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  mapa = Array(canvas_size).fill().map(() => Array(canvas_size).fill(false));
  document.getElementById('newDungeon').addEventListener('click', nuevoDungeon);
  document.getElementById('applyChanges').addEventListener('click', aplicarCambios);
});

  