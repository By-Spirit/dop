class Ship {
    x=0;
    y=0;
    size=1;
    dir=0;

    constructor (x, y, size, dir){
        Object.assign(this, {x, y, size, dir});
    }

    checkSetAvailability(field, ship) {
        if(ship.dir === 0) { // По горизонтали
            for(var i = ship.x-1; i < ship.x+2; i++){
                for(var j = ship.y-1; j < ship.y+ship.size+1; j++){
                    var num = ""+ i + j;
                    if(field[Number(num)] === fieldContent.SHIP) return false;
                }
            }
        }
        else{ // По вертикали
            for(var i = ship.x-1; i < ship.x+ship.size+1; i++){
                for(var j = ship.y-1; j < ship.y+2; j++){
                    var num = ""+ i + j;
                    if(field[Number(num)] === fieldContent.SHIP) return false;
                }
            }
        }
        return true;
    }

    checkDrowned(field) {
        for(var i = 0; i < this.size; i++) {
            if(this.dir === 0) {
                if(field[Number(''+ this.x + (this.y + i))] === fieldContent.SHIP) return false;
            }
            else {
                if(field[Number(''+ (this.x + i) + this.y)] === fieldContent.SHIP) return false;
            }
        }
        return true;
    }
}