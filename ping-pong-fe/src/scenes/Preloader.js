import { Scene } from "phaser";
import paddle from "../assets/paddle.png";
export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
  }

  preload() {
    this.load.image("paddle", paddle);
  }

  create() {
    this.scene.start("Game");
  }
}
