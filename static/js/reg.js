var curStep = 0;

const regCarouselEl = document.getElementById("js-reg-carousel");

function setCarouselStep() {
    console.log("Текущий шаг -", curStep);
    let transformValue = "translateY(-" + curStep * 33 + "%);";
    regCarouselEl.style = "transform: " + transformValue;
}

const backButtons = document.querySelectorAll(".js-back");
backButtons.forEach((el) => {
    el.onclick = () => {
        curStep -= 1;
        setCarouselStep();
    }
});

const nextButtons = document.querySelectorAll(".js-next");
nextButtons.forEach((el) => {
    el.onclick = () => {
        curStep += 1;
        setCarouselStep();
    }
});
