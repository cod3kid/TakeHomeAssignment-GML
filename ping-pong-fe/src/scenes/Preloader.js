import { Scene } from "phaser";
import paddle from "../assets/paddle.png";
import ball from "../assets/ball.png";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
  }

  preload() {
    this.load.image("paddle", paddle);
    this.load.image("ball", ball);
  }

  create() {
    this.scene.start("Game");
  }
}
