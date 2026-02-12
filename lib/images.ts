type ImageRange = {
  maxDays: number;
  src: string;
  alt: string;
};

const imageRanges: ImageRange[] = [
  { maxDays: 0, src: "/img/wipeout.png", alt: "Fresh wipeout!" },
  { maxDays: 2, src: "/img/ski_lift.png", alt: "Riding the lift with confidence" },
  { maxDays: 5, src: "/img/groomer.png", alt: "Back on the groomers" },
  { maxDays: Infinity, src: "/img/catch_air.png", alt: "Catching air — on a streak!" },
];

export function getImageForDays(days: number): { src: string; alt: string } {
  for (const range of imageRanges) {
    if (days <= range.maxDays) {
      return { src: range.src, alt: range.alt };
    }
  }
  return { src: imageRanges[imageRanges.length - 1].src, alt: imageRanges[imageRanges.length - 1].alt };
}
