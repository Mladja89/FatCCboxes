/*eslint-disable */ // Tek naknadno sam uocio da ovaj lint zahteva react, nakon sto sam vec napisao app
import { fabric } from "fabric";
import drawRect from "./components/Draw";
import "./App.scss";
import { cloneDeep } from "lodash-es";

const canvas = (window.canvas = new fabric.Canvas("box-canvas", {}));

canvas.setDimensions({
  width: 800 || window.innerHeight,
  height: 800 || window.innerHeight
});
canvas.hoverCursor = "pointer";
fabric.Object.prototype.objectCaching = false;

const GRID_SIZE = 100;
const headerButtons = document.querySelectorAll("header button");
const loadingLine = document.querySelector(
  ".totally-fake-animation-loading-line"
);
const loadbar = document.querySelector(".load-bar");
const pressed = [];
const superSecretCode =
  "abthgiRworrAtfeLworrAthgiRworrAtfeLworrAnwoDworrAnwoDworrApUworrApUworrA";
const msg = "U3RvcCBwbGF5aW5nIGdhbWVzLCBJIG5lZWQgYSBqb2IhIDopIC0gTWxhZGph";
const gameState = {
  selected: false,
  choosed: false,
  gameStarted: false,
  undoState: null,
  resetState: null,
  numOfSelectable: []
};
const selectableMap = [
  [-3, 0],
  [0, 3],
  [3, 0],
  [0, -3],
  [2, 2],
  [-2, -2],
  [2, -2],
  [-2, 2]
];

let gridArray = [];
let gridArrayCache = [];

headerButtons.forEach(btn => {
  if (btn.innerHTML === "Start") {
    btn.addEventListener("click", btnDo => {
      gameState.gameStarted = true;
      btnDo.target.disabled = true;
      loadbar.classList.add("loadanim");
      setTimeout(() => {
        initGrid();
        loadbar.classList.remove("loadanim");
        loadingLine.style.display = "none";
      }, 1700);
    });
  } else if (btn.innerHTML === "Undo") {
    gameState.undoState = btn;
    btn.addEventListener("click", btnDo => {
      undo();
    });
  } else {
    gameState.resetState = btn;
    btn.addEventListener("click", btnDo => {
      btnDo.target.disabled = true;
      gameState.undoState.disabled = true;
      gameState.selected = false;
      gameState.choosed = false;
      initGrid();
    });
  }
});

window.inGrid = function() {
  console.log(gridArray);
  console.log(gridArrayCache);
};

function generateGrid() {
  const grid = [];
  const rows = [...new Array(Math.sqrt(GRID_SIZE))];

  rows.forEach((row, index) => {
    const innerRow = [];
    for (let i = 0; i < rows.length; i++) {
      const position = {
        x: (canvas.width / rows.length) * i,
        y: (canvas.height / rows.length) * index
      };
      const rectIndex = {
        x: index,
        y: i
      };
      innerRow.push(drawRect({ position, rectIndex, rows }));
    }

    grid.push(innerRow);
  });
  return grid;
}

const select = e => {
  if (
    gameState.selected ||
    (e.target._rectState.isSelected && !e.target._rectState.selectable)
  ) {
    return;
  } // prevents other rects to be selected
  const { x, y } = e.target._rectState.position;
  gameState.selected = true;

  gridArray.forEach((row, columnIndex) => {
    row.forEach((order, rowIndex) => {
      if (
        !order._rectState.isSelected &&
        x === order._rectState.position.x &&
        y === order._rectState.position.y
      ) {
        order._rectState.isSelected = true;
        order.set("fill", "#093d65");
      }
      for (let i = 0; i < selectableMap.length; i++) {
        const mapX = selectableMap[i][0];
        const mapY = selectableMap[i][1];
        if (
          !order._rectState.isSelected &&
          order._rectState.position.x === x + mapX &&
          order._rectState.position.y === y + mapY
        ) {
          order._rectState.selectable = true;
          order.set("fill", "#c7e0f4");
        }
      }
    });
  });
  gameState.resetState.disabled = false;
  canvas.renderAll();
};

const chooseRect = e => {
  if (e.target._rectState.isSelected || !e.target._rectState.selectable) return;

  // make a copy of main gridArray
  gameState.numOfSelectable.splice(0);
  gridArrayCache.splice(0);
  gridArrayCache = cloneDeep(gridArray, true);

  const { x, y } = e.target._rectState.position;
  gridArray.forEach((row, columnIndex) => {
    row.forEach((order, rowIndex) => {
      if (
        order._rectState.selectable === true &&
        x === order._rectState.position.x &&
        y === order._rectState.position.y
      ) {
        order._rectState.isSelected = true;
        order.set("fill", "#093d65");
      } else if (!order._rectState.isSelected) {
        order._rectState.selectable = false;
        order.set("fill", "#004578");
      }
      for (let i = 0; i < selectableMap.length; i++) {
        const mapX = selectableMap[i][0];
        const mapY = selectableMap[i][1];
        if (
          !order._rectState.isSelected &&
          order._rectState.position.x === x + mapX &&
          order._rectState.position.y === y + mapY
        ) {
          order._rectState.selectable = true;
          order.set("fill", "#c7e0f4");
        }
      }
      if (order.fill === "#c7e0f4") {
        gameState.numOfSelectable.push(order);
      }
    });
  });

  gameState.undoState.disabled = false;
  if (gameState.numOfSelectable.length === 0) {
    gameOver();
  }
  canvas.renderAll();
};

let gameOver = () => {
  console.warn("GAME OVEEEEEEEER");
  document.querySelector(".main-wrapper").innerHTML = "<span>GAME OVER</span>";
  setTimeout(() => location.reload(), 3000);
};

function undo() {
  canvas.clear();
  gridArray.splice(0);
  gridArray = cloneDeep(gridArrayCache, true);

  draw();
  canvas.renderAll();
  gameState.undoState.disabled = true;
}

function draw() {
  gridArray.map(row => {
    row.map(rect => {
      canvas.add(rect);
    });
  });
  canvas.renderAll();
}

const initGrid = () => {
  canvas.clear();
  gridArray = generateGrid();
  draw();
  gameState.gameStarted = true;

  // init events
  const click = e => {
    if (!gameState.selected) {
      select(e);
    } else {
      chooseRect(e);
    }
  };
  canvas.on("mouse:down", e => click(e));
  window.addEventListener("keyup", e => {
    const esrever = r =>
      r
        .split("")
        .reverse()
        .join("");
    pressed.push(e.key);
    pressed.splice(
      -superSecretCode.length - 1,
      pressed.length - superSecretCode.length
    );
    if (pressed.join("").includes(esrever(superSecretCode))) {
      document.querySelector(".main-wrapper").innerHTML = `<span>${atob(
        msg
      )}</span>`;
    }
  });
};
