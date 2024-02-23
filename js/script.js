/** Title of Project
 * Author Name
 * 
 * This is a template. You must fill in the title, author, 
 * and this description to match your project!  */

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
let state = STATE.STARTUP;
//assets
let mouthOpenImg, mouthMidImg, mouthClosedImg;
let eyeLeftImg, eyeRightImg;
let noseImg;
let cookieImg;
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

/** Description of preload */
function preload() {
    cookieImg = loadImage('assets/images/cookie.png');
    //nose image
    noseImg = loadImage('assets/images/nose.png');
    //eye images
    face[0].img = loadImage('assets/images/eyeLeft.png');
    face[1].img = loadImage('assets/images/eyeRight.png');
    //mouth images
    mouthClosedImg = loadImage('assets/images/mouthClosed.png');
    mouthMidImg = loadImage('assets/images/mouthMid.png');
    mouthOpenImg = loadImage('assets/images/mouthOpen.png');
}

/** setup the canvas, initial settings, then start the webcam and Facemesh */
function setup() {
    //canvas & default settings setup
    width = windowWidth * 0.6;
    height = width * 0.75;
    createCanvas(width, height);
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255);
    colorMode(HSB, 100);
    angleMode(DEGREES);
    // Set up and start the webcam
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    // Start up Facemesh
    facemesh = ml5.facemesh(video, modelLoaded);
}

/** Called when Facemesh is ready to start detection */
function modelLoaded() {
    // Now we know we're ready we can switch states
    state = STATE.DETECTING;
    // What to do 
    facemesh.on('face', handleFaceDetection);
}

/** Displays based on the current state */
function draw() {
    switch (state) {
        case STATE.STARTUP:
            startup();
            break;
        case STATE.DETECTING:
            push();
            translate(width, 0);
            scale(-1, 1);
            detecting();
            randomlySpawnCookies(0.02, 50);
            pop();
            break;
    }
}

/** Tells the user we're getting started with loading Facemesh */
function startup() {
    background(0);
    text(`Loading...`, width / 2, height / 2);
}

/** Displays the video feed and the emoji mapped on top of it */
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
                    if ((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.3) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) {
                        image(mouthOpenImg, 0, 0, wideness * 2.2, wideness * 3);
                        // ellipse(0, 0, wideness * 2);
                        cookieEating(x, y, wideness * 2);
                    } else if ((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.1) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) {
                        image(mouthMidImg, 0, 0, wideness * 2, wideness * 2);
                        // ellipse(0, 0, wideness * 2);
                        cookieEating(x, y, wideness * 2);
                    } else {
                        image(mouthClosedImg, 0, 0, wideness * 2, wideness);
                    }
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

/** continuously shifts the hue of the eye and draws it */
function drawEyeWithHue(eye) {
    eye.hue++;
    if (eye.hue > 100) {
        eye.hue = 0;
    }
    tint(eye.hue, 50, 100);
    image(eye.img, 0, 0, wideness * 2, wideness);
}

function randomlySpawnCookies(odds, size) {
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
    for (let i = cookies.length - 1; i >= 0; i--) {
        cookies[i].vy += 0.5;
        cookies[i].y = cookies[i].y + cookies[i].vy;
        push();
        imageMode(CENTER);
        image(cookieImg, cookies[i].x, cookies[i].y, cookies[i].size * 2, cookies[i].size * 2);
        pop();
        if (cookies[i].y > height + cookies[i].size) {
            cookies.splice(i, 1);
        }
    }
}

function cookieEating(mouthX, mouthY, wideness) {
    for (let i = cookies.length - 1; i >= 0; i--) {
        if (dist(mouthX, mouthY, cookies[i].x, cookies[i].y) < (wideness / 2 + cookies[i].size / 2)) {
            cookies.splice(i, 1);
        }
    }
}

/** Calculates the number halfway between a and b. Could also use lerp.*/
const halfwayBetween = (a, b) => a + (b - a) / 2;

/** returns the distance between two cartesian points */
const distanceBetweenPoints = (x1, y1, x2, y2) => Math.abs((Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))));

/** move the background of the html site */
function moveBackground() {
    backgroundPos++;
    document.getElementById("body").style.backgroundPosition = `${backgroundPos}px ${backgroundPos}px`;
}