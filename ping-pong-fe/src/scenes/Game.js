import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");

    this.playerPaddle;
    this.opponentPaddle;
    this.socket;
    this.ball;
    this.paddleSpeed = 10;
    this.playerId;
    this.opponentId;
  }

  create() {
    this.createWebSocketCommunication();
    this.createPaddle();
    this.createBall();
  }

  createWebSocketCommunication() {
    this.socket = new WebSocket("ws://localhost:8000/ws");

    this.socket.onmessage = (event) => {
      const { type, message } = JSON.parse(event.data);

      if (type === "init") {
        this.playerId = message.player_id;
        console.log("Assigned Player ID:", this.playerId);

        if (this.playerId === "player1") {
          console.log("You are Player A. Waiting for Player B...");
        } else if (this.playerId === "player2") {
          console.log("You are Player B. Game starts now!");
        }
      } else if (type === "waiting") {
        console.log(message);
      } else if (type === "movement") {
        this.opponentPaddle.setY(message.playerPosY);
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
        this.socket.send(JSON.stringify({ posY: this.playerPaddle.y }));
      } else if (event.key === "ArrowDown") {
        this.playerPaddle.setY(this.playerPaddle.y + this.paddleSpeed);
        this.socket.send(JSON.stringify({ posY: this.playerPaddle.y }));
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
