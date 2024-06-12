document.addEventListener("input", () => {
    document.querySelectorAll("textarea").forEach((el: HTMLTextAreaElement) => {
        el.style.height = "0px";
        el.style.height = el.scrollHeight + "px";
    });
});
