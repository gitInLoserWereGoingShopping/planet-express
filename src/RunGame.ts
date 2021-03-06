import { Scene } from "phaser";

class Laser extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene: any, x: number, y: number)
    {
        super(scene, x, y, 'laser');
    }
    fire(x: number, y: number)
    {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(-900);
    }
    fire1(x: number, y: number)
    {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(-900);
        this.setVelocityX(-100);
        this.setRotation(-0.1);
    }
    fire2(x: number, y: number)
    {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(-900);
        this.setVelocityX(100);
        this.setRotation(0.1);
    }
    preUpdate(time: number, delta: number)
    {
        //reset laser group when laser reaches edge of screen
        //without this the ship would only fire laser 30 times
        super.preUpdate(time, delta);
        if (this.y <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class LaserGroup extends Phaser.Physics.Arcade.Group
{
    constructor(scene: any)
    {
        super(scene.physics.world, scene);
        
        this.createMultiple({
            classType: Laser,
            frameQuantity: 30,
            active: true,
            visible: true,
            key: 'laser'
        })
    }
    fireLaser(x: number, y: number)
    {
        //if no object available creates new object
        const laser = this.getFirstDead(true);
        if (laser) {
            laser.fire(x, y)
        }
    }
    fireLaser1(x: number, y: number)
    {
        //if no object available creates new object
        const laser = this.getFirstDead(true);
        if (laser) {
            laser.fire1(x, y)
        }
    }
    fireLaser2(x: number, y: number)
    {
        //if no object available creates new object
        const laser = this.getFirstDead(true);
        if (laser) {
            laser.fire2(x, y)
        }
    }
}

export class RunGame extends Phaser.Scene
{
    music: any;
    laserSound: any;
    collectibleSound: any;
    collectibleCount: number = 0;
    ship: Phaser.Physics.Arcade.Sprite;
    moon: Phaser.Physics.Arcade.Sprite;
    background: Phaser.GameObjects.Image;
    nebula: Phaser.GameObjects.Image;
    laserGroup: LaserGroup;
    
    //crew members (collectibles) and enemies
    collectibles: string[] = ['scruffy', 'zoidberg', 'nibbler', 'leela', 'fry', 'bender', 'professor', 'amy', 'hermes', 'kif'];
    collectiblesGroup: Phaser.Physics.Arcade.Group;
    collectiblesTimedEvent: Phaser.Time.TimerEvent;
    enemySmall: Phaser.Physics.Arcade.Sprite;
    enemySmallGroup: Phaser.Physics.Arcade.Group;
    enemySmallTimedEvent: Phaser.Time.TimerEvent;
    enemyLarge: Phaser.Physics.Arcade.Sprite;
    enemyLargeGroup: Phaser.Physics.Arcade.Group;
    enemyLargeTimedEvent: Phaser.Time.TimerEvent;
    
    shipHasShield: boolean = false;
    shipTripleFire: boolean = false;
    height: number;
    width: number;
    scaleRatio: number;
    timedEvent: any;
    takedowns: number = 0;
    difficultyFactor: number = 1;
    
    //game texts
    livesText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    takedownsText: Phaser.GameObjects.Text;
    // activeLasers: Phaser.GameObjects.Text;
    // activeEnemies: Phaser.GameObjects.Text;
    // username: any;
    
    //keys
    keyW: any;
    keyA: any;
    keyS: any;
    keyD: any;
    keySpacebar: any;
    // keyEnter: any;
    
    
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
        this.load.audio('backgroundMusic', [
            '../assets/audio/jobbascript.mp3'
        ]);
        this.load.audio('collectibleSound', '../assets/audio/collectible.wav');
        this.load.audio('laserSound', '../assets/audio/laser.wav');
        
        this.load.image('environment', '../assets/background.jpg');
        this.load.image('exhaust', '../assets/exhaust-white.png');
        this.load.spritesheet('ship',
            '../assets/bessie.png',
            { frameWidth: 40, frameHeight: 70 },
        );
        this.load.image('laser', '../assets/laser-blue.png');
        this.load.image('bender-applause', '../assets/bender-applause.png');
        this.load.image('enemySmall', '../assets/enemy-small.png');
        this.load.image('enemyLarge', '../assets/enemy-large.png');
        
        this.collectibles.forEach(member =>
        {
            this.load.image(`${member}`,`../assets/${member}.png` )
        })
        this.load.image('aura', '../assets/aura.png');
        this.load.image('moon', '../assets/moon.png');
        this.load.image('nebula', '../assets/nebula.png');
        
    }
    protected create()
    {
        // this.username = prompt('Please enter desired name for highscore purposes!');
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keySpacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        this.makeEnvironment();
        this.sound.pauseOnBlur = true;
        this.music = this.sound.add('backgroundMusic', {loop: true});
        this.music.play();
        this.laserSound = this.sound.add('laserSound');
        this.collectibleSound = this.sound.add('collectibleSound');
        
        this.nebula = this.add.image(1120, 300, 'nebula');
	    this.add.image(100, 850, 'bender-applause');
	    this.add.image(1575, 875, 'nibbler');
        
        this.laserGroup = new LaserGroup(this);
        
        this.makeMoon();
        
        this.anims.create({
            key: 'ship',
            frames: [ { key: 'ship', frame: 0 } ],
            frameRate: 60
        });
        this.anims.create({
            key: 'ship-fire',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 1 }),
            frameRate: 60
        });
        
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
        
        // laser and moon collisions / overlaps
        this.physics.add.collider(this.ship, this.moon);
        this.physics.add.overlap(this.moon, this.laserGroup, this.removeObject);
        
        //initialize game
        this.startGame();
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
        .setPushable(true)
        .setBounce(.6)
        .setVelocity(200)
        .setCircle(72); //half the width of moon.png width
    }
    protected flyingAnim()
    {
        this.ship.anims.play('ship', true);
    }
    protected shootLaser()
    {
        this.laserSound.play();
        this.ship.anims.play('ship-fire', true);
        this.timedEvent = this.time.addEvent({delay: 100, callback: this.flyingAnim, callbackScope: this});
        this.laserGroup.fireLaser(this.ship.x, this.ship.y - 20);
    }
    protected shootTripleLaser()
    {
        this.laserSound.play();
        this.ship.anims.play('ship-fire', true);
        this.timedEvent = this.time.addEvent({delay: 100, callback: this.flyingAnim, callbackScope: this});
        this.laserGroup.fireLaser(this.ship.x, this.ship.y - 20);
        this.laserGroup.fireLaser1(this.ship.x, this.ship.y - 20);
        this.laserGroup.fireLaser2(this.ship.x, this.ship.y - 20);
    }
    protected pointerdown(pointer: Phaser.Input.Pointer)
    {
        if (this.shipTripleFire) this.shootTripleLaser();
        else this.shootLaser();
    }
    public update()
    {
        if (this.data.get('lives') === 0)
        {
            console.log(`To shreds you say?! You scored ${this.data.get('score')} points, tookdown ${this.takedowns} enemies!`);
            alert(`To shreds you say?! You scored ${this.data.get('score')} points, tookdown ${this.takedowns} enemies!`);
            this.scene.stop();
        }
        if (this.collectibleCount === 10)
        {
            console.log(`Good news everyone! You collected all crew members! You scored ${this.data.get('score')} points, tookdown ${this.takedowns} enemies!`);
            alert(`Good news everyone! You collected all crew members! You scored ${this.data.get('score')} points, tookdown ${this.takedowns} enemies!`);
            this.scene.stop();
        }
        this.nebula.rotation += 0.001;
        this.scoreText.setText(`Score: ${this.data.get('score')}`);
        this.livesText.setText(`Lives: ${this.data.get('lives')}`);
        this.takedownsText.setText(`Takedowns: ${this.takedowns}`);
        // this.activeEnemies.setText(`Enemies: ${this.enemySmallGroup.countActive()}`);
        // this.activeLasers.setText(`Lasers: ${this.laserGroup.countActive()}`);
        this.handlePlayerUpdate();
        
    }
    protected handlePlayerUpdate(): void
    {
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
        if (Phaser.Input.Keyboard.JustDown(this.keySpacebar))
        {
            if (this.shipTripleFire) this.shootTripleLaser();
            else this.shootLaser();
        }
        if (cursors.left.isDown || this.keyA.isDown)
        {
            this.ship.setVelocityX(-shipSpeed);
            this.ship.setRotation(-0.1);
            
        }
        else if (cursors.right.isDown || this.keyD.isDown)
        {
            this.ship.setVelocityX(shipSpeed);
            this.ship.setRotation(0.1);
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
    protected initData(): void
    {
        this.data.set('score', 0);
        this.data.set('lives', 3);
        this.data.set('lasers', 0);
        this.data.set('enemies', 0);
    }
    protected initText(): void
    {
        const mainCam = this.cameras.main;
        this.scoreText = this.add.text(150, mainCam.height - 60, `Score: ${this.data.get('score')}`);
        this.takedownsText = this.add.text(150, mainCam.height - 30, `Takedowns: ${this.data.get('takedowns')}`);
        this.livesText = this.add.text(mainCam.width - 125, mainCam.height - 40, `Lives: ${this.data.get('lives')}`);
        // this.activeEnemies = this.add.text(150, mainCam.height - 20, `Enemies: ${this.data.get('enemies')}`);
        // this.activeLasers = this.add.text(150, mainCam.height - 60, `Score: ${this.data.get('lasers')}`);
    }
    protected startGame(): void
    {
        this.initEnemySmallSpawn();
        this.initEnemyLargeSpawn();
        this.initCollectionSpawn();
    }
    protected initEnemySmallSpawn(): void
    {
        this.enemySmallGroup = this.physics.add.group({
            defaultKey: 'enemySmall',
        })
        this.enemySmallTimedEvent = this.time.addEvent({
            delay: 500 / this.difficultyFactor,
            callback: this.createEnemySmall,
            callbackScope: this,
            loop: true
        })
        this.physics.add.overlap(this.laserGroup, this.enemySmallGroup, this.enemySmallHitsLaser.bind(this));
        this.physics.add.collider(this.enemySmallGroup, this.moon, (moon, enemy) => this.enemySmallHitsMoon(moon, enemy))
        this.physics.add.collider(this.enemySmallGroup, this.ship, (ship, enemy) => this.enemySmallHitsShip(ship, enemy))
    }
    protected createEnemySmall(): void
    {
        const randomVelocity: number = Math.random() < 0.5 ? Math.floor(Math.random() * 100 + Math.random() * this.difficultyFactor) : Math.floor(Math.random() * 100 + Math.random() * this.difficultyFactor) * -1.0;
        const enemy = this.enemySmallGroup.create(this.cameras.main.width * Math.random() + Math.random(), 50);
        enemy
            .setVelocityX(randomVelocity)
            .setVelocityY((Math.random() + 0.5) * 175 * this.difficultyFactor)
            .setCircle(enemy.height / 2)
        randomVelocity > 0 ? enemy.setRotation(-0.05) : enemy.setRotation(0.05);
    }
    protected enemySmallHitsLaser(laser: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        this.increaseScoreBy(5);
        this.enemySmallGroup.remove(enemy, true, true);
        this.laserGroup.remove(laser, true, true);
    }
    protected enemySmallHitsMoon(moon: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        this.increaseScoreBy(5);
        this.enemySmallGroup.remove(enemy, true, true);
    }
    protected enemySmallHitsShip(ship: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        if (this.shipHasShield)
        {
            this.increaseScoreBy(5);
            this.enemySmallGroup.remove(enemy, true, true);
        } else
        {
            this.reduceLives();
            this.enemySmallGroup.remove(enemy, true, true);
            this.activateShield();
        }
    }
    protected initEnemyLargeSpawn(): void
    {
        this.enemyLargeGroup = this.physics.add.group({
            defaultKey: 'enemyLarge',
            collideWorldBounds: false
        })
        this.enemyLargeTimedEvent = this.time.addEvent({
            delay: 700 / this.difficultyFactor,
            callback: this.createEnemyLarge,
            callbackScope: this,
            loop: true
        })
        this.physics.add.overlap(this.laserGroup, this.enemyLargeGroup, this.enemyLargeHitsLaser.bind(this));
        this.physics.add.collider(this.enemyLargeGroup, this.moon, (moon, enemy) => this.enemyLargeHitsMoon(moon, enemy))
        this.physics.add.collider(this.enemyLargeGroup, this.ship, (ship, enemy) => this.enemyLargeHitsShip(ship, enemy))
    }
    protected createEnemyLarge(): void
    {
        const randomVelocity: number = Math.random() < 0.5 ? Math.floor(Math.random() * 120 + Math.random() * this.difficultyFactor) : Math.floor(Math.random() * 100 + Math.random() * this.difficultyFactor) * -1.0;
        const enemy = this.enemyLargeGroup.create(this.cameras.main.width * Math.random() + Math.random(), 0);
        enemy
            .setVelocityX(randomVelocity)
            .setVelocityY(160 * this.difficultyFactor)
            .setSize(52, 50);
        randomVelocity > 0 ? enemy.setRotation(-0.05) : enemy.setRotation(0.05);
    }
    protected enemyLargeHitsLaser(laser: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        this.increaseScoreBy(15);
        this.enemyLargeGroup.remove(enemy, true, true);
        this.laserGroup.remove(laser, true, true);
    }
    protected enemyLargeHitsMoon(moon: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        this.increaseScoreBy(15);
        this.enemyLargeGroup.remove(enemy, true, true);
    }
    protected enemyLargeHitsShip(ship: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        if (this.shipHasShield)
        {
            this.increaseScoreBy(5);
            this.enemyLargeGroup.remove(enemy, true, true);
        } else
        {
            this.reduceLives();
            this.enemyLargeGroup.remove(enemy, true, true);
            this.activateShield();
        }
    }
    protected activateShield(): void
    {
        this.shipHasShield = true;
        this.ship.setTint(0xff0000);
        setTimeout(() => this.ship.setTint(0xFF3D41), 2000);
        setTimeout(() => this.ship.setTint(0xff8b8e), 3000);
        setTimeout(() =>
        {
            this.shipHasShield = false;
            this.ship.clearTint();
        }, 4000);
        
    }
    protected initCollectionSpawn(): void
    {
        this.collectiblesGroup = this.physics.add.group({
            defaultKey: 'scruffy' //GOAT
        });
        this.collectiblesTimedEvent = this.time.addEvent({
            delay: 30000,
            callback: this.createCollectible,
            callbackScope: this,
            loop: true
        });
        this.physics.add.collider(this.collectiblesGroup, this.ship, (ship, collectible) => this.CollectibleHitsShip(ship, collectible));
    }
    protected CollectibleHitsShip(ship: Phaser.Types.Physics.Arcade.GameObjectWithBody, collectible: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        this.collectiblesGroup.remove(collectible, true, true);
        this.collectibleSound.play();
        this.increaseScoreBy(150); //will be 300 for crew member + aura collected
        this.shipTripleFire = true;
        setTimeout(() => this.shipTripleFire = false, 6000);
        
        this.ship.setTint(0x7E1F86);
        setTimeout(() => this.ship.setTint(0xA14DA0), 1500);
        setTimeout(() => this.ship.setTint(0x9D79BC), 3000);
        setTimeout(() => this.ship.setTint(0x8CA0D7), 4500);
        setTimeout(() => this.ship.clearTint(), 6000);
        
        this.collectibleCount += 0.5; //using .5 because the aura and crew member both trigger CollectibleHitsShip()
    }
    protected createCollectible(): void
    {
        this.difficultyFactor += 0.3;
        const randomX = this.cameras.main.width * Math.random() + Math.random();
        const aura = this.collectiblesGroup
            .create(randomX, -100, 'aura')
            .setVelocityY(50);
        aura.body.setSize(50, 55, 41, 20);
        const collectible = this.collectiblesGroup
            .create(randomX, -100, this.collectibles.pop())
            .setVelocityY(50);
    }
    private increaseScoreBy(points: number): void
    {
        this.data.inc('score', points);
        this.takedowns += 1;
    }
    private reduceLives(): void
    {
        this.data.inc('lives', -1);
    }
}