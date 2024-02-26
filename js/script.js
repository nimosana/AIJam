/** Karaoke & cookies
 * @author Nicolas Morales-Sanabria
 * 
 * Face features have been replaced for images, now drawn depending on the size/angle of 
 * the face features for a more realistic effect. The mouth notably uses facemesh
 * data to display different images depending on how open it is and where it's facing,
 * to interpret and animate its movement. Eyes are rainbow, and cookies fall from the
 * sky! A music playlist starts along with facemesh, to incite the user to karaoke and 
 * play with the mouth effect, eating cookies along the way. The user can control the 
 * music and the playlist for an enjoyable moment! 
 * 
 * For the project, I created a library (p5.playlistPlayer.js) which allows for the
 * music and playlist controls featured. 
 * 
 * Attributions:
 * This ml5.js project, is based on Pippin Barr's "Emoji Disguise" p5 project.
 * Link to Emoji Disguise https://editor.p5js.org/pippinbarr/sketches/Q_enkvSTc.
 * 
 * This project uses songs from various artists:
 * Hotel California, by Eagles,
 * Bohemian Rhapsody by Queen,
 * I Will survive by Gloria Gaynor,
 * Livin' on a Prayer by Bon Jovi,
 * Paint it, Black by The Rolling Stones,
 * Wonderwall by Oasis 
 * 
 * Please note that their use in this project is for educational and non-commercial
 * purposes, all credits and rights belong to their respective copyright holders. */
"use strict";
//html
let backgroundPos = 0;
setInterval(moveBackground, 50);
// Our face detector
let facemesh;
// Our webcam feed
let video;
// Store the current results set and related data
let results = [];
let cookies = [];
let angle;
let xDiff, yDiff;
let wideness;
// Track what state the program is in
const STATE = {
    STARTUP: `STARTUP`,
    DETECTING: `DETECTING`
};
let cooldown = 0;
let state = STATE.STARTUP;
//assets
let mouthClosedImg1, mouthClosedImg2, mouthClosedImg3, mouthMidImg1, mouthMidImg2, mouthMidImg3, mouthOpenImg1, mouthOpenImg2;
let eyeLeftImg, eyeRightImg;
let noseImg;
let cookieImg;
let cookieCrunch;
//music
let playlist;
let musicPlayer;
// Our data for displaying the features and locating the correct
// Facemesh data. We're using both a left and right point so we can
// position features in the centerpoint
let face = [{
    name: `left eye`,
    leftDataIndex: 33,
    rightDataIndex: 133,
    hue: -1,
    img: undefined
}, {
    name: `right eye`,
    leftDataIndex: 362,
    rightDataIndex: 263,
    hue: 49,
    img: undefined
}, {
    name: `nose`,
    leftDataIndex: 198,
    rightDataIndex: 420,
}, {
    name: `mouth`,
    leftDataIndex: 61,
    rightDataIndex: 291,
    upDataIndex: 13,
    downDataIndex: 14,
}];

/** Loads necessary assets, ie. Images and sounds used. 
 * prepares the playlist for the PlaylistPlayer*/
function preload() {
    //cookie assets
    cookieCrunch = loadSound('assets/sounds/crunch.mp3');
    cookieImg = loadImage('assets/images/cookie.png');
    //nose image
    noseImg = loadImage('assets/images/nose.png');
    //eye images
    face[0].img = loadImage('assets/images/eyeLeft.png');
    face[1].img = loadImage('assets/images/eyeRight.png');
    //mouth images
    mouthClosedImg1 = loadImage('assets/images/mouthClosed1.png');
    mouthClosedImg2 = loadImage('assets/images/mouthClosed2.png');
    mouthClosedImg3 = loadImage('assets/images/mouthClosed3.png');
    mouthMidImg1 = loadImage('assets/images/mouthMid1.png');
    mouthMidImg2 = loadImage('assets/images/mouthMid2.png');
    mouthMidImg3 = loadImage('assets/images/mouthMid3.png');
    mouthOpenImg1 = loadImage('assets/images/mouthOpen1.png');
    mouthOpenImg2 = loadImage('assets/images/mouthOpen2.png');
    //playlist for the karaoke
    playlist = [{
        sound: loadSound('assets/sounds/Eagles_Hotel-California.mp3'),
        name: `Hotel California`,
        artist: `Eagles`
    }, {
        sound: loadSound('assets/sounds/Queen_Bohemian-Rhapsody.mp3'),
        name: `Bohemian Rhapsody`,
        artist: `Queen`
    }, {
        sound: loadSound('assets/sounds/Gloria-Gaynor_I-Will-Survive.mp3'),
        name: `I will Survive`,
        artist: `Gloria Gaynor`
    }, {
        sound: loadSound('assets/sounds/Bon-Jovi_Livin-On-A-Prayer.mp3'),
        name: `Livin' on a Prayer`,
        artist: `Bon Jovi`
    }, {
        sound: loadSound('assets/sounds/The-Rolling-Stones_Paint-It-Black.mp3'),
        name: `Paint it, Black`,
        artist: `The Rolling Stones`
    }, {
        sound: loadSound('assets/sounds/Oasis_Wonderwall.mp3'),
        name: `Wonderwall`,
        artist: `Oasis`
    }];
}

/** setup the canvas, initial settings, then start the webcam and Facemesh */
function setup() {
    //canvas & default settings setup
    width = windowWidth * 0.6;
    height = width * 0.75;
    createCanvas(width, height);
    console.log(`width ${width}, height ${height}`);
    textAlign(CENTER, CENTER);
    textSize(width * 0.05);
    fill(255);
    colorMode(HSB, 100);
    angleMode(DEGREES);
    // Set up and start the webcam
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    // Start up Facemesh
    facemesh = ml5.facemesh(video, modelLoaded);
    //create the karaoke playlist
    musicPlayer = new PlaylistPlayer(`karaoke`, playlist);
}

/** Called when Facemesh is ready to start detection */
function modelLoaded() {
    // Now we know we're ready we can switch states
    state = STATE.DETECTING;
    // What to do 
    facemesh.on('face', handleFaceDetection);
    musicPlayer.playlistStart();
}

/** Displays/calculates based on the current state */
function draw() {
    cooldown++;
    switch (state) {
        case STATE.STARTUP:
            startup();
            break;
        case STATE.DETECTING:
            push();
            translate(width, 0);
            scale(-1, 1);
            detecting();
            spawnAndMoveCookies(0.03, random(width * 0.01, width * 0.06));
            pop();
            displayKaraokeText();
            break;
    }
    playlistKeyControls();
}

/** Tells the user we're getting started with loading Facemesh */
function startup() {
    background(0);
    text(`Loading...`, width / 2, height / 2);
}

/** Displays the video feed and the images on any facemesh detected faces */
function detecting() {
    background(200, 127, 120);
    // Show the webcam
    image(video, 0, 0, width, height);
    // Go through all the current results
    for (let result of results) {
        // Go through each of the possible features we're mapping
        for (let feature of face) {
            // Get the scaled mesh data for the current result (the data that tells us where the features are located)
            const data = result.scaledMesh;
            // Calculate x as halfway between the left and right coordinates of that feature (scaled)
            const x = (halfwayBetween(data[feature.leftDataIndex][0], data[feature.rightDataIndex][0])) * (width / 640);
            const y = (halfwayBetween(data[feature.leftDataIndex][1], data[feature.rightDataIndex][1])) * (height / 480);
            //Calculate and get feature angle
            xDiff = data[feature.leftDataIndex][0] - data[feature.rightDataIndex][0];
            yDiff = data[feature.leftDataIndex][1] - data[feature.rightDataIndex][1];
            angle = (Math.atan2(yDiff, xDiff) * 180 / Math.PI);
            wideness = distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]);
            push();
            imageMode(CENTER);
            translate(x, y);
            rotate(angle - 180);
            switch (feature.name) {
                case "mouth":
                    mouthMovements(data, x, y, feature, wideness);
                    pop();
                    break;
                case "left eye":
                    drawEyeWithHue(feature);
                    pop();
                    break;
                case "right eye":
                    drawEyeWithHue(feature);
                    pop();
                    break;
                case "nose":
                    image(noseImg, 0, 0, wideness * 3, wideness * 3);
                    pop();
                    break;
                default:
                    console.log("feature not recognized");
                    pop();
                    break;
            }
        }
    }
}

/** When Facemesh sees a face, stores the data in results to use in detecting() */
function handleFaceDetection(data) {
    if (data.length > 0) {
        results = data;
    }
}

/** Displays different images of the mouth depending on the ratio of mouth width/opening
 * (how wide it is open). Also checks for cookie eating if mouth's open enough
 * @param data facemesh data
 * @param x center X coord of the mouth
 * @param y center Y coord of the mouth
 * @param feature feature (in context mapped features of the detecting() array)
 * @param wideness width from side to side of the mouth */
function mouthMovements(data, x, y, feature, wideness) {
    if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.5) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] > data[feature.rightDataIndex][1]) {
        image(mouthOpenImg2, 0, 0, wideness * 2.3, wideness * 3);
        cookieEating(x, y, wideness * 2);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.5) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] < data[feature.rightDataIndex][1]) {
        push();
        scale(-1, 1);
        image(mouthOpenImg2, 0, 0, wideness * 2.3, wideness * 3);
        cookieEating(x, y, wideness * 2);
        pop();
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.4) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] > data[feature.rightDataIndex][1]) {
        image(mouthOpenImg1, 0, 0, wideness * 2, wideness * 2.5);
        cookieEating(x, y, wideness * 2);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.4) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] < data[feature.rightDataIndex][1]) {
        push();
        scale(-1, 1);
        image(mouthOpenImg1, 0, 0, wideness * 2, wideness * 2.5);
        pop();
        cookieEating(x, y, wideness * 2);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.26) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] > data[feature.rightDataIndex][1]) {
        image(mouthMidImg3, 0, 0, wideness * 2, wideness * 2);
        cookieEating(x, y, wideness * 2);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.26) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] < data[feature.rightDataIndex][1]) {
        push();
        scale(-1, 1);
        image(mouthMidImg3, 0, 0, wideness * 2, wideness * 2);
        pop();
        cookieEating(x, y, wideness * 2);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.18) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] > data[feature.rightDataIndex][1]) {
        image(mouthMidImg2, 0, 0, wideness * 2, wideness * 2);
        cookieEating(x, y, wideness * 2);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.18) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] < data[feature.rightDataIndex][1]) {
        push();
        scale(-1, 1);
        image(mouthMidImg2, 0, 0, wideness * 2, wideness * 2);
        pop();
        cookieEating(x, y, wideness * 2);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.14) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] > data[feature.rightDataIndex][1]) {
        image(mouthMidImg1, 0, 0, wideness * 2, wideness * 1.75);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.14) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] < data[feature.rightDataIndex][1]) {
        push();
        scale(-1, 1);
        image(mouthMidImg1, 0, 0, wideness * 2, wideness * 1.75);
        pop();
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.07) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] > data[feature.rightDataIndex][1]) {
        image(mouthClosedImg3, 0, 0, wideness * 2, wideness * 1.5);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.07) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] < data[feature.rightDataIndex][1]) {
        push();
        scale(-1, 1);
        image(mouthClosedImg3, 0, 0, wideness * 2, wideness * 1.5);
        pop();
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.04) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] > data[feature.rightDataIndex][1]) {
        image(mouthClosedImg2, 0, 0, wideness * 2, wideness);
    } else if (((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.04) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) && data[feature.leftDataIndex][1] < data[feature.rightDataIndex][1]) {
        push();
        scale(-1, 1);
        image(mouthClosedImg2, 0, 0, wideness * 2, wideness);
        pop();
    } else {
        image(mouthClosedImg1, 0, 0, wideness * 2, wideness);
    }
}

/** displays text for playing song info & controls for the musicPlayer */
function displayKaraokeText() {
    push();
    fill(random(0, 100), random(0, 100), 100);
    textAlign(LEFT, TOP);
    text(`KARAOKE TIME!!!`, 0, 0);
    textAlign(RIGHT, TOP)
    textSize(width * 0.025);
    fill(100, 0, 100);
    text(`Playing: ${musicPlayer.currentlyPlaying.name}
    Artist: ${musicPlayer.currentlyPlaying.artist}
    Volume: ${musicPlayer.volume}, controls: + -
    Pause: Q
    Resume: W
    Skip: E
    Stop/Reset: R
    Start(after reset): T`, width, 0);
    pop();
}

/** continuously shifts the hue of the eye and draws it 
 * @param eye the eye to draw */
function drawEyeWithHue(eye) {
    eye.hue++;
    if (eye.hue > 100) {
        eye.hue = 0;
    }
    tint(eye.hue, 50, 100);
    image(eye.img, 0, 0, wideness * 2, wideness);
}

/** Spawns and makes cookies fall, spawn rates and cookie sizes are customizable. 
 * The cookie will fall from the top of the screen and be deleted when it reaches
 * the bottom.
 * @param odds % chance of spawning cookies 
 * @param size cookie size (for creation) */
function spawnAndMoveCookies(odds, size) {
    //spawn cookie
    if (cookies.length < 10 && random(0, 1) <= odds) {
        let x = random(0 + size, width - size);
        let y = -size;
        cookies.push({
            x: x,
            y: y,
            vy: 0,
            size: size
        });
    }
    //move the cookies
    for (let i = cookies.length - 1; i >= 0; i--) {
        cookies[i].vy += 0.5;
        cookies[i].y = cookies[i].y + cookies[i].vy;
        push();
        imageMode(CENTER);
        image(cookieImg, cookies[i].x, cookies[i].y, cookies[i].size * 2, cookies[i].size * 2);
        pop();
        if (cookies[i].y > height + cookies[i].size) {
            cookies.splice(i, 1); //delete if reached the bottom
        }
    }
}

/** Checks contact between mouth and cookies, if true:
 * makes a crunching sound and removes the cookie
 * @param mouthX center X coordinate of the mouth
 * @param mouthY center Y coordinate of the mouth
 * @param wideness width of the mouth */
function cookieEating(mouthX, mouthY, wideness) {
    for (let i = cookies.length - 1; i >= 0; i--) {
        if (dist(mouthX, mouthY, cookies[i].x, cookies[i].y) < (wideness / 2 + cookies[i].size / 2)) {
            cookies.splice(i, 1);
            cookieCrunch.play();
        }
    }
}

/** allows control/usage of the different playlist functions */
function playlistKeyControls() {
    if (keyIsDown(81)) {
        musicPlayer.playlistPause();
    } else if (keyIsDown(87)) {
        musicPlayer.playlistResume();
    } else if (keyIsDown(69) && cooldown > 30) {
        cooldown = 0;
        musicPlayer.playlistNext();
    } else if (keyIsDown(82)) {
        musicPlayer.playlistStop();
    } else if (keyIsDown(84)) {
        musicPlayer.playlistStart();
    } //playlist volume key controls
    if (keyIsDown(61) || keyIsDown(187)) {
        musicPlayer.playlistVolume(musicPlayer.volume += 0.02);
    } else if (keyIsDown(173) || keyIsDown(189)) {
        musicPlayer.playlistVolume(musicPlayer.volume -= 0.02);
    }
}

/** Calculates the number halfway between a and b. Could also use lerp.*/
const halfwayBetween = (a, b) => a + (b - a) / 2;

/** returns the distance between two cartesian points */
const distanceBetweenPoints = (x1, y1, x2, y2) => Math.abs((Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))));

/** move the background of the html site */
function moveBackground() {
    backgroundPos++;
    if (backgroundPos > 680) {
        backgroundPos = 1;
    }
    document.getElementById("body").style.backgroundPosition = `${backgroundPos}px ${backgroundPos}px`;
}