import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");

    this.playerAPaddle;
    this.playerBPaddle;
    this.paddleSpeed = 10;
  }

  create() {
    this.createPaddles();
    this.createBall();
  }

  createPaddles() {
    this.playerAPaddle = this.physics.add
      .image(20, this.scale.canvas.height / 2, "paddle")
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25);

    this.playerBPaddle = this.physics.add
      .image(
        this.scale.canvas.width - 20,
        this.scale.canvas.height / 2,
        "paddle"
      )
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25);

    this.createPaddlesListener();
  }

  createPaddlesListener() {
    this.input.keyboard.on("keydown", (event) => {
      if (event.key === "ArrowUp") {
        this.playerAPaddle.setY(this.playerAPaddle.y - this.paddleSpeed);
      } else if (event.key === "ArrowDown") {
        this.playerAPaddle.setY(this.playerAPaddle.y + this.paddleSpeed);
      }
    });
  }

  createBall() {
    this.ball = this.physics.add
      .image(100, 100, "ball")
      .setTintFill(0xffffff)
      .setScale(0.05);
  }
}
