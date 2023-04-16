const slider = document.getElementById("centroid-slider");
const display = document.getElementById("centroid-display");
display.textContent = slider.value;

slider.oninput = function() {
    display.textContent = this.value;
};



const epsSlider = document.getElementById("eps-slider");
const displayEPS = document.getElementById("eps-display");

displayEPS.textContent = epsSlider.value;

epsSlider.oninput = function() {
    displayEPS.textContent = this.value;
};
