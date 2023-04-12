const canvas = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const buttons = document.getElementById("button")
let dots = [];


canvas.addEventListener("mousedown", handleMouseDown);
canvas2.addEventListener("mousedown", handleMouseDownDB)
window.addEventListener("resize", resizeCanvas);


function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas2.width = canvas.offsetWidth;
    canvas2.height = canvas.offsetHeight;
    drawDots();
}
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dots.push([x, y]);
    drawDots();
    drawDotsDB()
}

function handleMouseDownDB(e) {
    const rect = canvas2.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dots.push([x, y]);
    drawDots();
    drawDotsDB()
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";
    dots.forEach(([x, y]) => {
        drawCircleMeans(x, y);
        drawCircleScan(x, y);
    });
}

function drawDotsDB() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.fillStyle = "#000000";
    ctx2.strokeStyle = "#000000";
    dots.forEach(([x, y]) => {
        drawCircleMeans(x, y);
        drawCircleScan(x, y);
    });
}

function drawCircleMeans(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawCircleScan(x, y) {
    ctx2.beginPath();
    ctx2.arc(x, y, 15, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.stroke();
}

canvas.clear = function () {
    ctx.clearRect(0, 0, 15000, 15000);
    ctx2.clearRect(0, 0, 15000, 15000);
    dots.length = 0;
}


function compare(){
    clusterMeans()
    runDBSCAN()
}


resizeCanvas();

