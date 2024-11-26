const counterDOM = document.getElementById("counter");
const endDOM = document.getElementById("end");
const boxScoreDOM = document.getElementById("box-score");
const startGameDOM =  document.getElementById("start-game");
const resultScoreDOM = document.getElementById("result-score");
const bestScoreDOM = document.getElementById("best-score");
const detalScoreDOM = document.getElementById("detal-score");
const loginDOM = document.getElementsByClassName("login");
const bodyDOM = document.querySelector('body');
const mainContentDOM = document.getElementById('main-content');
const screen1DOM =  document.querySelector('.screen-1');
const usernameInput = document.getElementById('username');
const highScoreTable = document.querySelector("#highScoreTable");

window.onload = function() {
  const savedUsername = localStorage.getItem("username-crossy-road-game");  // Lấy giá trị từ localStorage
  if (savedUsername) {
    usernameInput.value = savedUsername;  // Đổ giá trị vào input
  }
};

document.querySelector('.login').addEventListener("click",()=>{
  if (!usernameInput.value) {
    alert('User name is required!');
  }else{
    localStorage.setItem("username-crossy-road-game", usernameInput.value);
    bodyDOM.classList.remove('first-body');
    screen1DOM.style.display = "none";
    mainContentDOM.style.display = "Block";

    const scene = new THREE.Scene();
    
    const distance = 500;
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      0.1,
      10000
    );
    
    camera.rotation.x = (50 * Math.PI) / 180;
    camera.rotation.y = (20 * Math.PI) / 180;
    camera.rotation.z = (10 * Math.PI) / 180;
    
    const initialCameraPositionY = -Math.tan(camera.rotation.x) * distance;
    const initialCameraPositionX =
      Math.tan(camera.rotation.y) *
      Math.sqrt(distance ** 2 + initialCameraPositionY ** 2);
    camera.position.y = initialCameraPositionY;
    camera.position.x = initialCameraPositionX;
    camera.position.z = distance;
    
    const zoom = 2;
    
    const chickenSize = 15;
    
    const positionWidth = 42;
    const columns = 17;
    const boardWidth = positionWidth * columns;
    
    const stepTime = 200; // Miliseconds it takes for the chicken to take a step forward, backward, left or right
    
    let lanes;
    let currentLane;
    let currentColumn;
    
    let previousTimestamp;
    let startMoving;
    let moves;
    let stepStartTimestamp;
    
    const carFrontTexture = new createCanvasTexture(40, 80, [{ x: 0, y: 10, w: 30, h: 60 }]);
    const carBackTexture = new createCanvasTexture(40, 80, [{ x: 10, y: 10, w: 30, h: 60 }]);
    const carRightSideTexture = new createCanvasTexture(110, 40, [
      { x: 10, y: 0, w: 50, h: 30 },
      { x: 70, y: 0, w: 30, h: 30 },
    ]);
    const carLeftSideTexture = new createCanvasTexture(110, 40, [
      { x: 10, y: 10, w: 50, h: 30 },
      { x: 70, y: 10, w: 30, h: 30 },
    ]);
    
    const truckFrontTexture = new createCanvasTexture(30, 30, [{ x: 15, y: 0, w: 10, h: 30 }]);
    const truckRightSideTexture = new createCanvasTexture(25, 30, [
      { x: 0, y: 15, w: 10, h: 10 },
    ]);
    const truckLeftSideTexture = new createCanvasTexture(25, 30, [
      { x: 0, y: 5, w: 10, h: 10 },
    ]);
    
    const generateLanes = () =>
      [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        .map((index) => {
          const lane = new Lane(index);
          lane.mesh.position.y = index * positionWidth * zoom;
          scene.add(lane.mesh);
          return lane;
        })
        .filter((lane) => lane.index >= 0);
    
    const addLane = () => {
      const index = lanes.length;
      const lane = new Lane(index);
      lane.mesh.position.y = index * positionWidth * zoom;
      scene.add(lane.mesh);
      lanes.push(lane);
    };
    
    const chicken = new Chicken();
    scene.add(chicken);
    
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    scene.add(hemiLight);
    
    const initialDirLightPositionX = -100;
    const initialDirLightPositionY = -100;
    dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(initialDirLightPositionX, initialDirLightPositionY, 200);
    dirLight.castShadow = true;
    dirLight.target = chicken;
    scene.add(dirLight);
    
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    var d = 500;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    
    // var helper = new THREE.CameraHelper( dirLight.shadow.camera );
    // var helper = new THREE.CameraHelper( camera );
    // scene.add(helper)
    
    backLight = new THREE.DirectionalLight(0x000000, 0.4);
    backLight.position.set(200, 200, 50);
    backLight.castShadow = true;
    scene.add(backLight);
    
    const laneTypes = ["car", "truck", "forest"];
    const laneSpeeds = [2, 2.5, 3];
    const vechicleColors = [0xa52523, 0xbdb638, 0x78b14b];
    const threeHeights = [20, 45, 60];
    
    const resetGameValues = () => {
      lanes = generateLanes();
    
      currentLane = 0;
      currentColumn = Math.floor(columns / 2);
    
      previousTimestamp = null;
    
      startMoving = false;
      moves = [];
      stepStartTimestamp;
    
      chicken.position.x = 0;
      chicken.position.y = 0;
    
      camera.position.y = initialCameraPositionY;
      camera.position.x = initialCameraPositionX;
    
      dirLight.position.x = initialDirLightPositionX;
      dirLight.position.y = initialDirLightPositionY;
    };
    
    resetGameValues();
    
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    function createCanvasTexture(width, height, rects) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "rgba(0,0,0,0.6)";
      rects.forEach((rect) => {
        context.fillRect(rect.x, rect.y, rect.w, rect.h);
      });
      return new THREE.CanvasTexture(canvas);
    }
    
    function Wheel() {
      // Helper function to create a wheel mesh
      const createWheelMesh = () => {
        const geometry = new THREE.BoxBufferGeometry(12 * zoom, 33 * zoom, 12 * zoom);
        const material = new THREE.MeshLambertMaterial({ color: 0x333333, flatShading: true });
        const wheelMesh = new THREE.Mesh(geometry, material);
        wheelMesh.position.z = 6 * zoom;
        return wheelMesh;
      };
    
      // Create and return the wheel mesh
      return createWheelMesh();
    }
    
    
    function Car() {
      const car = new THREE.Group();
      const color = getRandomVehicleColor();
    
      // Create car body
      const main = createCarMainBody(color);
      car.add(main);
    
      // Create car cabin
      const cabin = createCarCabin();
      car.add(cabin);
    
      // Create wheels
      const frontWheel = createWheel(-18); // front wheel position
      car.add(frontWheel);
    
      const backWheel = createWheel(18); // back wheel position
      car.add(backWheel);
    
      car.castShadow = true;
      car.receiveShadow = false;
    
      return car;
    }
    
    // Function to get a random vehicle color
    function getRandomVehicleColor() {
      return vechicleColors[Math.floor(Math.random() * vechicleColors.length)];
    }
    
    // Function to create the main body of the car
    function createCarMainBody(color) {
      const main = new THREE.Mesh(
        new THREE.BoxBufferGeometry(60 * zoom, 30 * zoom, 15 * zoom),
        new THREE.MeshPhongMaterial({ color, flatShading: true })
      );
      main.position.z = 12 * zoom;
      main.castShadow = true;
      main.receiveShadow = true;
      return main;
    }
    
    // Function to create the car cabin with textures
    function createCarCabin() {
      const cabin = new THREE.Mesh(
        new THREE.BoxBufferGeometry(33 * zoom, 24 * zoom, 12 * zoom),
        [
          new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            flatShading: true,
            map: carBackTexture,
          }),
          new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            flatShading: true,
            map: carFrontTexture,
          }),
          new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            flatShading: true,
            map: carRightSideTexture,
          }),
          new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            flatShading: true,
            map: carLeftSideTexture,
          }),
          new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // top
          new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // bottom
        ]
      );
      cabin.position.x = 6 * zoom;
      cabin.position.z = 25.5 * zoom;
      cabin.castShadow = true;
      cabin.receiveShadow = true;
      return cabin;
    }
    
    // Function to create a wheel at a given position
    function createWheel(positionX) {
      const wheel = new Wheel();
      wheel.position.x = positionX * zoom;
      return wheel;
    }
    
    function Truck() {
      const truck = new THREE.Group();
      const color = getRandomVehicleColor();
    
      // Create the base of the truck
      const base = createBase();
      truck.add(base);
    
      // Create the cargo of the truck
      const cargo = createCargo();
      truck.add(cargo);
    
      // Create the cabin of the truck
      const cabin = createCabin(color);
      truck.add(cabin);
    
      // Create the wheels of the truck
      const frontWheel = createWheel(-38); // front wheel position
      truck.add(frontWheel);
    
      const middleWheel = createWheel(-10); // middle wheel position
      truck.add(middleWheel);
    
      const backWheel = createWheel(30); // back wheel position
      truck.add(backWheel);
    
      truck.castShadow = true;
      truck.receiveShadow = false;
    
      return truck;
    }
    
    // Function to get a random vehicle color
    function getRandomVehicleColor() {
      return vechicleColors[Math.floor(Math.random() * vechicleColors.length)];
    }
    
    // Function to create the truck base (the main platform)
    function createBase() {
      const base = new THREE.Mesh(
        new THREE.BoxBufferGeometry(100 * zoom, 25 * zoom, 5 * zoom),
        new THREE.MeshLambertMaterial({ color: 0xb4c6fc, flatShading: true })
      );
      base.position.z = 10 * zoom;
      return base;
    }
    
    // Function to create the cargo of the truck
    function createCargo() {
      const cargo = new THREE.Mesh(
        new THREE.BoxBufferGeometry(75 * zoom, 35 * zoom, 40 * zoom),
        new THREE.MeshPhongMaterial({ color: 0xb4c6fc, flatShading: true })
      );
      cargo.position.x = 15 * zoom;
      cargo.position.z = 30 * zoom;
      cargo.castShadow = true;
      cargo.receiveShadow = true;
      return cargo;
    }
    
    // Function to create the cabin of the truck with different sides and textures
    function createCabin(color) {
      const cabin = new THREE.Mesh(
        new THREE.BoxBufferGeometry(25 * zoom, 30 * zoom, 30 * zoom),
        [
          new THREE.MeshPhongMaterial({ color, flatShading: true }), // back
          new THREE.MeshPhongMaterial({
            color,
            flatShading: true,
            map: truckFrontTexture,
          }), // front
          new THREE.MeshPhongMaterial({
            color,
            flatShading: true,
            map: truckRightSideTexture,
          }), // right side
          new THREE.MeshPhongMaterial({
            color,
            flatShading: true,
            map: truckLeftSideTexture,
          }), // left side
          new THREE.MeshPhongMaterial({ color, flatShading: true }), // top
          new THREE.MeshPhongMaterial({ color, flatShading: true }), // bottom
        ]
      );
      cabin.position.x = -40 * zoom;
      cabin.position.z = 20 * zoom;
      cabin.castShadow = true;
      cabin.receiveShadow = true;
      return cabin;
    }
    
    // Function to create a wheel at a specific position
    function createWheel(positionX) {
      const wheel = new Wheel();
      wheel.position.x = positionX * zoom;
      return wheel;
    }
    
    function Three() {
      const three = new THREE.Group();
    
      // Create tree trunk
      const trunk = createTrunk();
      three.add(trunk);
    
      // Create tree crown with a random height
      const crown = createCrown();
      three.add(crown);
    
      return three;
    }
    
    // Function to create the trunk of the tree
    function createTrunk() {
      const trunk = new THREE.Mesh(
        new THREE.BoxBufferGeometry(15 * zoom, 15 * zoom, 20 * zoom),
        new THREE.MeshPhongMaterial({ color: 0x4d2926, flatShading: true })
      );
      trunk.position.z = 10 * zoom;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      return trunk;
    }
    
    // Function to create the crown of the tree with a random height
    function createCrown() {
      const height = threeHeights[Math.floor(Math.random() * threeHeights.length)];
      const crown = new THREE.Mesh(
        new THREE.BoxBufferGeometry(30 * zoom, 30 * zoom, height * zoom),
        new THREE.MeshLambertMaterial({ color: 0x7aa21d, flatShading: true })
      );
      crown.position.z = (height / 2 + 20) * zoom;
      crown.castShadow = true;
      crown.receiveShadow = false;
      return crown;
    }
    
    function Chicken() {
      const chicken = new THREE.Group();
    
      // Create chicken body
      const body = createBody();
      chicken.add(body);
    
      // Create chicken rowel (foot)
      const rowel = createRowel();
      chicken.add(rowel);
    
      return chicken;
    }
    
    // Function to create the body of the chicken
    function createBody() {
      const body = new THREE.Mesh(
        new THREE.BoxBufferGeometry(chickenSize * zoom, chickenSize * zoom, 20 * zoom),
        new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
      );
      body.position.z = 10 * zoom;
      body.castShadow = true;
      body.receiveShadow = true;
      return body;
    }
    
    // Function to create the rowel (foot) of the chicken
    function createRowel() {
      const rowel = new THREE.Mesh(
        new THREE.BoxBufferGeometry(2 * zoom, 4 * zoom, 2 * zoom),
        new THREE.MeshLambertMaterial({ color: 0xf0619a, flatShading: true })
      );
      rowel.position.z = 21 * zoom;
      rowel.castShadow = true;
      rowel.receiveShadow = false;
      return rowel;
    }
    
    
    function Road() {
      const road = new THREE.Group();
    
      // Helper function to create a road section with a specific color and offset
      const createSection = (color, offsetX = 0) => {
        const section = new THREE.Mesh(
          new THREE.PlaneBufferGeometry(boardWidth * zoom, positionWidth * zoom),
          new THREE.MeshPhongMaterial({ color })
        );
        section.position.x = offsetX;
        return section;
      };
    
      // Create the three sections of road: middle, left, and right
      const middle = createSection(0x454a59); // Road color in the middle
      middle.receiveShadow = true;
      road.add(middle);
    
      const left = createSection(0x393d49, -boardWidth * zoom); // Left road section
      road.add(left);
    
      const right = createSection(0x393d49, boardWidth * zoom); // Right road section
      road.add(right);
    
      return road;
    }
    
    
    function Grass() {
      const grass = new THREE.Group();
    
      // Helper function to create a grass section with a specific color
      const createSection = (color, offsetX = 0) => {
        const section = new THREE.Mesh(
          new THREE.BoxBufferGeometry(boardWidth * zoom, positionWidth * zoom, 3 * zoom),
          new THREE.MeshPhongMaterial({ color })
        );
        section.position.x = offsetX;
        return section;
      };
    
      // Create the three sections of grass: middle, left, and right
      const middle = createSection(0xbaf455); // Grass color in the middle
      middle.receiveShadow = true;
      grass.add(middle);
    
      const left = createSection(0x99c846, -boardWidth * zoom); // Left grass section
      grass.add(left);
    
      const right = createSection(0x99c846, boardWidth * zoom); // Right grass section
      grass.add(right);
    
      // Adjust the z-position of the grass group
      grass.position.z = 1.5 * zoom;
    
      return grass;
    }
    
    function Lane(index) {
      this.index = index;
      this.type =
        index <= 0
          ? "field"
          : laneTypes[Math.floor(Math.random() * laneTypes.length)];
    
      switch (this.type) {
        case "field": {
          this.type = "field";
          this.mesh = new Grass();
          break;
        }
        case "forest": {
          this.mesh = new Grass();
    
          this.occupiedPositions = new Set();
          this.threes = [1, 2, 3, 4].map(() => {
            const three = new Three();
            let position;
            do {
              position = Math.floor(Math.random() * columns);
            } while (this.occupiedPositions.has(position));
            this.occupiedPositions.add(position);
            three.position.x =
              (position * positionWidth + positionWidth / 2) * zoom -
              (boardWidth * zoom) / 2;
            this.mesh.add(three);
            return three;
          });
          break;
        }
        case "car": {
          this.mesh = new Road();
          this.direction = Math.random() >= 0.5;
    
          const occupiedPositions = new Set();
          this.vechicles = [1, 2, 3].map(() => {
            const vechicle = new Car();
            let position;
            do {
              position = Math.floor((Math.random() * columns) / 2);
            } while (occupiedPositions.has(position));
            occupiedPositions.add(position);
            vechicle.position.x =
              (position * positionWidth * 2 + positionWidth / 2) * zoom -
              (boardWidth * zoom) / 2;
            if (!this.direction) vechicle.rotation.z = Math.PI;
            this.mesh.add(vechicle);
            return vechicle;
          });
    
          this.speed = laneSpeeds[Math.floor(Math.random() * laneSpeeds.length)];
          break;
        }
        case "truck": {
          this.mesh = new Road();
          this.direction = Math.random() >= 0.5;
    
          const occupiedPositions = new Set();
          this.vechicles = [1, 2].map(() => {
            const vechicle = new Truck();
            let position;
            do {
              position = Math.floor((Math.random() * columns) / 3);
            } while (occupiedPositions.has(position));
            occupiedPositions.add(position);
            vechicle.position.x =
              (position * positionWidth * 3 + positionWidth / 2) * zoom -
              (boardWidth * zoom) / 2;
            if (!this.direction) vechicle.rotation.z = Math.PI;
            this.mesh.add(vechicle);
            return vechicle;
          });
    
          this.speed = laneSpeeds[Math.floor(Math.random() * laneSpeeds.length)];
          break;
        }
      }
    }
    
    // document.querySelector("#retry").addEventListener("click", () => {
    //   lanes.forEach((lane) => scene.remove(lane.mesh));
    //   resetGameValues();
    //   counterDOM.innerHTML = 0;
    //   endDOM.style.visibility = "hidden";
    // });
    
    // biến xác định lần đầu chơi game
    let isFirstStartGame = false;
    document.querySelector("#start-game").addEventListener("click", () => {
      if(isFirstStartGame){
        lanes.forEach((lane) => scene.remove(lane.mesh));
        resetGameValues();
      }
      counterDOM.innerHTML = 0;
      boxScoreDOM.style.visibility = "hidden";
      detalScoreDOM.style.visibility = "hidden";
      isFirstStartGame = true;
    });
    
    document
      .getElementById("forward")
      .addEventListener("click", () => move("forward"));
    
    document
      .getElementById("backward")
      .addEventListener("click", () => move("backward"));
    
    document.getElementById("left").addEventListener("click", () => move("left"));
    
    document.getElementById("right").addEventListener("click", () => move("right"));
    
    window.addEventListener("keydown", (event) => {
      if (event.keyCode == "38") {
        // up arrow
        move("forward");
      } else if (event.keyCode == "40") {
        // down arrow
        move("backward");
      } else if (event.keyCode == "37") {
        // left arrow
        move("left");
      } else if (event.keyCode == "39") {
        // right arrow
        move("right");
      }
    });
    
    function move(direction) {
      const styleVisibilityboxScoreDOM = window.getComputedStyle(boxScoreDOM).visibility;
      
      if (styleVisibilityboxScoreDOM === "hidden") {
        const finalPositions = calculateFinalPositions();
    
        if (canMove(direction, finalPositions)) {
          handleMovement(direction, finalPositions);
          moves.push(direction);
        }
      }
    }
    
    // Function to calculate the final position based on moves array
    function calculateFinalPositions() {
      return moves.reduce(
        (position, move) => {
          switch (move) {
            case "forward":
              return { lane: position.lane + 1, column: position.column };
            case "backward":
              return { lane: position.lane - 1, column: position.column };
            case "left":
              return { lane: position.lane, column: position.column - 1 };
            case "right":
              return { lane: position.lane, column: position.column + 1 };
            default:
              return position;
          }
        },
        { lane: currentLane, column: currentColumn }
      );
    }
    
    // Function to check if the move is valid (no collision and within bounds)
    function canMove(direction, finalPositions) {
      switch (direction) {
        case "forward":
          return canMoveForward(finalPositions);
        case "backward":
          return canMoveBackward(finalPositions);
        case "left":
          return canMoveLeft(finalPositions);
        case "right":
          return canMoveRight(finalPositions);
        default:
          return false;
      }
    }
    
    // Check if moving forward is valid
    function canMoveForward(finalPositions) {
      if (lanes[finalPositions.lane + 1]?.type === "forest" && lanes[finalPositions.lane + 1].occupiedPositions.has(finalPositions.column)) {
        return false;
      }
      if (!stepStartTimestamp) startMoving = true;
      return true;
    }
    
    // Check if moving backward is valid
    function canMoveBackward(finalPositions) {
      if (finalPositions.lane === 0) return false;
      if (lanes[finalPositions.lane - 1]?.type === "forest" && lanes[finalPositions.lane - 1].occupiedPositions.has(finalPositions.column)) {
        return false;
      }
      if (!stepStartTimestamp) startMoving = true;
      return true;
    }
    
    // Check if moving left is valid
    function canMoveLeft(finalPositions) {
      if (finalPositions.column === 0) return false;
      if (lanes[finalPositions.lane]?.type === "forest" && lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column - 1)) {
        return false;
      }
      if (!stepStartTimestamp) startMoving = true;
      return true;
    }
    
    // Check if moving right is valid
    function canMoveRight(finalPositions) {
      if (finalPositions.column === columns - 1) return false;
      if (lanes[finalPositions.lane]?.type === "forest" && lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column + 1)) {
        return false;
      }
      if (!stepStartTimestamp) startMoving = true;
      return true;
    }
    
    // Function to handle the movement action based on direction
    function handleMovement(direction, finalPositions) {
      switch (direction) {
        case "forward":
          addLane();
          break;
        case "backward":
          break; // No additional actions needed for backward
        case "left":
          break; // No additional actions needed for left
        case "right":
          break; // No additional actions needed for right
      }
    }
    
    
    function animate(timestamp) {
      requestAnimationFrame(animate);
    
      if (!previousTimestamp) previousTimestamp = timestamp;
      const delta = timestamp - previousTimestamp;
      previousTimestamp = timestamp;
    
      // Handle vehicle animation (car and truck movements)
      animateVehicles(delta);
    
      // Handle chicken movement
      if (startMoving) {
        stepStartTimestamp = timestamp;
        startMoving = false;
      }
    
      if (stepStartTimestamp) {
        handleChickenMovement(timestamp, delta);
      }
    
      // Collision detection
      checkCollisions();
    
      // Render the scene
      renderer.render(scene, camera);
    }
    
    // Separate function to handle vehicle animation
    function animateVehicles(delta) {
      lanes.forEach((lane) => {
        if (lane.type === "car" || lane.type === "truck") {
          const laneBounds = getLaneBounds();
          lane.vechicles.forEach((vechicle) => {
            if (lane.direction) {
              moveVehicleForward(vechicle, lane, delta, laneBounds);
            } else {
              moveVehicleBackward(vechicle, lane, delta, laneBounds);
            }
          });
        }
      });
    }
    
    // Function to get lane bounds
    function getLaneBounds() {
      return {
        beforeStart: (-boardWidth * zoom) / 2 - positionWidth * 2 * zoom,
        afterEnd: (boardWidth * zoom) / 2 + positionWidth * 2 * zoom
      };
    }
    
    // Function to move vehicle forward
    function moveVehicleForward(vechicle, lane, delta, laneBounds) {
      if (vechicle.position.x < laneBounds.beforeStart) {
        vechicle.position.x = laneBounds.afterEnd;
      } else {
        vechicle.position.x -= (lane.speed / 16) * delta;
      }
    }
    
    // Function to move vehicle backward
    function moveVehicleBackward(vechicle, lane, delta, laneBounds) {
      if (vechicle.position.x > laneBounds.afterEnd) {
        vechicle.position.x = laneBounds.beforeStart;
      } else {
        vechicle.position.x += (lane.speed / 16) * delta;
      }
    }
    
    // Function to handle chicken's movement
    function handleChickenMovement(timestamp, delta) {
      const moveDeltaTime = timestamp - stepStartTimestamp;
      const moveDeltaDistance = Math.min(moveDeltaTime / stepTime, 1) * positionWidth * zoom;
      const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime / stepTime, 1) * Math.PI) * 8 * zoom;
    
      const movementData = getMovementData(moveDeltaDistance, jumpDeltaDistance);
      applyChickenMovement(movementData);
      
      // Once a step has ended
      if (moveDeltaTime > stepTime) {
        updatePositionAfterMove();
        stepStartTimestamp = moves.length === 0 ? null : timestamp;
      }
    }
    
    // Function to calculate movement data
    function getMovementData(moveDeltaDistance, jumpDeltaDistance) {
      let positionX = chicken.position.x;
      let positionY = chicken.position.y;
    
      switch (moves[0]) {
        case "forward":
          positionY = currentLane * positionWidth * zoom + moveDeltaDistance;
          break;
        case "backward":
          positionY = currentLane * positionWidth * zoom - moveDeltaDistance;
          break;
        case "left":
          positionX = (currentColumn * positionWidth + positionWidth / 2) * zoom - (boardWidth * zoom) / 2 - moveDeltaDistance;
          break;
        case "right":
          positionX = (currentColumn * positionWidth + positionWidth / 2) * zoom - (boardWidth * zoom) / 2 + moveDeltaDistance;
          break;
      }
    
      return { positionX, positionY, jumpDeltaDistance };
    }
    
    // Function to apply the movement to chicken
    function applyChickenMovement({ positionX, positionY, jumpDeltaDistance }) {
      camera.position.y = initialCameraPositionY + positionY;
      dirLight.position.y = initialDirLightPositionY + positionY;
      chicken.position.set(positionX, positionY, jumpDeltaDistance);
    
      camera.position.x = initialCameraPositionX + positionX;
      dirLight.position.x = initialDirLightPositionX + positionX;
    }
    
    // Function to update chicken's position after move
    function updatePositionAfterMove() {
      switch (moves[0]) {
        case "forward":
          currentLane++;
          break;
        case "backward":
          currentLane--;
          break;
        case "left":
          currentColumn--;
          break;
        case "right":
          currentColumn++;
          break;
      }
      counterDOM.innerHTML = currentLane;
      moves.shift();
    }
    
    // Collision detection logic
    function checkCollisions() {
      if (lanes[currentLane].type === "car" || lanes[currentLane].type === "truck") {
        const chickenBounds = getChickenBounds();
        lanes[currentLane].vechicles.forEach((vechicle) => {
          const vehicleBounds = getVehicleBounds(vechicle, lanes[currentLane].type);
          if (isColliding(chickenBounds, vehicleBounds)) {
            handleCollision();
          }
        });
      }
    }
    
    // Function to get the bounds of the chicken
    function getChickenBounds() {
      return {
        minX: chicken.position.x - (chickenSize * zoom) / 2,
        maxX: chicken.position.x + (chickenSize * zoom) / 2
      };
    }
    
    // Function to get the bounds of a vehicle
    function getVehicleBounds(vechicle, vehicleType) {
      const vehicleLength = { car: 60, truck: 105 }[vehicleType];
      return {
        minX: vechicle.position.x - (vehicleLength * zoom) / 2,
        maxX: vechicle.position.x + (vehicleLength * zoom) / 2
      };
    }
    
    // Function to check if there is a collision
    function isColliding(chickenBounds, vehicleBounds) {
      return chickenBounds.maxX > vehicleBounds.minX && chickenBounds.minX < vehicleBounds.maxX;
    }
    
    // Handle the collision (e.g., game over or score update)
    function handleCollision() {
      const localStorageScore = localStorage.getItem('crossy-road-best-score') || 0;
      if (currentLane > localStorageScore) {
        localStorage.setItem('crossy-road-best-score', currentLane);
      }
      saveHighScore(currentLane)
      bestScoreDOM.innerHTML = Math.max(currentLane, localStorageScore);
      resultScoreDOM.innerHTML = currentLane;
      boxScoreDOM.style.visibility = "visible";
      detalScoreDOM.style.visibility = "visible";
    }

    // Lưu điểm vào danh sách
    function saveHighScore(value) {
      let highScores = JSON.parse(localStorage.getItem('crossy-road-game-highScores')) || [];
      const name = localStorage.getItem("username-crossy-road-game");
      const score = parseInt(value);

      if (name && !isNaN(score)) {
        const isDuplicate = highScores.some(entry => entry.name === name && entry.score === score);
        if (!isDuplicate) {
          // Thêm điểm mới vào danh sách
          highScores.push({ name, score });
        }
    
        // Sắp xếp danh sách theo điểm giảm dần
        highScores.sort((a, b) => b.score - a.score);
    
        // Chỉ giữ lại 5 điểm cao nhất
        highScores = highScores.slice(0, 5);

        // Lưu vào localStorage
        localStorage.setItem('crossy-road-game-highScores', JSON.stringify(highScores));
    
        // Hiển thị lại bảng điểm
        displayHighScores(highScores);
      }
    }
    
    function displayHighScores(highScores) {
      while (highScoreTable.rows.length > 1) {
        highScoreTable.deleteRow(1);
      }
      highScores.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${entry.name}</td>
          <td>${entry.score}</td>
        `;
        highScoreTable.appendChild(row);
      });
    }

    requestAnimationFrame(animate);
  }
})
