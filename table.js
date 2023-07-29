"use strict";
const BLACK = 1;
const WHITE = 2;
let coor =[];//盤面を管理するリスト（二次元）1なら黒、２なら白
let myturn = 1;//0なら黒、1なら白

//htmlファイルが読み込みられたら最初に動く関数
function init(){
    let b = document.getElementById("board");//board要素取得
    for(let i = 0; i < 8 ; i++){
        let tr =document.createElement("tr");
        coor[i] = [0,0,0,0,0,0,0,0];//一行ずつ初期化
        for(let j = 0 ; j < 8; j++){
            coor[i][j] = 0;
            let td =document.createElement("td");
            td.className = "block";
            td.id = "block" + i + j;//セルにIDづけ
            td.onclick = clicked;
            tr.appendChild(td);//trにtdを追加
        }
        b.appendChild(tr);
    }

    let turn= document.getElementById('hyouki');
    turn.innerHTML = '黒のターン';

    //初期盤面生成
    put(3,3,BLACK);
    put(4,4,BLACK);
    put(3,4,WHITE);
    put(4,3,WHITE);
    update();
}

function update(){//クリックされるたびに呼び出される関数
    //置ける場所の更新
    for(let i = 0; i < 8;i++){
        for(let j = 0 ; j <8;j++)
        {
            let color_myturn;
            if(myturn == 1){
                color_myturn =BLACK;
            }else if(myturn == 0){
                color_myturn = WHITE;
            }
            let num = getFlipBlocks(i,j,color_myturn);//置いた時にひっくり返るコマ数
            let c = document.getElementById("block" + i + j);
            if(coor[i][j] == 0 ){//コマが置いていなければ
                if(num.length > 0){ //一枚以上コマがひっくり返るなら
                    c.textContent = "+";
                    c.className =  ("block_canput");
                }else{//それ以外はもとのblockに戻す
                    c.textContent = "";
                    c.className =  ("block");
                }
            }
        }
    }
    countcell();
    pass();
    conclusion();
}

    //クリックしたときに動く関数
function clicked(e){
    let id = e.target.id;//クリックした要素のidを取得
    //idに含まれているi,jを取得（id =blockij になってるから4番目と5番目を取り出す）
    let i = parseInt(id.charAt(5));
    let j = parseInt(id.charAt(6));

    //用意したdivのidを読み取る。//
    let turn= document.getElementById('hyouki');

    if(myturn == 0){//黒のターンなら
        let flipped = getFlipBlocks(i,j,BLACK);//ひっくり返す番号を取得（二次元配列で返って来る　例: [[2,3],[2,4],[2,5]]）
        console.table("flipped : " +flipped);
        //flippedに入っている配列に従ってput関数を使ってコマをおいていく
        if(flipped.length > 0){
            for(let k = 0 ; k < flipped.length; k++){
                put(flipped[k][0], flipped[k][1],BLACK);
            }
            put(i,j,BLACK);//クリックした場所にも忘れずにコマを置く
            turn.innerHTML = '白のターン';
        }else {//ひっくり返すコマがないときはそのまま返す
            showMessage("置けない場所です。");
            return;
        }
        
    }else if(myturn == 1){//白のターンなら
        let flipped = getFlipBlocks(i,j,WHITE);//ひっくり返す番号を取得（二次元配列で返って来る　例: [[2,3],[2,4],[2,5]]）
        console.table("flipped : " +flipped);
        //flippedに入っている配列に従ってput関数を使ってコマをおいていく
        if(flipped.length > 0){
            for(let k = 0 ; k < flipped.length; k++){
                put(flipped[k][0], flipped[k][1],WHITE);
            }
            put(i,j,WHITE); //クリックした場所にも忘れずにコマを置く
            turn.innerHTML = '黒のターン';
        }else {//ひっくり返すコマがないときはそのまま返す
            showMessage("置けない場所です。");
            return;
        }
        
    }
    update();//処理が終わるとupdate関数を呼ぶ
}

//１方向でどのコマがひっくり返るかを調べる
function getFlipCellsOneDir(i,j,dx,dy,color){
    //調べ始める最初の座標
    let x = i + dx;
    let y = j + dy;

    let flipped = [];

    //もし調べ始めるコマが（盤面外）か（同じ色）か（何も置いていない）なら空リストで返す
    if(
        x<0||
        y<0||
        x>7||
        y>7||
        coor[x][y] == color||
        coor[x][y] == 0
    ){
        return [];
    }

    //pushでresultに[x,y]を追加
    flipped.push([x,y]);


    while(true){//自分と同じ色が来るまで調べ続ける
        //１つずつ方向に沿って調べていく
        x += dx;
        y += dy;

        //盤面外に出れば空リストで返す
        if(x < 0 || y < 0 || x > 7||y > 7|| coor[x][y] == 0){
            return[];
        }//透明か盤面外か
        
        //同じ色が来たらflippedを返して終了
        if(coor[x][y] == color){
            return flipped;
        }//自分と同じ色か
        else{//もし違う色ならpushでresultに[x,y]を追加して、続行
            flipped.push([x,y]);
        }//自分と違う色の時
    }
}

//挟めるかを全方向（８方向）調べる関数（座標の二次元配列で返す）
function getFlipBlocks(i,j,color){
    //もしコマを置こうとしている場所にコマがおいていたら、空で返す
    if(coor[i][j] == BLACK || coor[i][j] == WHITE){
        return[];
    }

    //8方向のリスト
    let dirs= [
        [-1,-1],
        [0,-1],
        [1,-1],
        [-1,0],
        [0,0],
        [1,0],
        [-1,1],
        [0,1],
        [1,1],
    ];

    let result = [];
    //1方向ごとに挟めるかを調べていって配列に格納していく
    for(let p = 0 ; p < dirs.length;p++){
        //getFlipCellsOneDirで１方向でどのコマがひっくり返るかを調べてもらう
        let flipped = getFlipCellsOneDir(i,j,dirs[p][0],dirs[p][1],color);
        result = result.concat(flipped);//concatで配列を繋げる
    }
    console.table(result);
    return result;
}


//コマを置く関数
function put(i,j,color){
    let c = document.getElementById("block" + i + j);//ij番目のコマを取得
    c.textContent = "";
    if(myturn == 0){
        //クラス名を　color == BLACK　なら　black それ以外なら whiteにする
        c.className =  (color == BLACK ? "black" : "white");
    }else if(myturn == 1){
        //クラス名を　color == WHITE　なら　white それ以外なら blackにする
        c.className =  (color == WHITE ? "white" : "black");
    }
    coor[i][j] = color; //coorにも書き込んでおく
}

//置ける場所があるか確認
function canFlip(color){
    for(let x = 0; x < 8; x++){
        for(let y = 0 ; y < 8;y++){//二重ループで全盤面確認
            let flipped = getFlipBlocks(x,y, color);//指定したコマで何個ひっくり返すか
            //もし一つでもひっくり返せれるならreturnして関数を終了
            if(flipped.length > 0){
                return true;
            }
        }
    }
    return false;
}

//メッセージを出す関数
function showMessage(str){
    document.getElementById("messeage").textContent = str;
    setTimeout(function(){
        document.getElementById("messeage").textContent = "";
    },1000);
}






//updaten内に入れる。↓

//白と黒のコマ数をカウント
function countcell(){
let numWhite = 0;
let numBlack = 0;
for(let x = 0; x < 8; x++){
    for(let y = 0 ; y < 8;y++){
        if(coor[x][y] == WHITE){
            numWhite++;
        }
        if(coor[x][y] == BLACK){
            numBlack++;
        }
    }
}
//htmlの白と黒のコマ数の表示の更新
document.getElementById("numBlack").textContent =numBlack;
document.getElementById("numWhite").textContent =numWhite;
}

function pass(){
//canFlipで全盤面をみて置ける場所があるかを確認
let blackFlip = canFlip(BLACK);
let whiteFlip = canFlip(WHITE);

//パスの処理
if(!blackFlip){
    showMessage("黒スキップ");
    myturn = 1;
}else if(!whiteFlip){
     showMessage("白スキップ");
    myturn = 0;
}else{
    myturn = 1 - myturn;//パスがないならターンを変える
}
}


function conclusion(){
if(numWhite + numBlack == 64 || (!blackFlip && !whiteFlip)){//(コマ数の合計が64個)or(黒と白の両方置けなくなるなら)ならば
    //結果出力
    if(numWhite > numBlack){
        document.getElementById("messeage").textContent =  "白の勝ち";
    }else if(numWhite < numBlack){
        document.getElementById("messeage").textContent =  "黒の勝ち";
    }else{
        document.getElementById("messeage").textContent =  "引き分け";
    }       
}
}
