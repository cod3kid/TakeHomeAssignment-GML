import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");

    this.playerPaddle;
    this.opponentPaddle;
    this.socket;
    this.ball;
    this.paddleSpeed = 50;
    this.playerId;
    this.opponentId;
    this.topBoundaryCollider;
    this.bottomBoundaryCollider;
    this.scoreText;
    this.scoreValueText;
  }

  create() {
    this.createWebSocketCommunication();
    this.createPaddle();
    this.createBall();
    this.createBoundaries();
    this.createBallBoundaryColliders();
    this.createBallPaddleCollider();
    this.createScoreBoard();
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

          const randomX =
            Phaser.Math.Between(100, 200) * (Math.random() < 0.5 ? 1 : -1);
          const randomY =
            Phaser.Math.Between(100, 200) * (Math.random() < 0.5 ? 1 : -1);
          this.ball.setVelocity(randomX, randomY);
          this.socket.send(
            JSON.stringify({
              ballVelocity: {
                x: randomX,
                y: randomY,
              },
            })
          );
        }
      } else if (type === "waiting") {
        console.log(message);
      } else if (type === "movement") {
        if (message.playerPosY) {
          this.opponentPaddle.setY(message.playerPosY);
        }

        if (message.ballVelocity) {
          this.ball.setVelocity(
            -message.ballVelocity.x,
            message.ballVelocity.y
          );
        }
      }
    };
  }

  createPaddle() {
    this.playerPaddle = this.physics.add
      .image(20, this.scale.canvas.height / 2, "paddle")
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25)
      .setImmovable(true);

    this.opponentPaddle = this.physics.add
      .image(
        this.scale.canvas.width - 20,
        this.scale.canvas.height / 2,
        "paddle"
      )
      .setTintFill(0xff0000)
      .setScale(0.0625, 0.25)
      .setImmovable(true);

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

  createScoreBoard() {
    this.scoreText = this.add
      .text(this.cameras.main.width / 2, 50, "Score: ", {
        fontSize: "26px",
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(this.scoreText.x + this.scoreText.displayWidth / 2, 50, " 0", {
        fontSize: "26px",
      })
      .setOrigin(0.5, 0.5);
  }

  createBoundaries() {
    this.topBoundary = this.add
      .rectangle(
        this.playerPaddle.displayWidth,
        0,
        this.cameras.main.width - this.playerPaddle.displayWidth * 2 - 20,
        10,
        0xffffff
      )
      .setOrigin(0);

    this.bottomBoundary = this.add
      .rectangle(
        this.playerPaddle.displayWidth,
        this.cameras.main.height - 10,
        this.cameras.main.width - this.playerPaddle.displayWidth * 2 - 20,
        10,
        0xffffff
      )
      .setOrigin(0);

    this.physics.add.existing(this.topBoundary);
    this.physics.add.existing(this.bottomBoundary);

    this.topBoundary.body.immovable = true;
    this.bottomBoundary.body.immovable = true;
  }

  createBallBoundaryColliders() {
    this.physics.add.collider(this.ball, this.topBoundary, () => {
      const newVelocityX = this.ball.body.velocity.x * 1.05;
      const newVelocityY =
        this.ball.body.velocity.y + Phaser.Math.Between(-50, 50);

      this.ball.setVelocity(newVelocityX, newVelocityY);
      this.socket.send(
        JSON.stringify({
          ballVelocity: {
            x: newVelocityX,
            y: newVelocityY,
          },
        })
      );
    });

    this.physics.add.collider(this.ball, this.bottomBoundary, () => {
      const newVelocityX = this.ball.body.velocity.x * 1.05;
      const newVelocityY =
        this.ball.body.velocity.y + Phaser.Math.Between(-50, 50);

      this.ball.setVelocity(newVelocityX, newVelocityY);

      this.socket.send(
        JSON.stringify({
          ballVelocity: {
            x: newVelocityX,
            y: newVelocityY,
          },
        })
      );
    });
  }

  createBallPaddleCollider() {
    this.physics.add.collider(this.ball, this.playerPaddle, () => {
      const newVelocityX =
        this.ball.body.velocity.x + Phaser.Math.Between(-50, 50);
      const newVelocityY = this.ball.body.velocity.y * 1.05;

      this.ball.setVelocity(newVelocityX, newVelocityY);

      this.socket.send(
        JSON.stringify({
          ballVelocity: {
            x: newVelocityX,
            y: newVelocityY,
          },
        })
      );
    });
  }
}
