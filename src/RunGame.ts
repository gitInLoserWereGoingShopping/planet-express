export class RunGame extends Phaser.Scene {
    protected player: Phaser.Physics.Arcade.Sprite;
    protected candyPlanet: Phaser.Physics.Arcade.Sprite;
    protected background: Phaser.GameObjects.Image;
    private keyW: any;
    private keyA: any;
    private keyS: any;
    private keyD: any;
    constructor() {
        super({ key: 'RunGame' });
    }
    protected preload() {
        this.load.image('environment', '../assets/background.jpg');
        this.load.spritesheet('player',
            '../assets/bessie.png',
            { frameWidth: 40, frameHeight: 70 },
        );
        this.load.image('bender', '../assets/bender.png');
        this.load.image('candyPlanet', '../assets/candyPlanet.png');
        this.load.image('nebula', '../assets/nebula.png');
    }
    
    
    protected create() {
        // const width = this.scale.width
	    // const height = this.scale.height
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        
        this.makeEnvironment();
	    this.add.image(1100, 300, 'nebula');
	    this.add.image(100, 850, 'bender');
        this.makePlayer();
        this.makePlanet();
        
        this.anims.create({
            key: 'player',
            frames: [ { key: 'player', frame: 0 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'player-fire',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 20
        });
        
        //collisions
        this.physics.add.collider(this.player, this.candyPlanet);
    }
    protected makeEnvironment(): void {
        this.background = this.add.image(0, 0, 'environment')
        .setOrigin(0, 0)
        .setInteractive();
        this.background.on('pointerup', this.pointerup, this);
        
    }
    protected makePlayer(): void {
        this.player = this.physics.add.sprite(800, 800, 'player');
        this.player.setCollideWorldBounds(true);
    }
    protected makePlanet(): void {
        this.candyPlanet = this.physics.add.sprite(900, 200, 'candyPlanet')
        .setBounceX(Phaser.Math.FloatBetween(0.1, 0.3))
        .setBounceY(Phaser.Math.FloatBetween(0.3, 0.5))
        .setCollideWorldBounds(true)
        .setBounce(.5)
        .setVelocity(100);
        
    }
    protected timedEvent: any;
    protected flyingAnim()
    {
        this.player.anims.play('player', true);
    }
    protected pointerup(pointer: Phaser.Input.Pointer) {
            this.player.anims.play('player-fire', true);
            this.timedEvent = this.time.addEvent({delay: 175, callback: this.flyingAnim, callbackScope: this});
    }
    
    
    public update() {
        const cam = this.cameras.main;
		const speed = 2;
        const cursors = this.input.keyboard.createCursorKeys();
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
        if (cursors.left.isDown || this.keyA.isDown)
        {
            this.player.setVelocityX(-500);
            cam.scrollX -= speed;
        }
        else if (cursors.right.isDown || this.keyD.isDown)
        {
            this.player.setVelocityX(500);
            cam.scrollX += speed;
        }
        if (cursors.up.isDown || this.keyW.isDown)
        {
            this.player.setVelocityY(-500);
            // cam.scrollY -= speed;
        }
        else if (cursors.down.isDown || this.keyS.isDown)
        {
            this.player.setVelocityY(500);
            // cam.scrollY += speed;
        }
    }
}