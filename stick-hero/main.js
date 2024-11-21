// Extend the base functionality of JavaScript
Array.prototype.last = function () {
    return this[this.length - 1];
  };
  
  // A sinus function that acceps degrees instead of radians
  Math.sinus = function (degree) {
    return Math.sin((degree / 180) * Math.PI);
  };
  
  // Game data
  let gameStatus = "waiting"; // waiting | stretching | turning | walking | transitioning | falling
  let previousTimestamp; // The timestamp of the previous requestAnimationFrame cycle
  
  let playerPosX; // Changes when moving forward
  let playerPosY; // Only changes when falling
  let worldOffset; // Moves the whole game
  
  let platforms = [];
  let sticks = [];
  let vegetation = [];
  
  // Todo: Save high score to localStorage (?)
  
  let score = 0;
  
  // Configuration
  const canvasWidth = 375;
  const canvasHeight = 375;
  const platformHeight = 100;
  const playerEdgePadding = 10; // While waiting
  const paddingX = 100; // The waiting position of the hero in from the original canvas size
  const perfectAreaSize = 10;
  
  // nền di chuyển chậm hơn anh hùng
  const backgroundSpeedFactor = 0.2;
  
  const hill1BaseHeight = 100;
  const hill1Amplitude = 10;
  const hill1Stretch = 1;
  const hill2BaseHeight = 70;
  const hill2Amplitude = 20;
  const hill2Stretch = 0.5;
  
  const stretchingSpeed = 4; // Milliseconds it takes to draw a pixel
  const turningSpeed = 4; // Milliseconds it takes to turn a degree
  const walkingSpeed = 4;
  const transitioningSpeed = 2;
  const fallingSpeed = 2;
  
  const playerWidth = 17; // 24
  const playerHeight = 30; // 40
  
  const canvas = document.getElementById("game");
  canvas.width = window.innerWidth; // Make the Canvas full screen
  canvas.height = window.innerHeight;
  let drawBackgroundColor1 = "#BBD691";
  let drawBackgroundColor2 = "#FEF1E1";
  
  const ctx = canvas.getContext("2d");
  
  const introductionDOM = document.getElementById("introduction");
  const perfectDOM = document.getElementById("perfect");
  const restartButton = document.getElementById("restart");
  const startGameDOM =  document.getElementById("start-game")
  const detalScoreDOM =  document.getElementById("detal-score")
  const resultScoreDOM = document.getElementById("result-score");
  const bestScoreDOM = document.getElementById("best-score");
  const colorButtons = document.querySelectorAll('.color-button');
  const backgroundColorPaletteDOM = document.getElementById("background-color-palette");
  const scoreDOM = document.getElementById("score");

  colorButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Lấy màu từ thuộc tính data-color của nút
        drawBackgroundColor1 = button.getAttribute('data-color');
        drawBackgroundColor2 = button.getAttribute('data-color2');
        
        draw()

        // Loại bỏ lớp 'selected' khỏi tất cả các nút
        colorButtons.forEach(b => b.classList.remove('selected'));

        // Thêm lớp 'selected' vào nút hiện tại
        button.classList.add('selected');
    });
  });
  
  // Initialize layout
  resetGame();
  
  // Resets game variables and layouts but does not start the game (game starts on keypress)
  function resetGame() {
    // Reset game progress
    gameStatus = "waiting";
    previousTimestamp = undefined;
    worldOffset = 0;
    score = 0;
  
    introductionDOM.style.opacity = 0;
    perfectDOM.style.opacity = 0;
    // restartButton.style.display = "none";
    scoreDOM.innerText = score;
  
    // The first platform is always the same
    // x + w has to match paddingX
    platforms = [{ x: 50, w: 50 }];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();
  
    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];
  
    vegetation = [];
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();
  
    playerPosX = platforms[0].x + platforms[0].w - playerEdgePadding;
    playerPosY = 0;
  
    draw();
  }
  
  function generateTree() {
    const minimumGap = 30;
    const maximumGap = 150;
  
    // X coordinate of the right edge of the furthest tree
    const lastTree = vegetation[vegetation.length - 1];
    let furthestX = lastTree ? lastTree.x : 0;
  
    const x =
      furthestX +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap));
  
    const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
    const color = treeColors[Math.floor(Math.random() * 3)];
  
    vegetation.push({ x, color });
  }
  
  function generatePlatform() {
    const minimumGap = 40;
    const maximumGap = 200;
    const minimumWidth = 20;
    const maximumWidth = 100;
  
    // X coordinate of the right edge of the furthest platform
    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;
  
    const x =
      furthestX +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap));
    const w =
      minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));
  
    platforms.push({ x, w });
  }
  
  resetGame();
  
  // If space was pressed restart the game
  window.addEventListener("keydown", function (event) {
    if (event.key == " ") {
      event.preventDefault();
      resetGame();
      return;
    }
  });


  
  // window.addEventListener("mousedown", function (event) {
  //   if (gameStatus == "waiting") {
  //     previousTimestamp = undefined;
  //     introductionDOM.style.opacity = 0;
  //     gameStatus = "stretching";
  //     window.requestAnimationFrame(animate);
  //   }
  // });
  
  // window.addEventListener("mouseup", function (event) {
  //   if (gameStatus == "stretching") {
  //     gameStatus = "turning";
  //   }
  // });
  
  // window.addEventListener("resize", function (event) {
  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;
  //   draw();
  // });
  
  window.requestAnimationFrame(animate);
  
  // The main game loop
  function animate(timestamp) {
    if (!previousTimestamp) {
      previousTimestamp = timestamp;
      window.requestAnimationFrame(animate);
      return;
    }
  
    switch (gameStatus) {
      case "waiting":
        return; // Stop the loop
      case "stretching": {
        sticks.last().length += (timestamp - previousTimestamp) / stretchingSpeed;
        break;
      }
      case "turning": {
        sticks.last().rotation += (timestamp - previousTimestamp) / turningSpeed;
  
        if (sticks.last().rotation > 90) {
          sticks.last().rotation = 90;
  
          const [nextPlatform, perfectHit] = thePlatformTheStickHits();
          if (nextPlatform) {
            // Increase score
            score += perfectHit ? 2 : 1;
            scoreDOM.innerText = score;
  
            if (perfectHit) {
              perfectDOM.style.opacity = 1;
              setTimeout(() => (perfectDOM.style.opacity = 0), 1000);
            }
  
            generatePlatform();
            generateTree();
            generateTree();
          }
  
          gameStatus = "walking";
        }
        break;
      }
      case "walking": {
        playerPosX += (timestamp - previousTimestamp) / walkingSpeed;
  
        const [nextPlatform] = thePlatformTheStickHits();
        if (nextPlatform) {
          // If hero will reach another platform then limit it's position at it's edge
          const maxHeroX = nextPlatform.x + nextPlatform.w - playerEdgePadding;
          if (playerPosX > maxHeroX) {
            playerPosX = maxHeroX;
            gameStatus = "transitioning";
          }
        } else {
          // If hero won't reach another platform then limit it's position at the end of the pole
          const maxHeroX = sticks.last().x + sticks.last().length + playerWidth;
          if (playerPosX > maxHeroX) {
            playerPosX = maxHeroX;
            gameStatus = "falling";
          }
        }
        break;
      }
      case "transitioning": {
        worldOffset += (timestamp - previousTimestamp) / transitioningSpeed;
  
        const [nextPlatform] = thePlatformTheStickHits();
        if (worldOffset > nextPlatform.x + nextPlatform.w - paddingX) {
          // Add the next step
          sticks.push({
            x: nextPlatform.x + nextPlatform.w,
            length: 0,
            rotation: 0
          });
          gameStatus = "waiting";
        }
        break;
      }
      case "falling": {
        if (sticks.last().rotation < 180)
          sticks.last().rotation += (timestamp - previousTimestamp) / turningSpeed;
  
        playerPosY += (timestamp - previousTimestamp) / fallingSpeed;
        const maxHeroY =
          platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
        if (playerPosY > maxHeroY) {
          startGameDOM.style.display = "Block";
          detalScoreDOM.style.display = "Block";
          document.body.style.cursor = "default";
          resultScoreDOM.innerText = score;
          const localStorageScore = localStorage.getItem('stick-hero-best-score') || 0;

          if(score > localStorageScore){
              localStorage.setItem('stick-hero-best-score', score)
          }
          bestScoreDOM.innerHTML = score > localStorageScore ? score : localStorageScore;
          // restartButton.style.display = "block";
          return;
        }
        break;
      }
      default:
        throw Error("Wrong gameStatus");
    }
  
    draw();
    window.requestAnimationFrame(animate);
  
    previousTimestamp = timestamp;
  }
  
  // Returns the platform the stick hit (if it didn't hit any stick then return undefined)
  function thePlatformTheStickHits() {
    if (sticks.last().rotation != 90)
      throw Error(`Stick is ${sticks.last().rotation}°`);
    const stickFarX = sticks.last().x + sticks.last().length;
  
    const platformTheStickHits = platforms.find(
      (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );
  
    // If the stick hits the perfect area
    if (
      platformTheStickHits &&
      platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 <
        stickFarX &&
      stickFarX <
        platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
    )
      return [platformTheStickHits, true];
  
    return [platformTheStickHits, false];
  }
  
  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
    drawBackground();
  
    // Center main canvas area to the middle of the screen
    ctx.translate(
      (window.innerWidth - canvasWidth) / 2 - worldOffset,
      (window.innerHeight - canvasHeight) / 2
    );
  
    // Draw scene
    drawPlatforms();
    drawHero();
    drawSticks();
  
    // Restore transformation
    ctx.restore();
  }
  
  // restartButton.addEventListener("click", function (event) {
  //   event.preventDefault();
  //   resetGame();
  //   restartButton.style.display = "none";
  // });
  
  function drawPlatforms() {
    platforms.forEach(({ x, w }) => {
      // Draw platform
      ctx.fillStyle = "black";
      ctx.fillRect(
        x,
        canvasHeight - platformHeight,
        w,
        platformHeight + (window.innerHeight - canvasHeight) / 2
      );
  
      // Draw perfect area only if hero did not yet reach the platform
      if (sticks.last().x < x) {
        ctx.fillStyle = "red";
        ctx.fillRect(
          x + w / 2 - perfectAreaSize / 2,
          canvasHeight - platformHeight,
          perfectAreaSize,
          perfectAreaSize
        );
      }
    });
  }
  
  function drawHero() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.translate(
      playerPosX - playerWidth / 2,
      playerPosY + canvasHeight - platformHeight - playerHeight / 2
    );
  
    // Body
    drawRoundedRect(
      -playerWidth / 2,
      -playerHeight / 2,
      playerWidth,
      playerHeight - 4,
      5
    );
  
    // Legs
    const legDistance = 5;
    ctx.beginPath();
    ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();
  
    // Eye
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
    ctx.fill();
  
    // Band
    ctx.fillStyle = "red";
    ctx.fillRect(-playerWidth / 2 - 1, -12, playerWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, -14.5);
    ctx.lineTo(-17, -18.5);
    ctx.lineTo(-14, -8.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5);
    ctx.lineTo(-15, -3.5);
    ctx.lineTo(-5, -7);
    ctx.fill();
  
    ctx.restore();
  }
  
  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
  }
  
  function drawSticks() {
    sticks.forEach((stick) => {
      ctx.save();
  
      // Move the anchor point to the start of the stick and rotate
      ctx.translate(stick.x, canvasHeight - platformHeight);
      ctx.rotate((Math.PI / 180) * stick.rotation);
  
      // Draw stick
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -stick.length);
      ctx.stroke();
  
      // Restore transformations
      ctx.restore();
    });
  }
  
  function drawBackground(isDrawHill) {
    // Draw sky
    var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    // set màu nền
    gradient.addColorStop(0, drawBackgroundColor1);
    gradient.addColorStop(1, drawBackgroundColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  
    // Vẽ đồi
    drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
    drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");
  
    // Draw vegetation
    vegetation.forEach((tree) => drawTree(tree.x, tree.color));
  }
  
  // A hill is a shape under a stretched out sinus wave
  function drawHill(baseHeight, amplitude, stretch, color) {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
    for (let i = 0; i < window.innerWidth; i++) {
      ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  function drawTree(x, color) {
    ctx.save();
    ctx.translate(
      (-worldOffset * backgroundSpeedFactor + x) * hill1Stretch,
      getTreeY(x, hill1BaseHeight, hill1Amplitude)
    );
  
    const treeTrunkHeight = 5;
    const treeTrunkWidth = 2;
    const treeCrownHeight = 25;
    const treeCrownWidth = 10;
  
    // Draw trunk
    ctx.fillStyle = "#7D833C";
    ctx.fillRect(
      -treeTrunkWidth / 2,
      -treeTrunkHeight,
      treeTrunkWidth,
      treeTrunkHeight
    );
  
    // Draw crown
    ctx.beginPath();
    ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
    ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
    ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
    ctx.fillStyle = color;
    ctx.fill();
  
    ctx.restore();
  }
  
  function getHillY(windowX, baseHeight, amplitude, stretch) {
    const sineBaseY = window.innerHeight - baseHeight;
    return (
      Math.sinus((worldOffset * backgroundSpeedFactor + windowX) * stretch) *
        amplitude +
      sineBaseY
    );
  }
  
  function getTreeY(x, baseHeight, amplitude) {
    const sineBaseY = window.innerHeight - baseHeight;
    return Math.sinus(x) * amplitude + sineBaseY;
  }

  startGameDOM.addEventListener("click", () => {
    backgroundColorPaletteDOM.style.display = "none";
    startGameDOM.style.display = "none";
    detalScoreDOM.style.display = "none";
    document.body.style.cursor = "pointer";
    if(gameStatus === "falling") resetGame();
    introductionDOM.style.opacity = 1;
    window.addEventListener("mousedown", function (event) {
      if (gameStatus == "waiting") {
        previousTimestamp = undefined;
        introductionDOM.style.opacity = 0;
        gameStatus = "stretching";
        window.requestAnimationFrame(animate);
      }
    });
    
    window.addEventListener("mouseup", function (event) {
      if (gameStatus == "stretching") {
        gameStatus = "turning";
      }
    });
    
    window.addEventListener("resize", function (event) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    });
  });
  