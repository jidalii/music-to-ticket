document.addEventListener('DOMContentLoaded', function () {
    const interactiveSections = document.querySelectorAll('.interactive-section');

    interactiveSections.forEach(section => {
        section.addEventListener('click', function () {
            alert(`You clicked on the "${section.querySelector('h2').innerText}" section!`);
        });
    });
});