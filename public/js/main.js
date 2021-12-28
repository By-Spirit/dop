const userGrid = document.querySelector('.grid-user');
const enemyGrid = document.querySelector('.grid-enemy');
const socket = io();

var delta = 0;
var isReady = false;
var enemyReady = false;
var gameStart = false;
var shipCount = 20;

const width = 10
const userSquares = []
const enemySquares = []

var userField = [];
var enemyField = [];
var userShips = [];

var yourTurn = false;

const fieldContent = {EMPTY:'0', SHIP:'1', SHOT:'2', DEADSHIP:'3'};

createBoard(userGrid, userSquares);
createBoard(enemyGrid, enemySquares);

const shipsList = [new Ship(0, 0, 4, 0), 
    new Ship(0, 0, 3, 0), new Ship(0, 0, 3, 0),
    new Ship(0, 0, 2, 0), new Ship(0, 0, 2, 0), new Ship(0, 0, 2, 0),
    new Ship(0, 0, 1, 0), new Ship(0, 0, 1, 0), new Ship(0, 0, 1, 0), new Ship(0, 0, 1, 0),];

userGrid.addEventListener('wheel', onWheel);
function onWheel(e) {
    delta = e.deltaY > 0 ? 1: 0;
    console.log(delta);
}
userGrid.wheel = function(event) {
    delta = event.deltaY > 0 ? 1: 0;
    console.log(delta);
}
userGrid.onmousedown = function(event) {
    if(event.button === 0 && !gameStart && !isReady) {
        posY = Math.floor((event.clientX - $(".grid-user").offset().left) / 40);
        posX = Math.floor((event.clientY - $(".grid-user").offset().top) / 40);
        ship = shipsList.shift();
        ship.x = posX;
        ship.y = posY;
        ship.dir = delta;
        if(!setShip(ship)) {
            shipsList.unshift(ship);
        }
        else {
            userShips.push(ship);
            if(shipsList.length === 0){
                isReady = true;
                socket.emit('ready');
            } 
        }
        updateField(userGrid, userSquares, userField);
    }
}

enemyGrid.onmousedown = function(event) {
    if(event.button === 0 && gameStart && yourTurn) {
        posY = Math.floor((event.clientX - $(".grid-enemy").offset().left) / 40);
        posX = Math.floor((event.clientY - $(".grid-enemy").offset().top) / 40);
        shot(posX, posY);
        yourTurn = !yourTurn;
        turnIcon();
    }
}

function createBoard(grid, squares) {
    for (let i = 0; i < width*width; i++) {
      var square = document.createElement('div');
      square.id = i;
      grid.appendChild(square);
      squares.push(square);
      userField.push(fieldContent.EMPTY);
      enemyField.push(0);
    }
  }


  function outField(pos, size) { // Проверка на выход коробля за пределы поля
    if(pos + size - 1 < 10) return false;
    return true;
  }

  function setShip(ship){ // dir = 0(horizontal) // dir = 1(vertical)
    if(!ship.checkSetAvailability(userField, ship)){
        return false; // проверка перекрывания нового коробля, старыми
    } 
    if (ship.dir === 0){ //horizontal
        if(!outField(ship.y, ship.size)){//проврека на выход за пределы поля
            for(var i = 0; i < ship.size; i++){
                pos = "" + ship.x + (ship.y+i);
                userField[Number(pos)] = fieldContent.SHIP;
            }
            return true;
        }
        console.log(userField);
        return false;
    }
    else { //vertical
        if(!outField(ship.x, ship.size)){//проврека на выход за пределы поля
            for(var i = 0; i < ship.size; i++){
                pos = "" + (ship.x+i) + ship.y;
                userField[Number(pos)] = fieldContent.SHIP;
            }
            return true;
        }
        console.log(userField);
        return false;
    }
  }

function shot(x, y) {
    var num = ''+x+y;
    socket.emit('shot', Number(num));
}
updateField(userGrid, userSquares, userField);

function updateField(grid, squares, field) {
    grid.innerHTML = "";
    //grid = document.querySelector('.grid-user');
    squares = [];
    for (let i = 0; i < width*width; i++) {
        var square = document.createElement('div');
        square.id = i;
        switch (field[i]){ // Варианты содержимого в ячейке 
            case fieldContent.SHIP:// Корабль
                square.classList.add("ship-grid");
                break;
            case fieldContent.DEADSHIP:// Подбитый корабль
                square.classList.add("dead-ship-grid");
                break;
            case fieldContent.SHOT:// Мимо
                var circle = document.createElement('div');
                circle.classList.add("shot-grid");
                circle.classList.add("shot-wide");
                square.appendChild(circle);
                break;
        }
        grid.appendChild(square);
        squares.push(square);
      }
}

function getStartPos(pos, field) {
    if (field[Number(pos-1)] !== fieldContent.EMPTY && field[Number(pos-1)] !== fieldContent.SHOT && field[Number(pos-1)] !== undefined) {
        pos=pos-1;
        return getStartPos(pos, field);
    }
    else if (field[Number(pos-10)] !== fieldContent.EMPTY && field[Number(pos-10)] !== fieldContent.SHOT && field[Number(pos-10)] !== undefined) {
        pos=pos-10;
        return getStartPos(pos, field);
    }
    return userShips.find(ship => Number("" + ship.x + ship.y) === pos);
}

function setMark (ship, field) {
    if(ship.dir === 0) {
        for(var i = ship.x-1; i < ship.x+2; i++){
            for(var j = ship.y-1; j < ship.y+ship.size+1; j++){
                field[Number("" + i + j)] = fieldContent.SHOT;
            }
        }
        for(var i = 0; i < ship.size; i++) {
            field[Number("" + ship.x + (ship.y + i))] = fieldContent.DEADSHIP;
        }
    }
    else {
        for(var i = ship.x-1; i < ship.x+ship.size+1; i++){
            for(var j = ship.y-1; j < ship.y+2; j++){
                field[Number("" + i + j)] = fieldContent.SHOT;
            }
        }
        for(var i = 0; i < ship.size; i++) {
            field[Number("" + (ship.x + i) + ship.y)] = fieldContent.DEADSHIP;
        }
    }
}

function turnIcon() {
    var turnGrid = document.querySelector('.turn-user');
    if(yourTurn) {
        
        turnGrid.style.transform = 'rotate(180deg)';
    }
    else{
        turnGrid.style.transform = 'rotate(0deg)';
    }
}

// Клиентская часть
//Get username and room
const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
socket.emit('joinRoom', {username, room });

socket.on('shot', (num) =>{ // Выстрел в пользователя 
    var res = userField[num];
    
    if(userField[num] === fieldContent.SHIP){
        userField[num] = fieldContent.DEADSHIP;
        yourTurn = !yourTurn;
        
        var ship = getStartPos(num, userField);
        if (ship.checkDrowned(userField)){
            setMark(ship, userField);
        }
        updateField(userGrid, userSquares, userField);
    }
    else {
        userField[num] = fieldContent.SHOT;
    }
    socket.emit('shotResult', {res, num});
    updateField(userGrid, userSquares, userField);
    yourTurn = !yourTurn;
    turnIcon();
});

socket.on('checkeddrowned', ({num}) => {
    var ship = getStartPos(num, userField);
    console.log(ship);
    var x= ship.x;
    var y = ship.y;
    var size = ship.size;
    var dir = ship.dir;
    if(ship.checkDrowned(userField)){
        socket.emit('mark', {x, y, size, dir});
    }
});

socket.on('mark', ({x, y, size, dir}) => {
    console.log(x, y, size, dir);
    var ship = new Ship(x, y, size, dir);
    setMark(ship, enemyField);
    updateField(enemyGrid, enemySquares, enemyField);
});

socket.on('shotResult', ({res, num}) =>{ 
    if(res === '1'){
        console.log(res);
        enemyField[num] = fieldContent.DEADSHIP;
        shipCount--;
        if(shipCount === 0) {
            alert('You win');
            socket.emit('win');
        }
        socket.emit('checkeddrowned', {num});
        yourTurn = !yourTurn;
        turnIcon();
    }
    else {
        enemyField[num] = fieldContent.SHOT;
    }
    updateField(enemyGrid, enemySquares, enemyField);
});

socket.on('turn', () => {
    yourTurn = true;
    turnIcon();
});

socket.on('win', () => {
    alert('You lose');
});

socket.on('start', () => {
    if(isReady && enemyReady) gameStart = true;
    console.log(gameStart);
});

socket.on('ready', () => {
    enemyReady = true;
});