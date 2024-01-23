document.addEventListener("input", () => {
    document.querySelectorAll("textarea").forEach((el) => {
        el.style.height = "0px";
        el.style.height = el.scrollHeight + "px";
    });
});
