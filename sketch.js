//Scent Match
//Real scents will be held infront of user and they will pick a card that best represent the memory that scent brings back

//Color palette
const COLORS = {
  bg:        [24, 29, 45],      // background
  title:     [255, 255, 255],   // main text
  muted:     [214, 220, 232],   // hints and secondary text
  accent:    [255, 214, 102],   // scent name and highlights
  cardText:  [20, 20, 20],      // text on cards
  outline:   [255, 255, 255],   // hover and match glow
};

//Fills the window with the canvas and scales content to fit
const DESIGN_W = 800;
const DESIGN_H = 600;
let viewScale = 1;
let viewX = 0;
let viewY = 0;

function updateView() {
  viewScale = min(width / DESIGN_W, height / DESIGN_H);
  viewX = (width - DESIGN_W * viewScale) / 2;
  viewY = (height - DESIGN_H * viewScale) / 2;
}

//State machine
let state = "start";
let currentScent = 0;   //Which scent we are on
let picks = [];         //The card index the user picked for each scent

//Date
//Placeholder for now, will add images later
const cards = [
  { label: "Morning kitchen", col: [244, 196, 140] },
  { label: "Bakery",          col: [248, 226, 170] },
  { label: "Garden",          col: [168, 214, 181] },
  { label: "Sunny porch",     col: [250, 226, 120] },
  { label: "Forest walk",     col: [140, 204, 166] },
  { label: "Holiday table",   col: [244, 170, 163] },
];

//The "expected" cards for each scent
const scents = [
  { name: "Coffee",   cardId: 0, note: "A slow morning in the kitchen." },
  { name: "Vanilla",  cardId: 1, note: "Something sweet baking nearby." },
  { name: "Lavender", cardId: 2, note: "A quiet afternoon in the garden." },
  { name: "Citrus",   cardId: 3, note: "Sunshine and a glass of lemonade." },
  { name: "Pine",     cardId: 4, note: "A walk among tall trees." },
  { name: "Cinnamon", cardId: 5, note: "A table full of family." },
];

//Grid layout for cards
const CARD_W = 150;
const CARD_H = 150;
const GAP = 30;
const COLS = 3;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Georgia");
  updateView();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateView();
}

function draw() {
  background(COLORS.bg);

  push();
  translate(viewX, viewY);
  scale(viewScale);

  if (state === "start") {
    drawStart();
  } else if (state === "prompt") {
    drawPrompt();
  } else if (state === "choose") {
    drawChoose();
  } else if (state === "reveal") {
    drawReveal();
  } else if (state === "summary") {
    drawSummary();
  }

  pop();
}

//Custome function to draw a card with a label and optional highlight
function drawCard(x, y, w, h, col, label, highlight) {
  push();
  if (highlight) {
    stroke(COLORS.outline);
    strokeWeight(6);
  } else {
    stroke(255, 255, 255, 90);
    strokeWeight(1.5);
  }
  fill(col);
  rect(x, y, w, h, 12);

  noStroke();
  fill(COLORS.cardText);
  textAlign(CENTER, CENTER);
  textSize(constrain(w * 0.11, 11, 22));
  text(label, x + 8, y + 8, w - 16, h - 16);
  pop();
}

//Makes text centered and at a given height
function drawCenteredText(str, y, size, col) {
  push();
  noStroke();
  fill(col);
  textAlign(CENTER, CENTER);
  textSize(size);
  text(str, DESIGN_W / 2, y);
  pop();
}

//Returns the top-left corner of card number i in the 3x2 grid.
function cardPosition(i) {
  let gridW = COLS * CARD_W + (COLS - 1) * GAP;
  let startX = (DESIGN_W - gridW) / 2;
  let startY = 170;
  let col = i % COLS;
  let row = floor(i / COLS);
  return {
    x: startX + col * (CARD_W + GAP),
    y: startY + row * (CARD_H + GAP),
  };
}

//True if point is inside the rectangle.
function isInside(px, py, x, y, w, h) {
  return px > x && px < x + w && py > y && py < y + h;
}

//Returns which card the mouse is over, or -1 if none.
function hoveredCard() {
  let mx = (mouseX - viewX) / viewScale;
  let my = (mouseY - viewY) / viewScale;
  for (let i = 0; i < cards.length; i++) {
    let p = cardPosition(i);
    if (isInside(mx, my, p.x, p.y, CARD_W, CARD_H)) {
      return i;
    }
  }
  return -1;
}

//Screens
function drawStart() {
  drawCenteredText("Scent Match", 190, 56, COLORS.title);
  drawCenteredText("Smell a scent. Pick the memory it brings back.", 250, 20, COLORS.muted);

  //Three small decorative cards
  drawCard(250, 310, 90, 90, cards[0].col, "", false);
  drawCard(355, 310, 90, 90, cards[2].col, "", false);
  drawCard(460, 310, 90, 90, cards[5].col, "", false);

  drawCenteredText("Click to begin", 480, 22, COLORS.title);
}

function drawPrompt() {
  let s = scents[currentScent];
  drawCenteredText("Scent " + (currentScent + 1) + " of " + scents.length, 120, 24, COLORS.muted);
  drawCenteredText("Hold the jar of", 220, 28, COLORS.title);
  drawCenteredText(s.name, 290, 64, COLORS.accent);
  drawCenteredText("near and let it be smelled.", 360, 28, COLORS.title);
  drawCenteredText("Press SPACE when ready", 500, 20, COLORS.muted);
}

function drawChoose() {
  drawCenteredText("Which memory fits this scent?", 80, 30, COLORS.title);
  drawCenteredText("There are no wrong answers.", 120, 18, COLORS.muted);

  let hover = hoveredCard();
  for (let i = 0; i < cards.length; i++) {
    let p = cardPosition(i);
    drawCard(p.x, p.y, CARD_W, CARD_H, cards[i].col, cards[i].label, i === hover);
  }
}

function drawReveal() {
  let s = scents[currentScent];
  let picked = picks[currentScent];
  let isExpected = picked === s.cardId;

  drawCenteredText(s.name, 70, 30, COLORS.accent);

  //Big version of the picked card and glows if it was the expected one
  drawCard(DESIGN_W / 2 - 110, 110, 220, 220, cards[picked].col, cards[picked].label, isExpected);

  if (isExpected) {
    drawCenteredText(s.note, 390, 24, COLORS.title);
    drawCenteredText("That scent and memory go together.", 430, 18, COLORS.muted);
  } else {
    drawCenteredText("What a lovely connection.", 390, 24, COLORS.title);
    drawCenteredText("Scents can bring back different memories for everyone.", 430, 18, COLORS.muted);
  }

  drawCenteredText("Click or press SPACE to continue", 540, 18, COLORS.muted);
}

function drawSummary() {
  drawCenteredText("Your memories", 100, 40, COLORS.title);

  //One small card per scent
  let w = 100;
  let gap = 20;
  let startX = (DESIGN_W - (scents.length * w + (scents.length - 1) * gap)) / 2;
  for (let i = 0; i < scents.length; i++) {
    let x = startX + i * (w + gap);
    drawCard(x, 230, w, w, cards[picks[i]].col, cards[picks[i]].label, false);
    drawCenteredTextAt(scents[i].name, x + w / 2, 360, 16, COLORS.muted);
  }

  drawCenteredText("Click to start over", 500, 20, COLORS.title);
}

//Same idea as drawCenteredText, but centered on a given x (for labels under cards).
function drawCenteredTextAt(str, x, y, size, col) {
  push();
  noStroke();
  fill(col);
  textAlign(CENTER, CENTER);
  textSize(size);
  text(str, x, y);
  pop();
}

//Input
function mousePressed() {
  if (state === "start") {
    state = "prompt";
  } else if (state === "choose") {
    let i = hoveredCard();
    if (i !== -1) {
      picks[currentScent] = i;
      state = "reveal";
    }
  } else if (state === "reveal") {
    nextScent();
  } else if (state === "summary") {
    restart();
  }
}

function keyPressed() {
  if (key === " ") {
    if (state === "prompt") {
      state = "choose";
    } else if (state === "reveal") {
      nextScent();
    }
    return false; //stops the page from scrolling on SPACE
  }
}

//Flow helpers
function nextScent() {
  currentScent++;
  if (currentScent >= scents.length) {
    state = "summary";
  } else {
    state = "prompt";
  }
}

function restart() {
  currentScent = 0;
  picks = [];
  state = "start";
}