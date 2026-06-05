console.log("หมู่บ้านเศรษฐกิจ REPOST loaded");

// ทำให้บนมือถือแตะการ์ดแล้วเหมือน hover
document.querySelectorAll(".story-card").forEach((card) => {
  card.addEventListener("touchstart", () => {
    card.classList.add("is-touching");
  });

  card.addEventListener("touchend", () => {
    setTimeout(() => {
      card.classList.remove("is-touching");
    }, 600);
  });
});
