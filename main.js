class LoadingScene extends Phaser.Scene {
	constructor() {
		super({ key: 'LoadingScene' })
	}

	preload() {
		this.load.image('background', 'assets/sky2.png');
		this.load.image('button', 'assets/task.png');
		this.load.image('paper-failure', 'assets/paper-failure.png');
		this.load.image('prize', 'assets/prize.png');
		this.load.image('sky', 'assets/sky3.png');
		this.load.image('ground', 'assets/platform.png');
		this.load.image('floor', 'assets/floor.png');
		this.load.image('branch', 'assets/branch.png');
		this.load.image('gift', 'assets/gift.png');
		this.load.image('gift2', 'assets/gift2.png');
		this.load.image('gift3', 'assets/gift3.png');
		this.load.image('gift4', 'assets/gift4.png');
		this.load.image('snowball', 'assets/snowball.png');
		this.load.spritesheet('cat', 'assets/run.png', {
			frameWidth: 32,
			frameHeight: 32,
		});
		this.load.audio('meow', 'assets/meow.mp3');
		this.load.audio('background', 'assets/background.mp3');
		this.load.audio('pick', 'assets/pick.mp3');
		this.load.audio('noLuck', 'assets/no-luck.mp3');
		this.load.audio('success', 'assets/success.mp3');

		const { width, height } = this.scale;

		this.add.text(width / 2, height / 2 - 70, 'Загрузка...', {
			fontSize: '32px',
			fill: '#fff',
			fontStyle: 'bold',
			stroke: '#3d2b1f',
			strokeThickness: 4,
		}).setOrigin(0.5);

		const progressBox = this.add.graphics();
		const progressBar = this.add.graphics();
		progressBox.fillStyle(0xfef65b, 0.8);
		progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

		this.load.on('progress', (value) => {
			progressBar.clear();
			progressBar.fillStyle(0xe9190c, 0.7);
			progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
		});

		this.load.on('filecomplete-image-background', () => {
			const background = this.add.sprite(0, 0, 'background');
			background.setOrigin(0, 0).setDepth(-1);
		});

		this.load.on('complete', () => {
			progressBar.destroy();
			progressBox.destroy();
			this.scene.start('StartScene');
		});
	}

	create() {
		background = this.sound.add('background', {
			volume: 0.25,
			rate: 1,
			loop: true,
		});

		background.play();

		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 6 }),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: 'turn',
			frames: [{ key: 'cat', frame: 4 }],
			frameRate: 20,
		});

		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers('cat', { start: 7, end: 13 }),
			frameRate: 10,
			repeat: -1,
		});
	}
}

class StartScene extends Phaser.Scene {
	constructor() {
		super({ key: 'StartScene' })
	}

	create() {
		const background = this.add.sprite(0, 0, 'background');
		background.setOrigin(0, 0);

		const button = this.add.sprite(400, 330, 'button');
		button.setInteractive();
		button.on('pointerdown', () => {
			this.scene.start('GameScene');
		});
	}
}

class PrizeScene extends Phaser.Scene {
	constructor() {
		super({ key: 'PrizeScene' })
	}

	create() {
		const background = this.add.sprite(0, 0, 'background');
		background.setOrigin(0, 0);

		this.add.sprite(400, 330, 'prize');
	}
}

class FailureScene extends Phaser.Scene {
	constructor() {
		super({ key: 'FailureScene' })
	}

	create() {
		const { width, height } = this.scale;

		const background = this.add.sprite(0, 0, 'background');
		background.setOrigin(0, 0);

		const failure = this.add.sprite(400, 330, 'paper-failure');

		if (tries >= 5) {
			const prizeButton = this.add.text(width / 2, height / 2 + 100, 'МЫ УСТАЛИ И ХОТИМ ПРИЗ!', {
				fontSize: '32px',
				fill: '#55332C',
				fontStyle: 'bold',
				stroke: '#fff',
				strokeThickness: 2,
			})
				.setOrigin(0.5)
				.setInteractive();

			prizeButton.on('pointerdown', () => {
				this.scene.stop('FailureScene');
				const gameScene = this.scene.get('GameScene');
				gameScene.goToPrize();
			});
		}

		const restartButton = this.add.text(width / 2, height / 2 + 50, 'ДА!', {
			fontSize: '32px',
			fill: '#55332C',
			fontStyle: 'bold',
			stroke: '#fff',
			strokeThickness: 2,
		})
			.setOrigin(0.5)
			.setInteractive();

		restartButton.on('pointerdown', () => {
			const gameScene = this.scene.get('GameScene');
			gameScene.restartGame();
			this.scene.stop();
			this.scene.start('GameScene');
		});
	}
}

class GameScene extends Phaser.Scene {
	meow;
	pick;
	gifts;
	background;
	player;
	cursors;
	platforms;
	snowballs;
	noLuck
	success
	gameOver = false;

	score = 0;
	scoreText;

	SCORE_LABEL = 'Cобрано:';

	constructor() {
		super({ key: 'GameScene' })
	}

	preload() {
	}

	create() {
		this.add.image(400, 270, 'sky').setScale(0.75);

		this.cursors = this.input.keyboard.createCursorKeys();
		this.platforms = this.physics.add.staticGroup();
		this.createPlatforms();

		this.scoreText = this.add.text(
			65,
			60,
			`${this.SCORE_LABEL} ${this.score}`,
			{
				fontSize: '32px',
				fill: '#fff',
				fontStyle: 'bold',
				stroke: '#3d2b1f',
				strokeThickness: 2,
			},
		);

		this.player = this.physics.add.sprite(100, 450, 'cat');
		this.player.setCrop(0, 5, 32, 27);
		this.player.body.setSize(32, 24);
		this.player.body.offset.y = 4;

		this.meow = this.sound.add('meow', { volume: 0.5, rate: 1.25 });
		this.pick = this.sound.add('pick', { volume: 0.5, rate: 1 });
		this.noLuck = this.sound.add('noLuck', { volume: 0.5, rate: 1.25 });
		this.success = this.sound.add('success', { volume: 0.5, rate: 1 });

		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(true);
		this.player.displayWidth = 75;
		this.player.displayHeight = 75;

		this.gifts = this.physics.add.group({
			key: 'gift',
			repeat: 9,
			setScale: { x: 0.1, y: 0.1 },
			setXY: { x: 70, y: 0, stepX: 70 },
		});

		this.snowballs = this.physics.add.group();

		const textures = ['gift', 'gift2', 'gift3', 'gift4'];

		this.gifts.children.iterate((gift) => {
			const randomTexture = Phaser.Utils.Array.GetRandom(textures);
			gift.setTexture(randomTexture);
		});

		this.gifts.children.iterate((child) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.5));
			child.setOffset(0, -150);
		});

		this.physics.add.collider(this.gifts, this.platforms);
		this.physics.add.collider(this.player, this.platforms);
		this.physics.add.collider(this.snowballs, this.platforms);

		this.physics.add.overlap(this.player, this.gifts, this.collectGift, null, this);
		this.physics.add.collider(this.player, this.snowballs, this.hitSnowball, null, this);
	}

	update() {
		if (this.gameOver) {
			return;
		}

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-160);

			if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'left') {
				this.meow.play();
			}

			this.player.anims.play('left', true);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(160);

			if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'right') {
				this.meow.play();
			}

			this.player.anims.play('right', true);
		} else {
			this.player.setVelocityX(0);
			this.player.anims.play('turn');
		}

		if (this.cursors.up.isDown && this.player.body.touching.down) {
			this.player.setVelocityY(-330);
		}
	}

	collectGift(player, gift) {
		this.pick.play();
		gift.disableBody(true, true);
		this.score += Math.floor(Math.random() * 3) + 2;
		this.scoreText.setText(`${this.SCORE_LABEL} ${this.score}`);

		if (this.score >= 100) {
			this.goToPrize();
		}

		if (this.gifts.countActive(true) === 0) {
			this.gifts.children.iterate(function (child) {
				child.enableBody(true, child.x, 0, true, true);
			});

			const SCREEN_WIDTH = 800;
			const SNOWBALL_SCALE = 0.1;
			const SNOWBALL_BOUNCE = 1;

			function getSpawnPosition(playerX, screenWidth) {
				const halfWidth = screenWidth / 2;

				return (playerX < halfWidth)
					? Phaser.Math.Between(halfWidth, screenWidth)
					: Phaser.Math.Between(0, halfWidth);
			}

			function createSnowball(group, x, y) {
				const snowball = group.create(x, y, 'snowball');
				snowball.setOffset(0, -150);
				snowball.setBounce(SNOWBALL_BOUNCE);
				snowball.setScale(SNOWBALL_SCALE);
				snowball.setCollideWorldBounds(true);

				const minVelocity = -150;
				const maxVelocity = 150;
				const exclusionRange = { min: -20, max: 20 };

				let velocityX;
				do {
					velocityX = Phaser.Math.Between(minVelocity, maxVelocity);
				} while (velocityX > exclusionRange.min && velocityX < exclusionRange.max);

				snowball.setVelocity(velocityX, 20);
				snowball.allowGravity = false;

				return snowball;
			}

			const x = getSpawnPosition(this.player.x, SCREEN_WIDTH);
			createSnowball(this.snowballs, x, 16);
		}
	}

	hitSnowball(player, snowball) {
		this.physics.pause();

		this.player.setTint(0xff0000);
		// this.player.anims.play('turn');
		this.noLuck.play();
		this.gameOver = true;

		this.scene.start('FailureScene');
	}

	restartGame() {
		this.score = 0;
		this.scene.restart();
		tries += 1;
		this.gameOver = false;
	}

	goToPrize() {
		this.success.play();
		this.scene.start('PrizeScene');
	}

	createPlatforms() {
		const platformConfigs = [
			{ x: 400, y: 610, key: 'floor', scale: 1, bodySize: { width: null, height: null }, offset: { x: 0, y: 25 } }, // Floor
			{ x: 590, y: 420, key: 'branch', scale: 0.5, bodySize: { width: null, height: 10 }, offset: { x: 0, y: 25 } }, // Right-bottom
			{ x: 100, y: 250, key: 'branch', scale: 0.5, bodySize: { width: null, height: 10 }, offset: { x: 0, y: 25 } }, // Left-top
			{ x: 700, y: 220, key: 'branch', scale: 0.5, bodySize: { width: null, height: 10 }, offset: { x: 0, y: 25 } }, // Right-top
		];

		this.platforms = this.physics.add.staticGroup();

		platformConfigs.forEach(({ x, y, key, scale, bodySize, offset }) => {
			const platform = this.platforms.create(x, y, key).setScale(scale).refreshBody();

			platform.body.setSize(platform.displayWidth, bodySize.height);
			platform.body.setOffset(offset.x, offset.y);
		});
	}
}

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 650,
	backgroundColor: '#1f70c4',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false,
		},
	},
	scene: [LoadingScene, StartScene, GameScene, PrizeScene, FailureScene],
};

let tries = 1;
let background;

const game = new Phaser.Game(config);
