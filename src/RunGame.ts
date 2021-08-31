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
}

export class RunGame extends Phaser.Scene
{
    ship: Phaser.Physics.Arcade.Sprite;
    moon: Phaser.Physics.Arcade.Sprite;
    background: Phaser.GameObjects.Image;
    laserGroup: LaserGroup;
    
    //crew members (collectibles) and enemies
    collectibles: string[] = ['scruffy', 'zoidberg', 'leela', 'fry', 'bender', 'professor', 'kif', 'amy', 'hermes', 'nibbler'];
    collectiblesGroup: Phaser.Physics.Arcade.Group;
    collectiblesTimedEvent: Phaser.Time.TimerEvent;
    enemySmall: Phaser.Physics.Arcade.Sprite;
    enemySmallGroup: Phaser.Physics.Arcade.Group;
    enemySmallTimedEvent: Phaser.Time.TimerEvent;
    enemyLarge: Phaser.Physics.Arcade.Sprite;
    enemyLargeGroup: Phaser.Physics.Arcade.Group;
    enemyLargeTimedEvent: Phaser.Time.TimerEvent;
    // enemyBoss: Phaser.Physics.Arcade.Sprite;
    
    shipHasShield: boolean = false;
    height: number;
    width: number;
    scaleRatio: number;
    timedEvent: any;
    takedowns: number = 0;
    difficultyFactor: number = 1;
    
    //game texts
    livesText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    activeLasers: Phaser.GameObjects.Text;
    takedownsText: Phaser.GameObjects.Text;
    activeEnemies: Phaser.GameObjects.Text;
    
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
        this.load.image('bender-applause', '../assets/bender-applause.png');
        this.load.image('enemySmall', '../assets/enemy-small.png');
        this.load.image('enemyLarge', '../assets/enemy-large.png');
        // this.load.image('enemyBoss', '../assets/enemy-boss.png');
        this.collectibles.forEach(member =>
        {
            this.load.image(`${member}`,`../assets/${member}.png` )
        })
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
	    // this.add.image(1350, 850, 'zoidberg');
	    // this.add.image(1300, 850, 'leela');
	    // this.add.image(1250, 850, 'fry');
	    // this.add.image(1200, 850, 'bender');
	    // this.add.image(1150, 850, 'professor');
	    // this.add.image(1100, 850, 'scruffy');
	    // this.add.image(1000, 850, 'amy');
	    // this.add.image(1050, 850, 'kif');
	    // this.add.image(950, 850, 'hermes');
        this.laserGroup = new LaserGroup(this);
        
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
        if (this.data.get('lives') === 0)
        {
            this.scene.stop();
            alert(`Game over, well done! You scored ${this.data.get('score')} points!`);
        }
        this.scoreText.setText(`Score: ${this.data.get('score')}`);
        this.livesText.setText(`Lives: ${this.data.get('lives')}`);
        this.takedownsText.setText(`Takedowns: ${this.takedowns}`);
        this.activeEnemies.setText(`Enemies: ${this.enemySmallGroup.countActive()}`);
        // this.activeLasers.setText(`Lasers: ${this.laserGroup.countActive()}`);
        this.handlePlayerUpdate();
        
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
        this.takedownsText = this.add.text(150, mainCam.height - 40, `Takedowns: ${this.data.get('takedowns')}`);
        this.activeEnemies = this.add.text(150, mainCam.height - 20, `Enemies: ${this.data.get('enemies')}`);
        this.livesText = this.add.text(mainCam.width - 125, mainCam.height - 40, `Lives: ${this.data.get('lives')}`);
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
            collideWorldBounds: false,
            velocityY: 150 * this.difficultyFactor,
            velocityX: Math.random() < 0.5 ? (Math.random() * 200 + Math.random()) * this.difficultyFactor : -((Math.random() * 200 + Math.random()) * this.difficultyFactor)
        })
        this.enemySmallTimedEvent = this.time.addEvent({
            delay: 700 * this.difficultyFactor,
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
        const enemy = this.enemySmallGroup.create(this.cameras.main.width * Math.random() + Math.random(), 0);
        enemy.setCircle(enemy.width / 2);
    }
    protected enemySmallHitsLaser(laser: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        //TO DO: enemy ship explosion animation
        this.increaseScoreBy(5);
        this.enemySmallGroup.remove(enemy, true, true);
        this.laserGroup.remove(laser, true, true);
    }
    protected enemySmallHitsMoon(moon: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        //TO DO: enemy ship explosion animation 
        this.increaseScoreBy(5);
        this.enemySmallGroup.remove(enemy, true, true);
    }
    protected enemySmallHitsShip(ship: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        if (this.shipHasShield)
        {
            //TO DO: enemy ship explosion animation 
            this.increaseScoreBy(5);
            this.enemySmallGroup.remove(enemy, true, true);
        } else
        {
            //TO DO: player's ship explosion animation
            //TO DO: enemy ship explosion animation 
            this.shipHasShield = true;
            setTimeout(() => { this.shipHasShield = false; }, 3000);
            this.reduceLives();
            this.enemySmallGroup.remove(enemy, true, true);
        }
    }
    protected initEnemyLargeSpawn(): void
    {
        this.enemyLargeGroup = this.physics.add.group({
            defaultKey: 'enemyLarge',
            collideWorldBounds: false,
            velocityY: 130 * this.difficultyFactor,
            velocityX: Math.random() < 0.5 ? (Math.random() * 100 + Math.random()) * this.difficultyFactor : -((Math.random() * 100 + Math.random()) * this.difficultyFactor)
        })
        this.enemyLargeTimedEvent = this.time.addEvent({
            delay: 1000 * this.difficultyFactor,
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
        const enemy = this.enemyLargeGroup.create(this.cameras.main.width * Math.random() + Math.random(), -50);
        enemy.setCircle(enemy.width / 2);
    }
    protected enemyLargeHitsLaser(laser: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        //TO DO: enemy ship explosion animation 
        //TO DO: enemy ship explosion animation
        this.increaseScoreBy(15);
        this.enemyLargeGroup.remove(enemy, true, true);
        this.laserGroup.remove(laser, true, true);
    }
    protected enemyLargeHitsMoon(moon: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        this.increaseScoreBy(15);
        //TO DO: enemy ship explosion animation 
        this.enemyLargeGroup.remove(enemy, true, true);
    }
    protected enemyLargeHitsShip(ship: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody): void
    {
        if (this.shipHasShield)
        {
            //TO DO: enemy ship explosion animation 
            this.increaseScoreBy(5);
            this.enemyLargeGroup.remove(enemy, true, true);
        } else
        {
            //TO DO: player's ship explosion animation
            //TO DO: enemy ship explosion animation 
            this.reduceLives();
            this.shipHasShield = true;
            setTimeout(() => { this.shipHasShield = false; }, 3000);
            this.enemyLargeGroup.remove(enemy, true, true);
        }
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
        this.shipHasShield = true;
        setTimeout(() => { this.shipHasShield = false; }, 3000);
        this.increaseScoreBy(100);
        this.collectiblesGroup.remove(collectible, true, true);
    }
    protected createCollectible(): void
    {
        const collectible = this.collectiblesGroup.create(this.cameras.main.width * Math.random() + Math.random(), -100, this.collectibles.pop())
        .setVelocityY(50);
        collectible.setCircle(collectible.width / 2);
        this.difficultyFactor += 0.2;
    }
    private increaseScoreBy(points: number): void
    {
        this.data.inc('score', points);
        this.takedowns++;
    }
    private reduceLives(): void
    {
        this.data.inc('lives', -1);
    }
}