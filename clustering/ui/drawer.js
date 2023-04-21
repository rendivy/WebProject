const firstCanvas = document.getElementById("canvas1")
const firstContext = firstCanvas.getContext("2d")

const secondCanvas = document.getElementById("canvas2")
const secondContext = secondCanvas.getContext("2d")


const thirdCanvas = document.getElementById("canvas3")
const thirdContext = thirdCanvas.getContext("2d")

const buttons = document.getElementById("button")
let points = []
let dragIndex = -1

firstCanvas.addEventListener("mousedown", handleMouseDown)
firstCanvas.addEventListener("mousemove", handleMouseMove)
firstCanvas.addEventListener("mouseup", handleMouseUp)
firstCanvas.addEventListener("contextmenu", handleContextMenu)

secondCanvas.addEventListener("mousedown", handleMouseDownDB)
secondCanvas.addEventListener("mousemove", handleMouseMoveDB)
secondCanvas.addEventListener("mouseup", handleMouseUpDB);
secondCanvas.addEventListener("contextmenu", handleContextMenu)

thirdCanvas.addEventListener("mousedown", handleMouseDownHierarchy)
thirdCanvas.addEventListener("mousemove", handleMouseMoveHierarchy)
thirdCanvas.addEventListener("mouseup", handleMouseUpDB);
thirdCanvas.addEventListener("contextmenu", handleContextMenu)


window.addEventListener("resize", resizeCanvas)

function handleContextMenu(e, canvas) {
    e.preventDefault();
    const rect = secondCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const index = points.findIndex(([dotX, dotY]) => {
        const dx = x - dotX;
        const dy = y - dotY;
        return dx * dx + dy * dy <= 225; // 15^2
    });
    if (index >= 0) {
        points.splice(index, 1);
        drawDots();
        drawDotsDB();
        drawDotsHierarchy()
    }
}

function resizeCanvas() {
    firstCanvas.width = firstCanvas.offsetWidth;
    firstCanvas.height = firstCanvas.offsetHeight;
    secondCanvas.width = firstCanvas.offsetWidth;
    secondCanvas.height = firstCanvas.offsetHeight;
    thirdCanvas.width = firstCanvas.offsetWidth;
    thirdCanvas.height = firstCanvas.offsetHeight;
    drawDots();
}



function handleMouseDownHierarchy(e) {
    const rect = thirdCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dragIndex = points.findIndex(([dotX, dotY]) => {
        const dx = x - dotX;
        const dy = y - dotY;
        return dx * dx + dy * dy <= 225;
    });
    if (dragIndex === -1) {
        points.push([x, y]);
        drawDots();
        drawDotsDB();
        drawDotsHierarchy()
    }
}

function handleMouseMoveHierarchy(e) {
    if (dragIndex >= 0) {
        const rect = thirdCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points[dragIndex] = [x, y];
        drawDots();
        drawDotsDB();
        drawDotsHierarchy();
    }
}

function handleMouseDown(e) {
    const rect = firstCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dragIndex = points.findIndex(([dotX, dotY]) => {
        const dx = x - dotX;
        const dy = y - dotY;
        return dx * dx + dy * dy <= 225; // 15^2
    });
    if (dragIndex === -1) {
        points.push([x, y])
        drawDots()
        drawDotsDB()
        drawDotsHierarchy()
    }
}

function handleMouseMove(e) {
    if (dragIndex >= 0) {
        const rect = firstCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points[dragIndex] = [x, y];
        drawDots()
        drawDotsDB()
        drawDotsHierarchy()
    }
}

function handleMouseUp() {
    dragIndex = -1;
}

function handleMouseDownDB(e) {
    const rect = secondCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dragIndex = points.findIndex(([dotX, dotY]) => {
        const dx = x - dotX;
        const dy = y - dotY;
        return dx * dx + dy * dy <= 225;
    });
    if (dragIndex === -1) {
        points.push([x, y]);
        drawDots();
        drawDotsDB();
        drawDotsHierarchy()
    }
}

function handleMouseMoveDB(e) {
    if (dragIndex >= 0) {
        const rect = secondCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points[dragIndex] = [x, y];
        drawDots();
        drawDotsDB();
        drawDotsHierarchy();
    }
}

function handleMouseUpDB() {
    dragIndex = -1;
}

function drawDots() {
    firstContext.clearRect(0, 0, firstCanvas.width, firstCanvas.height);
    firstContext.fillStyle = "#000000";
    firstContext.strokeStyle = "#000000";
    points.forEach(([x, y]) => {
        drawCircleMeans(x, y)
        drawCircleScan(x, y)
        drawCircleHierarchy(x, y)

    });
}

function drawDotsHierarchy() {
    thirdContext.clearRect(0, 0, thirdCanvas.width, thirdCanvas.height);
    thirdContext.fillStyle = "#000000";
    thirdContext.strokeStyle = "#000000";
    points.forEach(([x, y]) => {
        drawCircleMeans(x, y)
        drawCircleScan(x, y)
        drawCircleHierarchy(x, y)
    });
}

function drawDotsDB() {
    secondContext.clearRect(0, 0, secondCanvas.width, secondCanvas.height);
    secondContext.fillStyle = "#000000";
    secondContext.strokeStyle = "#000000";
    points.forEach(([x, y]) => {
        drawCircleMeans(x, y)
        drawCircleScan(x, y)
        drawCircleHierarchy(x, y)
    });
}


function drawCircleMeans(x, y) {
    firstContext.beginPath();
    firstContext.arc(x, y, 10, 0, Math.PI * 2);
    firstContext.fill();
    firstContext.stroke();
}

function drawCircleScan(x, y) {
    secondContext.beginPath();
    secondContext.arc(x, y, 10, 0, Math.PI * 2);
    secondContext.fill();
    secondContext.stroke();
}

function drawCircleHierarchy(x, y) {
    thirdContext.beginPath();
    thirdContext.arc(x, y, 10, 0, Math.PI * 2);
    thirdContext.fill();
    thirdContext.stroke();
}


firstCanvas.clear = function () {
    firstContext.clearRect(0, 0, 15000, 15000);
    secondContext.clearRect(0, 0, 15000, 15000);
    thirdContext.clearRect(0, 0, 15000, 15000);
    points.length = 0;
}


function compare() {
    clusterMeans()
    runDBSCAN()
    runHierarchyAlgorithm()
}


resizeCanvas();

