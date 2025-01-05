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
    this.scoreAText;
    this.scoreBText;
    this.scoreAValueText;
    this.scoreBValueText;
    this.scoreA = 0;
    this.scoreB = 0;
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

          const { randomX, randomY } = this.getRandomBallVelocity();
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
        if (message.posY) {
          this.opponentPaddle.setY(message.posY);
        }

        if (message.ballVelocity) {
          this.ball.setVelocity(
            -message.ballVelocity.x,
            message.ballVelocity.y
          );
        }
      } else if (type === "updateScore") {
        const { scoreA, scoreB } = message;
        this.scoreAValueText.setText(scoreB);
        this.scoreBValueText.setText(scoreA);
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
    this.scoreAText = this.add
      .text(this.cameras.main.width / 4, 50, "Score: ", {
        fontSize: "26px",
      })
      .setOrigin(0.5);

    this.scoreAValueText = this.add
      .text(
        this.scoreAText.x + this.scoreAText.displayWidth / 2,
        50,
        this.scoreA,
        {
          fontSize: "26px",
        }
      )
      .setOrigin(0.5, 0.5);

    this.scoreBText = this.add
      .text(
        this.cameras.main.width - this.cameras.main.width / 4,
        50,
        "Score: ",
        {
          fontSize: "26px",
        }
      )
      .setOrigin(0.5);

    this.scoreBValueText = this.add
      .text(
        this.scoreBText.x + this.scoreAText.displayWidth / 2,
        50,
        this.scoreB,
        {
          fontSize: "26px",
        }
      )
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

  getRandomBallVelocity() {
    const randomX =
      Phaser.Math.Between(100, 200) * (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Phaser.Math.Between(100, 200) * (Math.random() < 0.5 ? 1 : -1);
    return { randomX, randomY };
  }

  handleBallOutOfBounds() {
    if (this.ball.x < 0 || this.ball.x > this.cameras.main.width) {
      this.ball.setPosition(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2
      );

      if (this.ball.x < 0) {
        this.scoreB += 1;
        console.log(this.scoreB);
        this.scoreBValueText.setText(this.scoreB);

        this.socket.send(
          JSON.stringify({
            scoreA: this.scoreA,
            scoreB: this.scoreB,
          })
        );
      }

      if (this.ball.x > this.cameras.main.width) {
        this.scoreA += 1;
        this.scoreAValueText.setText(this.scoreA);
        this.socket.send(
          JSON.stringify({
            scoreA: this.scoreA,
            scoreB: this.scoreB,
          })
        );
      }

      const { randomX, randomY } = this.getRandomBallVelocity();
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
  }

  update() {
    this.handleBallOutOfBounds();
  }
}
