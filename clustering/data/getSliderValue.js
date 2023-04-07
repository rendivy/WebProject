const slider = document.getElementById("centroid-slider");
const display = document.getElementById("centroid-display");
display.textContent = slider.value;

slider.oninput = function() {
    display.textContent = this.value;
};
