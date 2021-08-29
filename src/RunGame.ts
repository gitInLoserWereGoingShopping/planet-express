class Laser extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene: any, x: number, y: number) {
        super(scene, x, y, 'laser');
    }
    fire(x: number, y: number) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(-900);
    }
    preUpdate(time: number, delta: number) {
        //reset laser group when laser reaches edge of screen
        //without this the ship would only fire laser 30 times (ln 28)
        super.preUpdate(time, delta);
        if (this.y <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class LaserGroup extends Phaser.Physics.Arcade.Group
{
    constructor(scene: any) {
        super(scene.physics.world, scene);
        
        this.createMultiple({
        classType: Laser,
        frameQuantity: 30,
        active: true,
        visible: true,
        key: 'laser'
        })
    }
    fireLaser(x: number, y: number) {
        //if no object available creates new object
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y)
        }
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene: any, x: number, y: number)
    {
        super(scene, x, y, 'enemy')
    }
    Render()
    {
        
    }
    Update(frameTime: number)
    {
        
    }
    Destroyed()
    {
        
    }
    // float posX
    // float posY
    // float speed
    // sprite laser
    // sprite ship
};

export class RunGame extends Phaser.Scene
{
    ship: Phaser.Physics.Arcade.Sprite;
    moon: Phaser.Physics.Arcade.Sprite;
    background: Phaser.GameObjects.Image;
    laserGroup: LaserGroup;
    
    //crew members (collectables) and enemies
    collectables: string[] = ['leela', 'fry', 'bender', 'professor', 'scruffy', 'kif', 'amy', 'hermes'];
    collectableObjectsGroup: Phaser.Physics.Arcade.Group;
    collectableTimedEvent: Phaser.Time.TimerEvent;
    enemySmall: Phaser.Physics.Arcade.Sprite;
    enemyLarge: Phaser.Physics.Arcade.Sprite;
    enemyBoss: Phaser.Physics.Arcade.Sprite;
    enemySmallObjectsGroup: Phaser.Physics.Arcade.Group;
    enemySmallTimedEvent: Phaser.Time.TimerEvent;
    enemyLargeObjectsGroup: Phaser.Physics.Arcade.Group;
    enemyLargeTimedEvent: Phaser.Time.TimerEvent;
    playersHasShield: boolean = false;
    
    height: number;
    width: number;
    scaleRatio: number;
    timedEvent: any;
    
    //game texts
    levelText: Phaser.GameObjects.Text;
    livesText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    
    //keys
    keyW: any;
    keyA: any;
    keyS: any;
    keyD: any;
    keySpacebar: any;
    keyEnter: any;
    
    
    // enemyGroup: any;
    constructor()
    {
        super({ key: 'RunGame' });
        this.laserGroup;
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.scaleRatio = window.devicePixelRatio;
    }
    protected preload()
    {
        this.load.image('environment', '../assets/background.jpg');
        this.load.image('exhaust', '../assets/exhaust-white.png');
        this.load.spritesheet('ship',
            '../assets/bessie.png',
            { frameWidth: 40, frameHeight: 70 },
        );
        this.load.image('laser', '../assets/laser-blue.png');
        this.load.image('enemySmall', '../assets/enemy-small.png');
        this.load.image('enemyLarge', '../assets/enemy-large.png');
        this.load.image('enemyBoss', '../assets/enemy-boss.png');
        this.load.image('bender-applause', '../assets/bender-applause.png');
        this.load.image('nibbler', '../assets/nibbler.png');
        this.load.image('leela', '../assets/leela.png');
        this.load.image('fry', '../assets/fry.png');
        this.load.image('bender', '../assets/bender.png');
        this.load.image('professor', '../assets/professor.png');
        this.load.image('scruffy', '../assets/scruffy.png');
        this.load.image('amy', '../assets/amy.png');
        this.load.image('kif', '../assets/kif.png');
        this.load.image('hermes', '../assets/hermes.png');
        this.load.image('moon', '../assets/moon.png');
        this.load.image('nebula', '../assets/nebula.png');
        // this.load.spritesheet('laser-beams-blue', 
        //     '../assets/laser-beams-blue.png',
        //     { frameWidth: 13, frameHeight: 26 }
        // );
    }
    
    
    protected create()
    {
        
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keySpacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        this.makeEnvironment();
	    this.add.image(1120, 300, 'nebula');
	    this.add.image(100, 850, 'bender-applause');
	    this.add.image(1575, 875, 'nibbler');
	    this.add.image(1300, 800, 'leela');
	    this.add.image(1250, 800, 'fry');
	    this.add.image(1200, 800, 'bender');
	    this.add.image(1150, 800, 'professor');
	    this.add.image(1100, 800, 'scruffy');
	    this.add.image(1000, 800, 'amy');
	    this.add.image(1050, 800, 'kif');
	    this.add.image(950, 800, 'hermes');
	    this.add.image(400, 500, 'enemySmall');
	    this.add.image(600, 100, 'enemyLarge');
        this.laserGroup = new LaserGroup(this);
        // this.enemyGroup = new EnemyGroup(this);
        
        this.makeMoon();
        this.anims.create({
            key: 'ship',
            frames: [ { key: 'ship', frame: 0 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'ship-fire',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 1 }),
            frameRate: 20
        });
        // this.add.image(800, 300, 'enemyBoss'); *************************************************************
        
        // this.anims.create({
        //     key: 'laser-beams-blue',
        //     frames: this.anims.generateFrameNumbers('laser-beams-blue', { start: 0, end: 2 }),
        //     frameRate: 10
        // });
        
        //particles, emitters, exhaust
        const particles = this.add.particles('exhaust');
        this.makeShip();
        particles.createEmitter({
            quantity: 5,
            speedY: { min: 20, max: 50 },
            speedX: { min: -10, max: 10 },
            accelerationY: 400,
            lifespan: { min: 100, max: 300 },
            alpha: { start: 0.5, end: 0, ease: 'Sine.easeIn' },
            scale: { start: 0.065, end: 0.02 },
            rotate: { min: -180, max: 180 },
            angle: { min: 30, max: 110 },
            blendMode: 'ADD',
            frequency: 20,
            follow: this.ship,
            followOffset: { y: this.ship.height * 0.51 },
            tint: 0x57708d,
        });
        this.initData();
        this.initText();
        
        //collisions and overlaps
        this.physics.add.collider(this.ship, this.moon);
        this.physics.add.overlap(this.moon, this.laserGroup, this.removeObject);
        // this.physics.add.overlap(this.moon, this.enemyGroup, this.removeObject);
    }
    protected removeObject(objStaying: any, objRemoved: any): void
    {
        objRemoved.setActive(false);
        objRemoved.setVisible(false);
    }
    protected makeEnvironment(): void
    {
        this.background = this.add.image(0, 0, 'environment')
        .setOrigin(0, 0)
        .setInteractive();
        this.background.on('pointerdown', this.pointerdown, this);
    }
    protected makeShip(): void
    {
        const centerX: number = this.cameras.main.width / 2;
        const bottom: number = this.cameras.main.height - 90;
        this.ship = this.physics.add.sprite(centerX, bottom, 'ship')
        .setBounce(1)
        .setImmovable(true)
        .setCollideWorldBounds(true);
    }
    protected makeMoon(): void
    {
        this.moon = this.physics.add.sprite(900, 200, 'moon')
        .setBounceX(Phaser.Math.FloatBetween(0.1, 0.3))
        .setBounceY(Phaser.Math.FloatBetween(0.3, 0.5))
        .setCollideWorldBounds(true)
        .setBounce(.6)
        .setVelocity(100);
    }
    protected flyingAnim()
    {
        this.ship.anims.play('ship', true);
    }
    protected shootLaser()
    {
        this.ship.anims.play('ship-fire', true);
        this.timedEvent = this.time.addEvent({delay: 100, callback: this.flyingAnim, callbackScope: this});
        this.laserGroup.fireLaser(this.ship.x, this.ship.y - 20);
    }
    protected pointerdown(pointer: Phaser.Input.Pointer)
    {
        this.shootLaser();
    }
    public update()
    {
        if (this.data.get('lives') === 0) {
            alert('Game over.');
        }
        this.handlePlayerUpdate();
        this.scoreText.setText(`Score: ${this.data.get('score')}`);
        this.livesText.setText(`Lives: ${this.data.get('lives')}`);
        this.levelText.setText(`Level: ${this.data.get('level')}`);
        
    }
    protected handlePlayerUpdate(): void
    {
        const cam = this.cameras.main;
        const camSpeed = 2;
        let shipSpeed = 500;
        const cursors = this.input.keyboard.createCursorKeys();
        this.ship.setVelocityX(0);
        this.ship.setVelocityY(0);
        this.ship.setRotation(0);
        if (cursors.shift.isDown)
        {
            shipSpeed = 750;
        } else {
            shipSpeed = 500;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keySpacebar) || Phaser.Input.Keyboard.JustDown(this.keyEnter) )
        {
            this.shootLaser();
        }
        if (cursors.left.isDown || this.keyA.isDown)
        {
            this.ship.setVelocityX(-shipSpeed);
            this.ship.setRotation(-0.1);
            // cam.scrollX -= camSpeed;
            
        }
        else if (cursors.right.isDown || this.keyD.isDown)
        {
            this.ship.setVelocityX(shipSpeed);
            this.ship.setRotation(0.1);
            // cam.scrollX += camSpeed;
        }
        if (cursors.up.isDown || this.keyW.isDown)
        {
            this.ship.setVelocityY(-shipSpeed);
        }
        else if (cursors.down.isDown || this.keyS.isDown)
        {
            this.ship.setVelocityY(shipSpeed);
        }
    }
    protected initData(): void {
        this.data.set('score', 0);
        this.data.set('lives', 3);
        this.data.set('level', 1);
    }
    protected initText(): void {
        const mainCam = this.cameras.main;
        this.scoreText = this.add.text(150, mainCam.height - 60, `Score: ${this.data.get('score')}`);
        this.levelText = this.add.text(150, mainCam.height - 40, `Level: ${this.data.get('level')}`);
        this.livesText = this.add.text(mainCam.width - 125, mainCam.height - 40, `Lives: ${this.data.get('lives')}`);
    }
}