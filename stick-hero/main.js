const loginDOM = document.getElementsByClassName("login");
const bodyDOM = document.querySelector('body');
const mainContentDOM = document.getElementById('main-content');
const screen1DOM =  document.querySelector('.screen-1');
const usernameInput = document.getElementById('username');
const boxScoreDOM =  document.getElementById('box-score');

window.onload = function() {
    const savedUsername = localStorage.getItem("username-stick-hero");  // Lấy giá trị từ localStorage
    if (savedUsername) {
      usernameInput.value = savedUsername;  // Đổ giá trị vào input
    }
  };
  
document.querySelector('.login').addEventListener("click",()=>{
    if (!usernameInput.value) {
        alert('User name is required!');
    }else{
        localStorage.setItem("username-stick-hero", usernameInput.value);
        bodyDOM.classList.remove('first-body');
        screen1DOM.style.display = "none";
        mainContentDOM.style.visibility = "visible";
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
          
          function resetGame() {
            // Reset trạng thái game
            initializeGameState();
            resetDOMElements();
            resetPlatforms();
            resetSticks();
            resetVegetation();
            resetPlayerPosition();
        
            // Vẽ lại màn hình
            draw();
        }
        
          // Hàm con: Khởi tạo trạng thái game
          function initializeGameState() {
              gameStatus = "waiting";
              previousTimestamp = undefined;
              worldOffset = 0;
              score = 0;
          }
        
          // Hàm con: Cập nhật giao diện DOM
          function resetDOMElements() {
              introductionDOM.style.opacity = 0;
              perfectDOM.style.opacity = 0;
              scoreDOM.innerText = score;
          }
        
          // Hàm con: Tạo lại nền tảng
          function resetPlatforms() {
              platforms = [{ x: 50, w: 50 }]; // Nền tảng đầu tiên cố định
              for (let i = 0; i < 4; i++) {
                  generatePlatform(); // Tạo 4 nền tảng bổ sung
              }
          }
        
          // Hàm con: Tạo lại gậy
          function resetSticks() {
              sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];
          }
        
          // Hàm con: Tạo lại cây và thực vật
          function resetVegetation() {
              vegetation = [];
              for (let i = 0; i < 10; i++) {
                  generateTree(); // Tạo 10 cây
              }
          }
        
          // Hàm con: Đặt lại vị trí người chơi
          function resetPlayerPosition() {
              playerPosX = platforms[0].x + platforms[0].w - playerEdgePadding;
              playerPosY = 0;
          }
        
            
          function generateTree() {
            // Cài đặt các tham số khoảng cách và màu sắc
            const GAP_RANGE = { min: 30, max: 150 };
            const TREE_COLORS = ["#6D8821", "#8FAC34", "#98B333"];
        
            // Lấy tọa độ X của cây xa nhất
            const furthestX = vegetation.length > 0 
                ? vegetation[vegetation.length - 1].x 
                : 0;
        
            // Tính toán vị trí mới cho cây
            const x = furthestX + getRandomInRange(GAP_RANGE.min, GAP_RANGE.max);
        
            // Lựa chọn màu ngẫu nhiên cho cây
            const color = getRandomElement(TREE_COLORS);
        
            // Thêm cây mới vào mảng vegetation
            vegetation.push({ x, color });
          }
        
          // Hàm phụ: Tạo giá trị ngẫu nhiên trong khoảng [min, max]
          function getRandomInRange(min, max) {
            return min + Math.floor(Math.random() * (max - min));
          }
        
          // Hàm phụ: Lấy phần tử ngẫu nhiên từ mảng
          function getRandomElement(array) {
            return array[Math.floor(Math.random() * array.length)];
          }
          
          function generatePlatform() {
            // Cài đặt các tham số khoảng cách và kích thước
            const GAP_RANGE = { min: 40, max: 200 };
            const WIDTH_RANGE = { min: 20, max: 100 };
        
            // Lấy tọa độ X của nền tảng xa nhất
            const furthestX = platforms.length > 0 
                ? platforms[platforms.length - 1].x + platforms[platforms.length - 1].w 
                : 0;
        
            // Tính toán vị trí và chiều rộng ngẫu nhiên
            const x = furthestX + getRandomInRange(GAP_RANGE.min, GAP_RANGE.max);
            const w = getRandomInRange(WIDTH_RANGE.min, WIDTH_RANGE.max);
        
            // Thêm nền tảng mới vào mảng platforms
            platforms.push({ x, w });
        }
        
          // Hàm phụ: Tạo giá trị ngẫu nhiên trong khoảng [min, max]
          function getRandomInRange(min, max) {
              return min + Math.floor(Math.random() * (max - min));
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
                    handleWaitingState();
                    return; // Stop the loop
        
                case "stretching":
                    handleStretchingState(timestamp);
                    break;
        
                case "turning":
                    handleTurningState(timestamp);
                    break;
        
                case "walking":
                    handleWalkingState(timestamp);
                    break;
        
                case "transitioning":
                    handleTransitioningState(timestamp);
                    break;
        
                case "falling":
                    handleFallingState(timestamp);
                    break;
        
                default:
                    throw Error("Invalid gameStatus");
            }
        
            draw();
            window.requestAnimationFrame(animate);
            previousTimestamp = timestamp;
        }
        
          // Hàm phụ xử lý trạng thái "waiting"
          function handleWaitingState() {
              // Không cần làm gì vì game đang chờ
          }
        
          // Hàm phụ xử lý trạng thái "stretching"
          function handleStretchingState(timestamp) {
              sticks.last().length += (timestamp - previousTimestamp) / stretchingSpeed;
          }
        
          // Hàm phụ xử lý trạng thái "turning"
          function handleTurningState(timestamp) {
              sticks.last().rotation += (timestamp - previousTimestamp) / turningSpeed;
        
              if (sticks.last().rotation > 90) {
                  sticks.last().rotation = 90;
        
                  const [nextPlatform, perfectHit] = thePlatformTheStickHits();
                  if (nextPlatform) {
                      updateScore(perfectHit);
                      generatePlatformAndTrees();
                  }
        
                  gameStatus = "walking";
              }
          }
        
          // Hàm phụ xử lý trạng thái "walking"
          function handleWalkingState(timestamp) {
              playerPosX += (timestamp - previousTimestamp) / walkingSpeed;
        
              const [nextPlatform] = thePlatformTheStickHits();
              if (nextPlatform) {
                  const maxHeroX = nextPlatform.x + nextPlatform.w - playerEdgePadding;
                  if (playerPosX > maxHeroX) {
                      playerPosX = maxHeroX;
                      gameStatus = "transitioning";
                  }
              } else {
                  const maxHeroX = sticks.last().x + sticks.last().length + playerWidth;
                  if (playerPosX > maxHeroX) {
                      playerPosX = maxHeroX;
                      gameStatus = "falling";
                  }
              }
          }
        
          // Hàm phụ xử lý trạng thái "transitioning"
          function handleTransitioningState(timestamp) {
              worldOffset += (timestamp - previousTimestamp) / transitioningSpeed;
        
              const [nextPlatform] = thePlatformTheStickHits();
              if (worldOffset > nextPlatform.x + nextPlatform.w - paddingX) {
                  sticks.push({
                      x: nextPlatform.x + nextPlatform.w,
                      length: 0,
                      rotation: 0
                  });
                  gameStatus = "waiting";
              }
          }
        
          // Hàm phụ xử lý trạng thái "falling"
          function handleFallingState(timestamp) {
              if (sticks.last().rotation < 180) {
                  sticks.last().rotation += (timestamp - previousTimestamp) / turningSpeed;
              }
        
              playerPosY += (timestamp - previousTimestamp) / fallingSpeed;
              const maxHeroY =
                  platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
        
              if (playerPosY > maxHeroY) {
                  showEndGameUI();
                  return;
              }
          }
        
          // Hàm phụ cập nhật điểm số
          function updateScore(perfectHit) {
              score += perfectHit ? 2 : 1;
              scoreDOM.innerText = score;
        
              if (perfectHit) {
                  perfectDOM.style.opacity = 1;
                  setTimeout(() => (perfectDOM.style.opacity = 0), 1000);
              }
          }
        
          // Hàm phụ tạo nền tảng và cây mới
          function generatePlatformAndTrees() {
              generatePlatform();
              generateTree();
              generateTree();
          }
        
          // Hàm phụ hiển thị giao diện kết thúc game
          function showEndGameUI() {
              startGameDOM.style.display = "block";
              detalScoreDOM.style.display = "block";
              document.body.style.cursor = "default";
              resultScoreDOM.innerText = score;
        
              const localStorageScore = localStorage.getItem("stick-hero-best-score") || 0;
              if (score > localStorageScore) {
                  localStorage.setItem("stick-hero-best-score", score);
              }
              bestScoreDOM.innerHTML = score > localStorageScore ? score : localStorageScore;
          }
          
          // Returns the platform the stick hit (if it didn't hit any stick then return undefined)
          function thePlatformTheStickHits() {
            if (sticks.last().rotation !== 90) {
                throw new Error(`Stick is ${sticks.last().rotation}°`);
            }
        
            const stickFarX = sticks.last().x + sticks.last().length;
            const platformTheStickHits = findPlatformHitByStick(stickFarX);
        
            if (!platformTheStickHits) {
                return [null, false];
            }
        
            const perfectHit = isPerfectHit(platformTheStickHits, stickFarX);
            return [platformTheStickHits, perfectHit];
        }
        
          // Hàm phụ tìm nền tảng mà cây gậy chạm vào
          function findPlatformHitByStick(stickFarX) {
              return platforms.find(platform => 
                  platform.x < stickFarX && stickFarX < platform.x + platform.w
              );
          }
        
          // Hàm phụ kiểm tra xem gậy có chạm đúng vùng "perfect" hay không
          function isPerfectHit(platform, stickFarX) {
              const platformCenter = platform.x + platform.w / 2;
              const perfectAreaStart = platformCenter - perfectAreaSize / 2;
              const perfectAreaEnd = platformCenter + perfectAreaSize / 2;
        
              return stickFarX > perfectAreaStart && stickFarX < perfectAreaEnd;
          }
          
          function draw() {
            ctx.save();
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
            drawBackground();
            centerCanvas();
            drawScene();
          
            ctx.restore();
        }
        
          // Hàm phụ căn giữa canvas trên màn hình
          function centerCanvas() {
              ctx.translate(
                  (window.innerWidth - canvasWidth) / 2 - worldOffset,
                  (window.innerHeight - canvasHeight) / 2
              );
          }
        
          // Hàm phụ vẽ toàn bộ cảnh
          function drawScene() {
              drawPlatforms();
              drawHero();
              drawSticks();
          }
        
          
          // restartButton.addEventListener("click", function (event) {
          //   event.preventDefault();
          //   resetGame();
          //   restartButton.style.display = "none";
          // });
          
          function drawPlatforms() {
            platforms.forEach(({ x, w }) => {
                drawPlatform(x, w);
                if (sticks.last().x < x) {
                    drawPerfectArea(x, w);
                }
            });
        }
        
          // Hàm phụ vẽ nền tảng
          function drawPlatform(x, w) {
              ctx.fillStyle = "black";
              ctx.fillRect(
                  x,
                  canvasHeight - platformHeight,
                  w,
                  platformHeight + (window.innerHeight - canvasHeight) / 2
              );
          }
        
          // Hàm phụ vẽ khu vực perfect
          function drawPerfectArea(x, w) {
              ctx.fillStyle = "red";
              ctx.fillRect(
                  x + w / 2 - perfectAreaSize / 2,
                  canvasHeight - platformHeight,
                  perfectAreaSize,
                  perfectAreaSize
              );
          }
        
          
          function drawHero() {
            ctx.save();
            ctx.fillStyle = "black";
            ctx.translate(
                playerPosX - playerWidth / 2,
                playerPosY + canvasHeight - platformHeight - playerHeight / 2
            );
        
            drawBody();
            drawLegs();
            drawEye();
            drawBand();
        
            ctx.restore();
        }
        
          // Hàm phụ vẽ cơ thể nhân vật
          function drawBody() {
              drawRoundedRect(
                  -playerWidth / 2,
                  -playerHeight / 2,
                  playerWidth,
                  playerHeight - 4,
                  5
              );
          }
        
          // Hàm phụ vẽ đôi chân
          function drawLegs() {
              const legDistance = 5;
              ctx.beginPath();
              ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
              ctx.fill();
          }
        
          // Hàm phụ vẽ mắt
          function drawEye() {
              ctx.beginPath();
              ctx.fillStyle = "white";
              ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
              ctx.fill();
          }
        
          // Hàm phụ vẽ băng đầu
          function drawBand() {
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
                
                // Di chuyển điểm neo đến vị trí bắt đầu của cây gậy và xoay
                ctx.translate(stick.x, canvasHeight - platformHeight);
                ctx.rotate((Math.PI / 180) * stick.rotation);
                
                drawStick(stick);
                
                // Khôi phục lại các phép biến đổi
                ctx.restore();
            });
          }
        
          // Hàm phụ vẽ cây gậy
          function drawStick(stick) {
              ctx.beginPath();
              ctx.lineWidth = 2;
              ctx.moveTo(0, 0);
              ctx.lineTo(0, -stick.length);
              ctx.stroke();
          }
        
          
          function drawBackground() {
            // Draw sky
            drawSky();
          
            // Vẽ đồi
            drawHills();
          
            // Draw vegetation
            drawVegetation();
          }
        
          // Hàm phụ vẽ bầu trời với gradient
          function drawSky() {
              var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
              // set màu nền
              gradient.addColorStop(0, drawBackgroundColor1);
              gradient.addColorStop(1, drawBackgroundColor2);
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
          }
        
          // Hàm phụ vẽ đồi
          function drawHills() {
              drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
              drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");
          }
        
          // Hàm phụ vẽ thực vật (cây)
          function drawVegetation() {
              vegetation.forEach((tree) => drawTree(tree.x, tree.color));
          }
        
          
          // A hill is a shape under a stretched out sinus wave
          function drawHill(baseHeight, amplitude, stretch, color) {
            ctx.beginPath();
            ctx.moveTo(0, window.innerHeight);
            ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
        
            // Vẽ các điểm còn lại của đồi
            drawHillPath(baseHeight, amplitude, stretch);
        
            ctx.lineTo(window.innerWidth, window.innerHeight);
            ctx.fillStyle = color;
            ctx.fill();
        }
        
          // Hàm phụ vẽ đường đi của đồi
          function drawHillPath(baseHeight, amplitude, stretch) {
              for (let i = 0; i < window.innerWidth; i++) {
                  ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
              }
          }
          
          function drawTree(x, color) {
            ctx.save();
            ctx.translate(
              (-worldOffset * backgroundSpeedFactor + x) * hill1Stretch,
              getTreeY(x, hill1BaseHeight, hill1Amplitude)
            );
        
            // Vẽ thân cây
            drawTreeTrunk();
        
            // Vẽ tán cây
            drawTreeCrown(color);
        
            ctx.restore();
          }
        
          // Hàm vẽ thân cây
          function drawTreeTrunk() {
              const treeTrunkHeight = 5;
              const treeTrunkWidth = 2;
        
              ctx.fillStyle = "#7D833C";
              ctx.fillRect(
                -treeTrunkWidth / 2,
                -treeTrunkHeight,
                treeTrunkWidth,
                treeTrunkHeight
              );
          }
        
          // Hàm vẽ tán cây
          function drawTreeCrown(color) {
              const treeCrownHeight = 25;
              const treeCrownWidth = 10;
        
              ctx.beginPath();
              ctx.moveTo(-treeCrownWidth / 2, -5); // Offset the trunk height for crown positioning
              ctx.lineTo(0, -(5 + treeCrownHeight));
              ctx.lineTo(treeCrownWidth / 2, -5);
              ctx.fillStyle = color;
              ctx.fill();
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
        
          // Hàm khởi tạo các sự kiện
          function initGameEvents() {
            startGameDOM.addEventListener("click", handleStartGameClick);
          }
        
          // Hàm xử lý sự kiện click vào nút bắt đầu trò chơi
          function handleStartGameClick() {
            backgroundColorPaletteDOM.style.display = "none";
            startGameDOM.style.display = "none";
            detalScoreDOM.style.display = "none";
            document.body.style.cursor = "pointer";
        
            if (gameStatus === "falling") {
                resetGame();
            }
        
            introductionDOM.style.opacity = 1;
            
            window.addEventListener("mousedown", handleMouseDown);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("resize", handleWindowResize);
          }
        
          // Hàm xử lý sự kiện mousedown (nhấn chuột)
          function handleMouseDown(event) {
            if (gameStatus == "waiting") {
                previousTimestamp = undefined;
                introductionDOM.style.opacity = 0;
                gameStatus = "stretching";
                window.requestAnimationFrame(animate);
            }
          }
        
          // Hàm xử lý sự kiện mouseup (thả chuột)
          function handleMouseUp(event) {
            if (gameStatus == "stretching") {
                gameStatus = "turning";
            }
          }
        
          // Hàm xử lý sự kiện resize (thay đổi kích thước cửa sổ)
          function handleWindowResize(event) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            draw();
          }
        
          // Gọi hàm khởi tạo các sự kiện khi trang được tải
          initGameEvents();
    }
})
  