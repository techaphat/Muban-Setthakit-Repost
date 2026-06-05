const track = document.getElementById("storyTrack");

function scrollStories(direction) {
  if (!track) return;

  const firstSlide = track.querySelector(".story-slide");
  const slideWidth = firstSlide ? firstSlide.offsetWidth + 34 : 600;

  track.scrollBy({
    left: direction * slideWidth,
    behavior: "smooth"
  });
}

document.querySelectorAll(".story-slide").forEach((card) => {
  card.addEventListener("touchstart", () => {
    card.classList.add("is-touching");
  });

  card.addEventListener("touchend", () => {
    setTimeout(() => {
      card.classList.remove("is-touching");
    }, 700);
  });
});
