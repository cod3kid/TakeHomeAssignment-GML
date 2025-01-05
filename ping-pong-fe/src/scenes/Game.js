import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");

    this.playerAPaddle;
    this.playerBPaddle;
  }

  create() {
    this.createPaddles();
  }

  createPaddles() {
    this.playerAPaddle = this.add
      .image(20, this.scale.canvas.height / 2, "paddle")
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25);

    this.playerBPaddle = this.add
      .image(
        this.scale.canvas.width - 20,
        this.scale.canvas.height / 2,
        "paddle"
      )
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25);
  }
}
