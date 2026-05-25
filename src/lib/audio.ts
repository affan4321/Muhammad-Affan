import { Howl } from "howler";

export const createAmbient = (src: string) => {
  return new Howl({
    src: [src],
    loop: true,
    volume: 0.6,
    html5: true,
  });
};

export const createMusic = (src: string) => {
  return new Howl({
    src: [src],
    loop: true,
    volume: 0.5,
    html5: true,
  });
};
