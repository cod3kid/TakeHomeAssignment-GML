import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");

    this.playerPaddle;
    this.opponentPaddle;
    this.socket;
    this.ball;
    this.paddleSpeed = 10;
  }

  create() {
    this.createWebSocketCommunication();
    this.createPaddle();
    this.createBall();
  }

  createWebSocketCommunication() {
    this.socket = new WebSocket("ws://localhost:8000/ws");

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      // Update opponent paddle position
      if (data.opponentY !== undefined) {
        this.opponentPaddle.y = data.opponentY;
      }

      // Update ball position
      if (data.ballX !== undefined && data.ballY !== undefined) {
        ball.setPosition(data.ballX, data.ballY);
      }
    };
  }

  createPaddle() {
    this.playerPaddle = this.physics.add
      .image(20, this.scale.canvas.height / 2, "paddle")
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25);

    this.opponentPaddle = this.physics.add
      .image(
        this.scale.canvas.width - 20,
        this.scale.canvas.height / 2,
        "paddle"
      )
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25);

    this.createPaddleListener();
  }

  createPaddleListener() {
    this.input.keyboard.on("keydown", (event) => {
      if (event.key === "ArrowUp") {
        this.playerPaddle.setY(this.playerPaddle.y - this.paddleSpeed);
        this.socket.send(JSON.stringify({ playerA: this.playerPaddle.y }));
      } else if (event.key === "ArrowDown") {
        this.playerPaddle.setY(this.playerPaddle.y + this.paddleSpeed);
        this.socket.send(JSON.stringify({ playerY: this.playerPaddle.y }));
      }
    });
  }

  createBall() {
    this.ball = this.physics.add
      .image(this.cameras.main.width / 2, this.cameras.main.height / 2, "ball")
      .setTintFill(0xffffff)
      .setScale(0.05);
  }
}
