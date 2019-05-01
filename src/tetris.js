document.addEventListener('DOMContentLoaded', e=> {
  let allTetromino = [tshape,line,square,jshape,lshape,sshape,zshape]
  let width = 10
  let height = 20
  let classicColors = ['indianred','rosybrown', 'slateblue', 'thistle', 'coral', 'cornflowerblue','lightblue', 'lightpink', 'burlywood' ]
  let waterfrontColors = ['antiquewhite', 'dodgerblue', 'deepskyblue','moccasin', 'powderblue', 'antiquewhite', 'royalblue']
  let moodColors = ['indigo', 'midnightblue', 'darkblue', 'darkslateblue', 'navy', 'steelblue', 'rebeccapurple']
  let futureColors = ['springgreen', 'red', 'aquamarine', 'hotpink', 'yellow', 'darkslategrey','Chartreuse', 'deeppink']
  let cementColors = ['darkgrey', 'silver', 'grey', 'dimgrey', 'lightslategrey']
  let colors = classicColors
  let selTetro = randomTetromino()
  let color = randomColor()
  let rotate = randomRotation(selTetro)
  let tetroPiece = new Tetromino(allTetromino[selTetro],color,rotate)
  let dropStart = Date.now()
  let gameOver = false
  let pauseToggle = false
  let score = 0
  let timer = 750
  const hiscores = document.querySelector('#hiscores')
  const submissionForm = document.querySelector('#subform')
  const restartBtn = document.querySelector('#restart')
  const submissionField = document.querySelector('.submission')
  const mainMenuBtn = document.querySelector('.mainmenu')
  const endPoint = 'http://localhost:3000/api/v1/scores'
  const tetrisGrid = document.querySelector('.tetris-grid')
  const mainMenu = document.querySelector('.start-menu')
  const gameScoreBoard = document.querySelector('.score-board')
  const colorMenu = document.querySelector("#colorMenu")


  function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)]
  }

  function randomTetromino() {
    return Math.floor(Math.random() * allTetromino.length)
  }

  function randomRotation(selTetro) {
    return Math.floor(Math.random() * allTetromino[selTetro].length)
  }

  function Tetromino(tetromino,color,rotation) {
    this.tetromino = tetromino
    this.color = color
    this.rotation = rotation
    this.currentPiece = this.tetromino[this.rotation]
    this.location = [4, 0]
  }

  Tetromino.prototype.render = function() {
    for(let i = 0; i < this.currentPiece.length; i++) {
      let x = this.currentPiece[i][0] + this.location[0]
      let y = this.currentPiece[i][1] + this.location[1]
      let cell = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]')
      cell.classList.add('filled')
      cell.style.backgroundColor = this.color
    }
  }

  Tetromino.prototype.clear = function() {
    for(let i = 0; i < this.currentPiece.length; i++) {
        let x = this.currentPiece[i][0] + this.location[0]
        let y = this.currentPiece[i][1] + this.location[1]
        let cell = document.querySelector('[data-x="' + x + '"][data-y="' + y + '"]')
        cell.classList.remove('filled')
        cell.style.backgroundColor = ""
    }
  }

  Tetromino.prototype.moveDown = function() {
    let scoreboard = document.querySelector('.score-board > div')
    let scoreboard2 = document.querySelector('.score')
    if (!gameOver && !pauseToggle) {
      score++
      scoreboard.innerHTML = score
      scoreboard2.innerHTML = score
    }
    this.clear()
    if (this.collision(0,1)) {
      // this.clear()
      this.location[1]++
      this.render()
    } else {
      this.render()
      this.lock()
      if (!gameOver) {
        selTetro = randomTetromino()
        color = randomColor()
        rotate = randomRotation(selTetro)
        tetroPiece = new Tetromino(allTetromino[selTetro],color,rotate)
      }
    }
  }

  Tetromino.prototype.moveLeft = function() {
    this.clear()
    if (this.collision(-1,0)) {
      // this.clear()
      this.location[0]--
      this.render()
    } else {
      this.render()
    }
  }

  Tetromino.prototype.moveRight = function() {
    this.clear()
    if (this.collision(1,0)) {
      // this.clear()
      this.location[0]++
      this.render()
    } else {
      this.render()
    }
  }

  Tetromino.prototype.rotate = function() {
    this.clear()
    let kick = 0;
    let tetromino = this.tetromino
    let color = this.color
    let rotation = this.rotation
    if ((this.rotation < this.tetromino.length - 1) ) {
      rotation++
    } else {
      rotation = 0
    }
    let nextPattern = new Tetromino(tetromino,color,rotation)
    nextPattern.location = this.location
     // debugger
    if (!nextPattern.collision(0,0)){
      if (nextPattern.location[0] > width/2) {
        if (nextPattern.tetromino[0][3].includes(3)) {
          kick = -3
        } else {
          kick = -1
        }
      } else {
          kick = 1
      }
    }
    if (this.collision(kick,0)) {
        this.clear()
        this.location[0] += kick;
        if ((this.rotation < this.tetromino.length - 1) ) {
          this.rotation++
        } else {
          this.rotation = 0
        }
        this.currentPiece = this.tetromino[this.rotation]
        this.render()
    }
    this.render()
  }

  Tetromino.prototype.collision = function(xVal,yVal) {
    for(let i = 0; i < this.currentPiece.length; i++) {
      for (let j = 0; j< this.currentPiece.length; j++) {
        let x = this.currentPiece[j][0] + this.location[0] + xVal
        let y = this.currentPiece[j][1] + this.location[1] + yVal
        // debugger
        if (x === (-1)) {
          return false
        } else if (y === (0)) {
          return false
        } else if (x === (width)) {
          return false
        } else if (y === (height)) {
          return false
        } else if ((document.querySelector(`[data-x="${x}"][data-y="${y}"]`).classList[1])) {
          return false
        }
      }
    }
    return true
  }

  Tetromino.prototype.lock = function() {
    let scoreboard = document.querySelector('.score-board > div')
    let scoreboard2 = document.querySelector('.score')
    for (let r = 0; r < this.currentPiece.length; r++) {
      for (let c = 0; c < this.currentPiece.length; c++) {
        let x = this.currentPiece[c][0] + this.location[0]
        let y = this.currentPiece[c][1] + this.location[1]
        let blockColor = document.querySelector(`[data-x="${x}"][data-y="${y}"]`).style.color
        if (this.location[0] === 4 && this.location[1] === 0) {
          gameOver = true
          console.log('lost')
          submitScore()
          gameOverSound.play()
          break;
        }
        blockState = this.color
      }
    }
    let counter = 0
    for (let r = 0; r < height; r++) {
      let filled = true;
      for (let c = 0; c < width; c++) {
        let cell = document.querySelector(`[data-x="${c}"][data-y="${r}"]`)
        filled = filled && cell.style.backgroundColor != ''
      }
      if (filled) {
        counter++
        for (let y = r; y > 1; y--) {
          for (let c = 0; c < width; c++) {
            let cell = document.querySelector(`[data-x="${c}"][data-y="${y}"]`)
            let previousCell = document.querySelector(`[data-x="${c}"][data-y="${y-1}"]`)
            // debugger
            cell.style.backgroundColor = previousCell.style.backgroundColor
            if (previousCell.classList.length === 2) {
              continue;

            } else {
              cell.classList.remove('filled')
            }
          }
        }
        for (let c = 0; c < width; c++) {
          let cell = document.querySelector(`[data-x="${0}"][data-y="${c}"]`)
          cell.style.backgroundColor = 'snow'
        }
        switch (counter) {

          case 1:
            score += counter * 100
            scoreboard.innerHTML = score
            scoreboard2.innerHTML = score
            clearLineSound.play()
            break;
          case 2:
            score += counter * 150
            scoreboard.innerHTML = score
            scoreboard2.innerHTML = score
            multiClearSound.play()
            break;
          case 3:
            score += counter * 200
            scoreboard.innerHTML = score
            scoreboard2.innerHTML = score
            multiClearSound.play()
            break;
          case 4:
            score += counter * 300
            scoreboard.innerHTML = score
            scoreboard2.innerHTML = score
            multiClearSound.play()
            break;
        }
      }
    }
  }

  function createBoard() {
    document.querySelector('.score-board').innerHTML = `Score : <div class="score">0</div>`
    gameBGM.play()
    let tetrisGrid = document.querySelector('.tetris-grid')
    tetrisGrid.innerHTML = ''
    for (let y = 0; y < height; y++) {
      let row = document.createElement('div')
      row.className = 'row'
      row.dataset.row = y

      for (let x = 0; x < width; x++) {
        let col = document.createElement('div')
        col.className = 'cell'
        col.dataset.x = x
        col.dataset.y = y
        col.dataset.state = 0
        row.appendChild(col)
      }
      tetrisGrid.appendChild(row)
    }
  }

  document.addEventListener('keydown', e => {
    if (e.keyCode === 80) {
      togglePause()
    }
    if (!pauseToggle) {
      switch (e.keyCode) {
        case 40:
          tetroPiece.moveDown()
          break
        case 37:
          tetroPiece.moveLeft()
          break
        case 38:
          tetroPiece.rotate()
          rotateSound.play()
          break
        case 39:
          tetroPiece.moveRight()
          break
      }
    }
  })

  function togglePause() {
    pauseToggle = !pauseToggle
    console.log(pauseToggle)
    start()
  }

  function start() {
    let now = Date.now()
    let delta = now - dropStart
    if (score >= 50000) {
      timer = 50
    } else if (score >= 20000) {
      timer = 150
    } else if (score >= 10000) {
      timer = 250
    } else if (score >= 5000) {
      timer = 350
    } else if (score >= 2000) {
      timer = 500
    }
    if (delta > timer) {
      tetroPiece.moveDown()
      dropStart = Date.now()
    }
    if(!gameOver && !pauseToggle){
      requestAnimationFrame(start)
    }
  }

  function submitScore() {
    submissionField.style.display = 'inline-flex'
    submissionForm.reset()
    submissionForm.style.display = ''
  }

  submissionForm.addEventListener('submit', e => {
    e.preventDefault();
    let username = document.querySelector('#username').value
    let score = parseInt(document.querySelector('.score').innerHTML)
    fetch(endPoint, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      body: JSON.stringify({
        score: {
          user: username,
          score: score
        }
      })
    })
    .then(res => res.json())
    .then(e => {
      fetchPoint()
      submissionForm.style.display = 'none'
    })
  })

  restartBtn.addEventListener('click', e => {
    selTetro = randomTetromino()
    color = randomColor()
    rotate = randomRotation(selTetro)
    tetroPiece = new Tetromino(allTetromino[selTetro],color,rotate)
    gameOver = false
    submissionField.style.display = 'none'
    score = 0
    createBoard()
    start()
  })

  mainMenuBtn.addEventListener('click', e => {
    score = 0
    document.querySelector('.top50').innerHTML = ``
    mainMenu.innerHTML = ''
    tetrisGrid.innerHTML = ''
    submissionField.style.display = 'none'
    gameScoreBoard.innerHTML = ''
    randomColor()
    renderStartMenu()
    gameOver = false
    selTetro = randomTetromino()
    color = randomColor()
    rotate = randomRotation(selTetro)
    tetroPiece = new Tetromino(allTetromino[selTetro],color,rotate)
  })

  function fetchPoint() {
    indexCount = 1
    hiscores.innerHTML = ''
    fetch(endPoint)
      .then(res => res.json())
      .then(scores => {
        let allScore = scores
        allScore.sort((a,b) => {
          return b.score - a.score
        })
        let top10 = allScore.slice(0,10)
        top10.forEach(score => {
          const markup = `
            <p>${indexCount++}. ${score.user} - ${score.score}</p>
            `
          hiscores.innerHTML += markup;
        })
      })
  }

  fetchPoint()

  function renderStartMenu(){
    document.querySelector('.start-menu').innerHTML += `
    <ul>
    <button id="startgame" class="button">start game</button><br><br><br>
    <button id="top50" class="button">top 50</button><br><br><br>
    </ul>
    `
    gameBGM.stop()
  }


    function changeColorSet(e){
      e = e.target.value
      if (e == "classicColors") {
        console.log(colors)
        colors = classicColors
        console.log(colors)
      } else if (e == "waterfrontColors") {
        console.log(colors)
        colors = waterfrontColors
        console.log(colors)
      } else if (e == "moodColors") {
        console.log(colors)
        colors = moodColors
        console.log(colors)
      } else if (e == "futureColors") {
        console.log(colors)
        colors = futureColors
        console.log(colors)
      } else if (e == "cementColors") {
        console.log(colors)
        colors = cementColors
        console.log(colors)
      }
      randomColor()
    }



  document.querySelector('.start-menu').addEventListener("click", e=>{
    let indexCount = 1
    if (e.target.id==="startgame") {
      document.querySelector('.top50').innerHTML =``
      document.querySelector('.start-menu').innerHTML = ``
      console.log(e.target.id)
      createBoard()
      start()
    } else if (e.target.id==="top50") {
      mainMenu.innerHTML = ``
      document.querySelector('.top50').innerHTML = `
      <h1>~*top 50*~</h1> <br>
      `
      const endPoint = 'http://localhost:3000/api/v1/scores'
      fetch(endPoint)
        .then(res => res.json())
        .then(scores => {
          let allScore = scores
          allScore.sort((a,b) => {
            return b.score - a.score
          })
          let top50 = allScore.slice(0,50)
          top50.forEach(score => {
            const markup =
            document.querySelector('.top50').innerHTML += `
              <p>${indexCount++}. ${score.user} - ${score.score}</p>
              `
          })
        })

    }
  })

  function Sound(src) {
    this.sound = document.createElement("audio")
    this.sound.src = src
    this.sound.setAttribute("preload", "auto")
    this.sound.setAttribute("controls", "none")
    this.sound.style.display = "none"
    document.body.appendChild(this.sound)
  }

  Sound.prototype.play = function(){
    this.sound.play();
  }

  Sound.prototype.stop = function(){
    this.sound.pause();
  }

  function renderSounds() {
    clearLineSound = new Sound("assets/208495__porphyr__analog-synth-01-c.wav")
    gameOverSound = new Sound("assets/gameover.wav")
    rotateSound = new Sound("assets/186669__fordps3__computer-boop.wav")
    multiClearSound = new Sound("assets/242855__plasterbrain__friend-request.ogg")
    gameBGM = new Sound("assets/bgm3.wav")
  }

  renderSounds()
  renderStartMenu()


  const gameBGMAudio = document.querySelector('body > audio:nth-child(8)')

  gameBGMAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);
  colorMenu.addEventListener("change", changeColorSet)



})
