const textContainers = document.querySelectorAll('.text-container');
textContainers.forEach((container, index) => {
    setTimeout(() => {
        container.style.opacity = 1;
    }, 1000 * index);
});
