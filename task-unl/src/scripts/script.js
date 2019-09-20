let mainNav = document.querySelector('.main-nav')
document.onclick = (e) => {
    if (e.target.closest(".burger-btn")) {
        mainNav.classList.toggle("visible");
    } else {
        mainNav.classList.remove("visible");
    }
};

$(document).ready(function(){
    $('.slider').slick({
        fade: true,
        dots: true,
    });
});
