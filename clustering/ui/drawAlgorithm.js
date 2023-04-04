const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const circleColor = "#000000FF";
let dots = [];

canvas.addEventListener("mousedown", handleMouseDown);
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawDots();
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dots.push([x, y]);
    drawDots();
    drawCircle(x, y);
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";
    dots.forEach(([x, y]) => {
        drawCircle(x, y);
    });
}

function drawCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

canvas.clear = function () {
    ctx.clearRect(0,0, 15000, 15000);
    dots.length = 0;
}

resizeCanvas();
