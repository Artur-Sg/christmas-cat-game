class StartScene extends Phaser.Scene {
	constructor() {
		super({ key: 'StartScene' })
	}

	preload() {
		this.load.image('background', 'assets/sky2.png');
		this.load.image('button', 'assets/task.png');
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
	gameOver = false;

	score = 0;
	scoreText;

	SCORE_LABEL = 'Cобрано:';

	constructor() {
		super({ key: 'GameScene' })
	}

	preload() {
		this.load.image('sky', 'assets/sky3.png');
		this.load.image('ground', 'assets/platform.png');
		this.load.image('gift', 'assets/gift.png');
		this.load.image('gift2', 'assets/gift2.png');
		this.load.image('gift3', 'assets/gift3.png');
		this.load.image('gift4', 'assets/gift4.png');
		this.load.image('snowball', 'assets/snowball.png');
		this.load.spritesheet('cat', 'assets/Run.png', {
			frameWidth: 32,
			frameHeight: 32,
		});
		this.load.audio('meow', 'assets/meow.mp3');
		this.load.audio('background', 'assets/background.mp3');
		this.load.audio('pick', 'assets/pick.mp3');
		this.load.audio('noLuck', 'assets/no-luck.mp3');
	}

	create() {
		this.add.image(400, 270, 'sky').setScale(0.75);

		this.cursors = this.input.keyboard.createCursorKeys();
		this.platforms = this.physics.add.staticGroup();

		this.platforms.create(400, 610, 'ground').setScale(2).refreshBody();

		this.platforms.create(650, 420, 'ground');
		this.platforms.create(100, 250, 'ground');
		this.platforms.create(750, 220, 'ground');

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

		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(true);
		this.player.displayWidth = 90;
		this.player.displayHeight = 90;

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
		this.gifts.children.iterate(function (child) {
			child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.5));
		});

		this.physics.add.collider(this.gifts, this.platforms);
		this.physics.add.collider(this.player, this.platforms);
		this.physics.add.collider(this.snowballs, this.platforms);

		this.physics.add.overlap(this.player, this.gifts, this.collectGift, null, this);
		this.physics.add.collider(this.player, this.snowballs, this.hitSnowball, null, this);

		this.background = this.sound.add('background', {
			volume: 0.25,
			rate: 1,
			loop: true,
		});
		this.background.play();
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

		if (this.gifts.countActive(true) === 0) {
			this.gifts.children.iterate(function (child) {
				child.enableBody(true, child.x, 0, true, true);
			});

			const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

			const snowball = this.snowballs.create(x, 16, 'snowball');
			snowball.setBounce(1);
			snowball.setScale(0.1, 0.1);
			snowball.setCollideWorldBounds(true);
			snowball.setVelocity(Phaser.Math.Between(-100, 100), 20);
			snowball.allowGravity = false;
		}
	}

	hitSnowball(player, snowball) {
		this.physics.pause();

		this.player.setTint(0xff0000);
		// this.player.anims.play('turn');
		this.noLuck.play();
		this.gameOver = true;
	}
}

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 650,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false,
		},
	},
	scene: [StartScene, GameScene],
};

const game = new Phaser.Game(config);
