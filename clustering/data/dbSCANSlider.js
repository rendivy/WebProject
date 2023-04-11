const sliderDB = document.getElementById("dbscan-slider");
const displayDB = document.getElementById("dbscan-display");

displayDB.textContent = sliderDB.value;

sliderDB.oninput = function() {
    displayDB.textContent = this.value;
};


