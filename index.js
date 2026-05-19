/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1
canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
canvas.style.width = window.innerWidth + "px"
canvas.style.height = window.innerHeight + "px"
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
// ctx.imageSmoothingEnabled = false
// ctx.imageSmoothingEnabled = false
window.addEventListener("keyup", (e) => {

    switch (e.key) {
        case " ":
            // player.velocity.y = 0
            break
        case "a":
            keys.left.pressed = false
            break
        case "s":
            // player.velocity.y -= 20
            break
        case "d":
            keys.right.pressed = false
            break
    }
});
window.addEventListener("keydown", (e) => {
    if (gameWon || !player.alive && particles.length === 0) {
        if (e.repeat) return
        if (e.key === "n") {
            gameWon = false
            init()
            requestAnimationFrame(gameLoop)
        }

        if (e.key === " ") {
            restartSameLevel()
        }
        return
    }

    switch (e.key) {
        case " ":
            if (e.repeat) return
            if (player.velocity.y === 0) player.velocity.y = -12
            break
        case "a":
            keys.left.pressed = true
            break
        case "s":
            // player.velocity.y -= 20
            break
        case "d":
            keys.right.pressed = true
            break
    }

});
let startTime = 0
let elapsedTime = 0
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}
const gravity = 0.3
class Gear {
    constructor(x, y, width, height, image) {
        this.position = { x, y }
        this.velocity = {
            x: 1.5,
            y: 0
        }
        this.image = image
        this.width = width
        this.height = height
        this.angle = 0
        this.mixX = 0
        this.maxX = 0

    }
    draw() {
        ctx.save()

        ctx.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        )

        ctx.rotate(this.angle)

        ctx.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        )

        ctx.restore()
    }
    update() {
        this.draw()
        this.angle += 2
        if (this.angle > 360) {
            this.angle = 0
        }
        this.position.x += this.velocity.x
        if (this.position.x < this.minX || this.position.x + this.width > this.maxX) {
            this.velocity.x *= -1
        }
        if (this.position.x + this.width > this.maxX) {
            this.position.x = this.maxX - this.width
        }
        if (this.position.x < this.minX) {
            this.position.x = this.minX
        }

    }
    debugDraw() {
        ctx.strokeStyle = "red"
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height)
    }
}
class Spike {
    constructor(x, y, width, height) {
        this.position = { x, y }
        this.image = createImage("./images/spikes.png")
        this.width = width
        this.height = height
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    debugDraw() {
        ctx.strokeStyle = "red"
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height)
    }
}
class Particle {
    constructor(x, y, radius, color) {
        this.position = { x, y }
        this.velocity = {
            x: Math.random() > 0.5 ? - (Math.random() * 10) + 5 : (Math.random() * 10) + 5,
            y: Math.random() > 0.5 ? - (Math.random() * 10) + 5 : (Math.random() * 10) + 5,
        }
        this.color = color
        this.radius = radius
    }
    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }
    update() {
        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        this.radius *= 0.98
    }
}
let idlePlayerImage = createImage("./images/character_green_idle.png")
let jumpPlayerImage = createImage("./images/character_green_jump.png")
class Player {
    constructor(x, y) {
        this.position = { x, y }
        this.velocity = {
            x: 0,
            y: 1
        }
        this.image = idlePlayerImage
        this.width = this.image.width * 0.6
        this.height = this.image.height * 0.6
        this.speed = 6
        this.alive = true
        this.onGround = false;
    }
    draw() {
        // ctx.fillStyle = this.color
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        }
        if (this.position.y < 0) {
            this.position.y = 0
        }
        if (this.onGround) {
            player.image = idlePlayerImage
        } else {
            player.image = jumpPlayerImage
        }
    }
}
class Platform {
    constructor(x, y, image, repeat = 1) {
        this.position = { x, y }
        this.velocity = {
            x: 0,
            y: 0
        }
        this.image = image
        this.repeat = repeat
        this.width = this.image.width * this.repeat
        this.height = this.image.height
    }
    draw() {
        for (let i = 0; i < this.repeat; i++) {
            ctx.drawImage(this.image, this.position.x + (i * this.image.width), this.position.y)
        }
    }
    debugDraw() {
        ctx.strokeStyle = "red"
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height)
    }

}

class MovingPlatform {
    constructor(x, y, image) {
        this.position = { x, y }
        this.velocity = {
            x: 2,
            y: 0
        }
        this.image = image
        this.width = this.image.width * 0.7
        this.height = this.image.height * 0.7
        this.minX = 0
        this.maxX = 0
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    debugDraw() {
        ctx.strokeStyle = "red"
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
        if (this.position.x < this.minX || this.position.x + this.width > this.maxX) {
            this.velocity.x *= -1
        }
        if (this.position.x + this.width > this.maxX) {
            this.position.x = this.maxX - this.width
        }
        if (this.position.x < this.minX) {
            this.position.x = this.minX
        }
        this.position.x += this.velocity.x

    }

}

class GenericObject {
    constructor(x, y, image) {
        this.position = { x, y }
        this.image = image
        this.width = this.image.width * 0.7
        this.height = this.image.height * 0.7
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

}
class Mushroom {
    constructor(x, y, image) {
        this.position = { x, y }
        this.image = image
        this.width = this.image.width * 0.55
        this.height = this.image.height * 0.55
        this.alive = true
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

}

class Coin {
    constructor(x, y, radius, color) {
        this.position = { x, y }
        this.radius = radius
        this.color = color
        this.alive = true
        this.width = this.radius * 2
        this.height = this.radius * 2
    }
    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "orangered"
        ctx.stroke()
        ctx.closePath()
    }

}
class RepeatingBackground {
    constructor(x, y, image, customHeight = null) {
        this.position = { x, y }
        this.image = image
        this.width = this.image.width
        this.height = customHeight || this.image.height
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        ctx.drawImage(this.image, this.position.x + this.width, this.position.y, this.width, this.height)
        ctx.drawImage(this.image, this.position.x + this.width * 2, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
        if (this.position.x <= - this.width) {
            this.position.x = 0
        }
    }
}


function createImage(imgSrc) {
    const image = new Image()
    image.src = imgSrc
    return image
}
let platformImage = createImage("./images/2.png")
let mainBackgroundImage = createImage("./images/uncolored_piramids.png")
let secondaryBackgroundImage = createImage("./images/background_fade_trees.png")
let gearImage = createImage("./images/saw.png")
let cloud1Image = createImage("./images/cloud1.png")
let cloud2Image = createImage("./images/cloud2.png")
let cloud3Image = createImage("./images/cloud3.png")
let cloudImages = [cloud1Image, cloud2Image, cloud3Image]
let platformSmallImage = createImage("./images/15.png")
let platformSmallLeftImage = createImage("./images/14.png")
let platformSmallRightImage = createImage("./images/16.png")
let cactus1Image = createImage("./images/Cactus (1).png")
let cactus2Image = createImage("./images/Cactus (2).png")
let cactus3Image = createImage("./images/Cactus (3).png")
let tree1Image = createImage("./images/tree30.png")
let tree12Image = createImage("./images/tree12.png")
let tree2Image = createImage("./images/Tree.png")
let grass1Image = createImage("./images/grass1.png")
let grass2Image = createImage("./images/grass2.png")
let grass3Image = createImage("./images/grass3.png")
let grass4Image = createImage("./images/grass4.png")
let grass5Image = createImage("./images/grass5.png")
let bush1Image = createImage("./images/Bush (1).png")
let bush2Image = createImage("./images/Bush (2).png")
let movingPlatformImage = createImage("./images/Crate.png")
let mushroomImage = createImage("./images/spring.png")
let coinImage = createImage("./images/coin.png")
let platformVegetationImages = [
    cactus1Image, cactus2Image, cactus3Image,
    tree1Image, tree12Image, tree2Image,
    grass1Image, grass2Image, grass3Image,
    grass4Image, grass5Image,
    bush1Image, bush2Image
]
let score = 0
let scrollOffset = 0
let platforms = []
let smallPlatforms = []
let genericObjects = []
let player
let gears = []
let spikes = []
let backgrounds = []
let clouds = []
let platformVegetations = [] // includes trees spiky plants and grass etc....
let movingPlatforms = []
let mushrooms = []
let coins = []
let gameWon = false
let savedLevel = null
function saveLevel() {
    savedLevel = {
        platforms: platforms.map(platform => ({
            x: platform.position.x,
            y: platform.position.y,
            repeat: platform.repeat
        })),

        smallPlatforms: smallPlatforms.map(platform => ({
            x: platform.position.x,
            y: platform.position.y,
            repeat: platform.repeat
        })),

        movingPlatforms: movingPlatforms.map(platform => ({
            x: platform.position.x,
            y: platform.position.y,
            repeat: platform.repeat,
            minX: platform.minX,
            maxX: platform.maxX
        })),

        gears: gears.map(gear => ({
            x: gear.position.x,
            y: gear.position.y,
            width: gear.width,
            height: gear.height,
            minX: gear.minX,
            maxX: gear.maxX
        })),

        spikes: spikes.map(spike => ({
            x: spike.position.x,
            y: spike.position.y,
            width: spike.width,
            height: spike.height
        })),

        mushrooms: mushrooms.map(mushroom => ({
            x: mushroom.position.x,
            y: mushroom.position.y
        })),

        coins: coins.map(coin => ({
            x: coin.position.x,
            y: coin.position.y,
            radius: coin.radius,
            color: coin.color
        })),

        platformVegetations: platformVegetations.map(obj => ({
            x: obj.position.x,
            y: obj.position.y,
            image: obj.image
        })),

        // clouds: clouds.map(cloud => ({
        //     x: cloud.position.x,
        //     y: cloud.position.y,
        //     image: cloud.image
        // }))
    }
}
function restartSameLevel() {
    startTime = performance.now()
    elapsedTime = 0
    keys.left.pressed = false
    keys.right.pressed = false
    scrollOffset = 0
    score = 0
    gameWon = false
    particles = []

    player = new Player(50, 400)

    backgrounds = [
        new RepeatingBackground(0, 0, mainBackgroundImage),
        // new RepeatingBackground(0, 300, secondaryBackgroundImage,500),
    ]
    platforms = savedLevel.platforms.map(data =>
        new Platform(data.x, data.y, platformImage, data.repeat)
    )

    smallPlatforms = savedLevel.smallPlatforms.map(data =>
        new Platform(data.x, data.y, platformSmallImage, data.repeat)
    )

    movingPlatforms = savedLevel.movingPlatforms.map(data => {
        let platform = new MovingPlatform(data.x, data.y, movingPlatformImage, data.repeat)
        platform.minX = data.minX
        platform.maxX = data.maxX
        return platform
    })

    gears = savedLevel.gears.map(data => {
        let gear = new Gear(data.x, data.y, data.width, data.height, gearImage)
        gear.minX = data.minX
        gear.maxX = data.maxX
        return gear
    })

    spikes = savedLevel.spikes.map(data =>
        new Spike(data.x, data.y, data.width, data.height)
    )

    mushrooms = savedLevel.mushrooms.map(data =>
        new Mushroom(data.x, data.y, mushroomImage)
    )

    coins = savedLevel.coins.map(data =>
        new Coin(data.x, data.y, data.radius, data.color)
    )

    platformVegetations = savedLevel.platformVegetations.map(data =>
        new GenericObject(data.x, data.y, data.image)
    )

    // clouds = savedLevel.clouds.map(data =>
    //     new GenericObject(data.x, data.y, data.image)
    // )

    requestAnimationFrame(gameLoop)
}
function init() {
    // procedural world generator function
    keys.left.pressed = false
    keys.right.pressed = false
    startTime = performance.now()
    elapsedTime = 0
    scrollOffset = 0
    score = 0
    backgrounds = [
        new RepeatingBackground(0, 0, mainBackgroundImage),
        // new RepeatingBackground(0, 300, secondaryBackgroundImage,500),
    ]
    platformVegetations = []
    let lastCloudX = 0
    clouds = []
    mushrooms = []
    coins = []
    // clouds
    // for (let i = 0; i < 30; i++) {
    //     let gap = (Math.random() * 50) + 50
    //     let x = lastCloudX + gap
    //     let y = (Math.random() * 100) + 50
    //     let randomCloudImgIndex = Math.floor(Math.random() * cloudImages.length)
    //     let randomCloudImg = cloudImages[randomCloudImgIndex]
    //     clouds.push(new GenericObject(x, y, randomCloudImg))
    //     lastCloudX = x + randomCloudImg.width
    // }
    player = new Player(50, 400, 35, 35, "red")
    platforms = [new Platform(0, 568, platformImage, 6)]
    let lastGroundPlatformX = platforms[0].position.x + platforms[0].width
    let lastFloatingPlatformX = 0
    smallPlatforms = []
    gears = []
    spikes = []
    movingPlatforms = []
    let groundPlatformsWithGear = []
    let floatingPlatformsWithGear = []
    //ground platforms
    for (let i = 1; i <= 20; i++) {
        let gap = (Math.random() * 250) + 200
        let x = lastGroundPlatformX + gap
        let repeat = Math.floor(Math.random() * 3) + 2
        let y = 568
        let platform = new Platform(x, y, platformImage, repeat)
        platforms.push(platform)
        lastGroundPlatformX = x + platform.width
    }

    //floating platforms
    for (let i = 1; i <= 19; i++) {
        let gap = (Math.random() * 500) + 500
        let x = lastFloatingPlatformX + gap
        let randomPlatformIndex = Math.floor(Math.random() * platforms.length)
        // let x = (Math.random() * (platforms[randomPlatformIndex].width - platformSmallImage.width)) + platforms[randomPlatformIndex].position.x
        let y = 330
        let repeat = Math.floor(Math.random() * 2) + 2
        let smallPlatform = new Platform(x, y, platformSmallImage, repeat)
        smallPlatforms.push(smallPlatform)
        lastFloatingPlatformX = x + smallPlatform.width
    }
    //mushrooms on floaty platforms
    let floatingPlatformsWithMushrooms = [] // to track to avoid placing more than one mushroom on a single platform
    for (let i = 0; i < 20; i++) {
        let randomPlatformIndex = Math.floor(Math.random() * smallPlatforms.length)
        if (floatingPlatformsWithMushrooms.includes(randomPlatformIndex)) {
            continue
        }
        let smallPlatform = smallPlatforms[randomPlatformIndex]
        let mushroom = new Mushroom(0, 0, mushroomImage)
        let x = Math.random() * (smallPlatform.width - mushroom.width) + smallPlatform.position.x + mushroom.width
        let y = smallPlatform.position.y - mushroom.height
        mushroom.position.x = x
        mushroom.position.y = y
        mushrooms.push(mushroom)
        floatingPlatformsWithMushrooms.push(randomPlatformIndex)
    }
    //mushrooms on ground platforms
    let groundPlatformsWithMushrooms = [] // to track to avoid placing more than one mushroom on a single platform
    for (let i = 0; i < 10; i++) {
        let randomPlatformIndex = Math.floor(Math.random() * platforms.length)
        if (groundPlatformsWithMushrooms.includes(randomPlatformIndex)) {
            continue
        }
        let platform = platforms[randomPlatformIndex]
        let mushroom = new Mushroom(0, 0, mushroomImage)
        let x = Math.random() * (platform.width - mushroom.width) + platform.position.x + mushroom.width
        let y = platform.position.y - mushroom.height
        mushroom.position.x = x
        mushroom.position.y = y
        mushrooms.push(mushroom)
        groundPlatformsWithMushrooms.push(randomPlatformIndex)
    }



    //moving platforms (back and forth)
    let firstPlatformsIndexes = [] // to not spawn more than one moving platform in between other floating platforms (tracking purpose)
    for (let i = 0; i < 20; i++) {
        let randomPlatformIndex = Math.floor(Math.random() * (smallPlatforms.length - 1))
        if (firstPlatformsIndexes.includes(randomPlatformIndex)) {
            continue
        }
        let platform1 = smallPlatforms[randomPlatformIndex]
        let platform2 = smallPlatforms[randomPlatformIndex + 1]
        if (Math.abs((platform1.position.x + platform1.width) - platform2.position.x) > 700) {
            let x = (Math.random() * (platform2.position.x - movingPlatformImage.width)) + platform1.position.x + platform1.width + movingPlatformImage.width
            let y = platform1.position.y
            let movingPlatform = new MovingPlatform(x, y, movingPlatformImage)
            movingPlatform.maxX = platform2.position.x - 100
            movingPlatform.minX = platform1.position.x + platform1.width + 100
            movingPlatforms.push(movingPlatform)
            firstPlatformsIndexes.push(randomPlatformIndex)
        }
    }
    // platform vegetation
    for (let i = 0; i < 20; i++) {
        let randomIndex = Math.floor(Math.random() * platformVegetationImages.length)
        let vegetationImage = platformVegetationImages[randomIndex]
        let randomPlatformIndex = Math.floor(Math.random() * platforms.length)
        let randomPlatform = platforms[randomPlatformIndex]
        let vegetation = new GenericObject(0, 0, vegetationImage)
        let x = (Math.random() * (randomPlatform.width - vegetation.width)) + randomPlatform.position.x
        let y = randomPlatform.position.y - vegetation.height
        vegetation.position.x = x
        vegetation.position.y = y
        let isSafeToSpawn = true
        for (let i = 0; i < platformVegetations.length; i++) {
            let otherVegetation = platformVegetations[i]
            if (isRectToRectCollsion(otherVegetation, vegetation)) {
                isSafeToSpawn = false
            }
        }
        if (isSafeToSpawn) {
            platformVegetations.push(vegetation)
        }
    }
    // floating platform vegetation
    for (let i = 0; i < 20; i++) {
        let randomIndex = Math.floor(Math.random() * platformVegetationImages.length)
        let vegetationImage = platformVegetationImages[randomIndex]
        let randomSmallPlatformIndex = Math.floor(Math.random() * smallPlatforms.length)
        let randomSmallPlatform = smallPlatforms[randomSmallPlatformIndex]
        let vegetation = new GenericObject(0, 0, vegetationImage)
        let x = (Math.random() * (randomSmallPlatform.width - vegetation.width)) + randomSmallPlatform.position.x
        let y = randomSmallPlatform.position.y - vegetation.height
        vegetation.position.x = x
        vegetation.position.y = y
        let isSafeToSpawn = true
        for (let i = 0; i < platformVegetations.length; i++) {
            let otherVegetation = platformVegetations[i]
            if (isRectToRectCollsion(otherVegetation, vegetation)) {
                isSafeToSpawn = false
            }
        }
        if (isSafeToSpawn) {
            platformVegetations.push(vegetation)
        }
    }
    // spinning moving gears on ground platforms
    for (let i = 0; i < 10; i++) {
        let randomPlatformIndex = Math.floor(Math.random() * (platforms.length - 1)) + 1
        let platform = platforms[randomPlatformIndex]
        if (groundPlatformsWithGear.includes(randomPlatformIndex)) {
            continue
        }
        let x = (Math.random() * (platform.width)) + platform.position.x + Math.random() * 50
        let y = platform.position.y - 40
        let gear = new Gear(x, y, 40, 40, gearImage)
        gear.minX = platform.position.x - gear.width / 2
        gear.maxX = platform.position.x + platform.width + gear.width / 2
        gears.push(gear)
        groundPlatformsWithGear.push(randomPlatformIndex)
    }
    // spinning moving gears on floating platforms
    for (let i = 0; i < 10; i++) {
        let randomPlatformIndex = Math.floor(Math.random() * smallPlatforms.length)
        let platform = smallPlatforms[randomPlatformIndex]
        if (floatingPlatformsWithGear.includes(randomPlatformIndex)) {
            continue
        }
        let x = (Math.random() * (platform.width)) + platform.position.x + Math.random() * 50
        let y = platform.position.y - 40
        let gear = new Gear(x, y, 40, 40, gearImage)
        gear.minX = platform.position.x - gear.width / 2
        gear.maxX = platform.position.x + platform.width + gear.width / 2
        gears.push(gear)
        floatingPlatformsWithGear.push(randomPlatformIndex)
    }
    //coins on top of floaty platforms that already have gears on them
    for (let i = 0; i < 20; i++) {
        let randomPlatformIndex = Math.floor(Math.random() * smallPlatforms.length)
        let smallPlatform = smallPlatforms[randomPlatformIndex]
        if (floatingPlatformsWithGear.includes(randomPlatformIndex)) {
            let coin = new Coin(0, 0, 10, "yellow")
            let x = Math.random() * (smallPlatform.width - coin.radius) + smallPlatform.position.x + coin.radius
            let y = smallPlatform.position.y - coin.radius
            coin.position.x = x
            coin.position.y = y
            coins.push(coin)
        }
    }

    //spikes
    for (let i = 0; i < 150; i++) {
        let spike
        let tries = 0
        while (tries < 150) {
            let x = Math.random() * platforms[platforms.length - 1].position.x
            let y = window.innerHeight - 40
            spike = new Spike(x, y, 40, 40)
            let safeToSpawn = true
            for (let i = 0; i < platforms.length; i++) {
                let platform = platforms[i]
                if (isRectToRectCollsion(platform, spike)) {
                    safeToSpawn = false
                    break
                }
            }
            for (let j = 0; j < spikes.length; j++) {
                if (isRectToRectCollsion(spike, spikes[j])) {
                    safeToSpawn = false
                    break
                }
            }
            if (safeToSpawn) {
                spikes.push(spike)
                break
            }
            tries++
        }
    }
    saveLevel()
}
function isRectToRectCollsion(r1, r2) {
    return (r1.position.x + r1.width >= r2.position.x
        && r1.position.x <= r2.position.x + r2.width
        && r1.position.y + r1.height >= r2.position.y
        && r1.position.y <= r2.position.y + r2.height)
}
function isPlayerOnTopOfOtherObject(object) {
    return (
        player.position.y + player.height <= object.position.y
        && player.position.y + player.height + player.velocity.y >= object.position.y
        && player.position.x + player.width >= object.position.x
        && player.position.x <= object.position.x + object.width
    )
}
let particles = []
let speedDistanceScore = 0
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
   if(!player.alive){
    keys.right.pressed = false
    keys.left.pressed = false
   }
    backgrounds.forEach(background => {
        background.update()
    })
    // clouds.forEach(cloud => cloud.draw())
    genericObjects.forEach(genericObject => {
        genericObject.draw()
    })
    platformVegetations.forEach(platformVegetation => {
        platformVegetation.draw()
    })
    mushrooms.forEach(mushroom => mushroom.draw())
    coins.forEach(coin => coin.draw())
    particles.forEach(particle => particle.update())
    particles = particles.filter(particle => particle.radius > 0.2)
    movingPlatforms.forEach(movingPlatform => movingPlatform.update())
    smallPlatforms.forEach(smallPlatform => smallPlatform.draw())
    platforms.forEach(platform => platform.draw())
    if (player.alive) {
         player.update()
         player.onGround = false
    }
    if ((keys.left.pressed && player.position.x > 300)
        || (keys.left.pressed && player.position.x > 0 && scrollOffset === 0)) {
        player.velocity.x = -player.speed
    }
    else if (keys.right.pressed && player.position.x < 500) {
        player.velocity.x = player.speed
    }
    else {
        player.velocity.x = 0
        if (keys.right.pressed) {
            platforms.forEach(platform => {
                platform.position.x -= player.speed

            })
            smallPlatforms.forEach(smallPlatform => {
                smallPlatform.position.x -= player.speed
            })
            movingPlatforms.forEach(movingPlatform => {
                movingPlatform.position.x -= player.speed
                movingPlatform.maxX -= player.speed
                movingPlatform.minX -= player.speed
            })
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * 0.66
            })
            mushrooms.forEach(mushroom => {
                mushroom.position.x -= player.speed
            })
            coins.forEach(coin => {
                coin.position.x -= player.speed
            })
            // clouds.forEach(cloud => {
            //     cloud.position.x -= player.speed * 0.33
            // })
            backgrounds.forEach(background => {
                background.position.x -= player.speed * 0.20
            })
            platformVegetations.forEach(platformVegetation => {
                platformVegetation.position.x -= player.speed

            })
            gears.forEach(gear => {
                gear.position.x -= player.speed
                gear.maxX -= player.speed
                gear.minX -= player.speed
            })
            spikes.forEach(spike => {
                spike.position.x -= player.speed
            })
            scrollOffset += player.speed
        }
        if (keys.left.pressed && scrollOffset > 0) {
            platforms.forEach(platform => {
                platform.position.x += player.speed

            })
            smallPlatforms.forEach(smallPlatform => {
                smallPlatform.position.x += player.speed
            })
            movingPlatforms.forEach(movingPlatform => {
                movingPlatform.position.x += player.speed
                movingPlatform.maxX += player.speed
                movingPlatform.minX += player.speed
            })
            backgrounds.forEach(background => {
                background.position.x += player.speed * 0.20
            })
            // clouds.forEach(cloud => {
            //     cloud.position.x += player.speed * 0.33
            // })
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * 0.66
            })
            mushrooms.forEach(mushroom => {
                mushroom.position.x += player.speed
            })
            coins.forEach(coin => {
                coin.position.x += player.speed
            })
            platformVegetations.forEach(platformVegetation => {
                platformVegetation.position.x += player.speed
            })
            gears.forEach(gear => {
                gear.position.x += player.speed
                gear.maxX += player.speed
                gear.minX += player.speed
            })
            spikes.forEach(spike => {
                spike.position.x += player.speed
            })
            scrollOffset -= player.speed
        }
    }
    platforms.forEach(platform => {
        if (isPlayerOnTopOfOtherObject(platform)) {
            player.onGround = true
            if (player.velocity.y > 15) {  // Hard landing!
                for (let i = 0; i < 30; i++) {
                    particles.push(new Particle(
                        player.position.x + player.width / 2,
                        player.position.y + player.height,
                        3,
                        "#8B7355"  // Dust color
                    ))
                }
            }
            player.velocity.y = 0
        }
    })
    smallPlatforms.forEach(smallPlatform => {

        if (isPlayerOnTopOfOtherObject(smallPlatform)) {
            player.onGround = true
            if (player.velocity.y > 15) {  // Hard landing!
                for (let i = 0; i < 30; i++) {
                    particles.push(new Particle(
                        player.position.x + player.width / 2,
                        player.position.y + player.height,
                        3,
                        "#8B7355"  // Dust color
                    ))
                }
            }
            player.velocity.y = 0
        }
    })
 movingPlatforms.forEach(movingPlatform => {
    if (isPlayerOnTopOfOtherObject(movingPlatform)) {
        player.onGround = true
        player.velocity.y = 0
        let platformMove = movingPlatform.velocity.x
        //  player.position.x += platformMove
        // Platform moving right
        if (platformMove > 0) {
                platforms.forEach(platform => platform.position.x -= platformMove)
                smallPlatforms.forEach(platform => platform.position.x -= platformMove)

                movingPlatforms.forEach(platform => {
                    platform.position.x -= platformMove
                    platform.maxX -= platformMove
                    platform.minX -= platformMove
                })

                mushrooms.forEach(mushroom => mushroom.position.x -= platformMove)
                coins.forEach(coin => coin.position.x -= platformMove)
                platformVegetations.forEach(obj => obj.position.x -= platformMove)

                gears.forEach(gear => {
                    gear.position.x -= platformMove
                    gear.maxX -= platformMove
                    gear.minX -= platformMove
                })

                spikes.forEach(spike => spike.position.x -= platformMove)
                backgrounds.forEach(bg => bg.position.x -= platformMove * 0.20)

                scrollOffset += platformMove
            }

        // Platform moving left
        else if (platformMove < 0) {
         
                platforms.forEach(platform => platform.position.x -= platformMove)
                smallPlatforms.forEach(platform => platform.position.x -= platformMove)

                movingPlatforms.forEach(platform => {
                    platform.position.x -= platformMove
                    platform.maxX -= platformMove
                    platform.minX -= platformMove
                })

                mushrooms.forEach(mushroom => mushroom.position.x -= platformMove)
                coins.forEach(coin => coin.position.x -= platformMove)
                platformVegetations.forEach(obj => obj.position.x -= platformMove)

                gears.forEach(gear => {
                    gear.position.x -= platformMove
                    gear.maxX -= platformMove
                    gear.minX -= platformMove
                })

                spikes.forEach(spike => spike.position.x -= platformMove)
                backgrounds.forEach(bg => bg.position.x -= platformMove * 0.20)

                scrollOffset += platformMove
            }
        }
})
    mushrooms.forEach(mushroom => {

        if (isPlayerOnTopOfOtherObject(mushroom)) {
            player.onGround = true
            mushroom.alive = false
            player.velocity.y *= -1
            if (Math.abs(player.velocity.y) < 30) player.velocity.y -= 2
            for (let i = 0; i < 40; i++) {
                particles.push(new Particle(mushroom.position.x, mushroom.position.y, 4, "skyblue"))
            }
        }
    })
    coins.forEach(coin => {
        if (isRectToRectCollsion(coin, player) && player.alive) {
            coin.alive = false
            score += 5
            for (let i = 0; i < 40; i++) {
                particles.push(new Particle(coin.position.x, coin.position.y, 5, "yellow"))
            }
        }
    })
    mushrooms = mushrooms.filter(mushroom => mushroom.alive === true)
    coins = coins.filter(coin => coin.alive === true)
    gears.forEach(gear => {
        gear.update()
        if (isRectToRectCollsion(gear, player) && player.alive) {
            player.alive = false
            for (let i = 0; i < 30; i++) {
                particles.push(new Particle(player.position.x, player.position.y, 5, "red"))
            }
        }
    })
    spikes.forEach(spike => {
        spike.draw()
        //   spike.debugDraw()
        if (isRectToRectCollsion(spike, player) && player.alive) {
            player.alive = false
            for (let i = 0; i < 30; i++) {
                particles.push(new Particle(player.position.x, player.position.y, 5, "red"))
            }
        }
        return
    })
    if (player.position.y > canvas.height || !player.alive && particles.length === 0) {
        player.alive = false
        ctx.font = "30px Arial"
        ctx.fillStyle = "black"
        ctx.fillText(
            "Press Space to play again or press n to play new level",
            canvas.width / 2 - 1300,
            100
        )
        return
    }
    if (player.position.x > platforms[platforms.length - 1].position.x) {
        gameWon = true
    }
    if (gameWon && particles.length === 0) {
        ctx.font = "30px Arial"
        ctx.fillStyle = "black"
        ctx.fillText("You Won! Press Space to play again or press n to play new level", canvas.width / 2 - 1300, 100)
        return
    }
    requestAnimationFrame(gameLoop)
}
init()
requestAnimationFrame(gameLoop)
