/**
 * Title of Project
 * Author Name
 * 
 * This is a template. You must fill in the title, author, 
 * and this description to match your project!
 */

"use strict";
//html
let backgroundPos = 0;
setInterval(moveBackground, 50);

// Our face detector
let facemesh;
// Our webcam feed
let video;
// To store the current results set
let results = [];
let angle;
let xDiff;
let yDiff;
// Just to track what state the program is in
const STATE = {
    STARTUP: `STARTUP`,
    DETECTING: `DETECTING`
};
let state = STATE.STARTUP;
//assets
let mouthOpenImg, mouthMidImg, mouthClosedImg;
// Our data for displaying the features and locating the correct
// Facemesh data. We're using both a left and right point so we can
// position features in the centerpoint
let face = [
    {
        name: `left eye`,
        emoji: `👁️`,
        leftDataIndex: 33,
        rightDataIndex: 133,
    },
    {
        name: `right eye`,
        emoji: `👁️`,
        leftDataIndex: 362,
        rightDataIndex: 263,
    },
    {
        name: `nose`,
        emoji: `👃`,
        leftDataIndex: 236,
        rightDataIndex: 456,
    },
    {
        name: `mouth`,
        emoji: `👄`,
        leftDataIndex: 61,
        rightDataIndex: 291,
        upDataIndex: 13,
        downDataIndex: 14
    },
];

/**
 * Description of preload
*/
function preload() {
    mouthClosedImg = loadImage('assets/images/closedMouth.png');
    mouthOpenImg = loadImage('assets/images/openMouth.png');
    mouthMidImg = loadImage('assets/images/midMouth.png');
}


/**
Create the canvas, start the webcam, start up Facemesh
*/
function setup() {
    //canvas & default settings setup
    width = windowWidth * 0.6;
    height = width * 0.75;
    createCanvas(width, height);
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255);
    angleMode(DEGREES);
    // Set up and start the webcam
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    // Start up Facemesh
    facemesh = ml5.facemesh(video, modelLoaded);
}

/**
Called when Facemesh is ready to start detection
*/
function modelLoaded() {
    // Now we know we're ready we can switch states
    state = STATE.DETECTING;
    // What to do 
    facemesh.on('face', handleFaceDetection);
}

/**
Displays based on the current state
*/
function draw() {
    switch (state) {
        case STATE.STARTUP:
            startup();
            break;
        case STATE.DETECTING:
            detecting();
            break;
    }
}

/**
Tells the user we're getting started with loading Facemesh
*/
function startup() {
    background(0);
    text(`Loading...`, width / 2, height / 2);
}

/**
Displays the video feed and the emoji mapped on top of it
*/
function detecting() {
    background(200, 127, 120);
    // Show the webcam
    image(video, 0, 0, width, height);
    // Go through all the current results
    for (let result of results) {
        // Go through each of the possible features we're mapping
        for (let feature of face) {
            // Get the scaled mesh data for the current result (the data that
            // tells us where the features are located)
            const data = result.scaledMesh;
            // Calculate x as halfway between the left and right coordinates
            // of that feature
            const x = (halfwayBetween(data[feature.leftDataIndex][0], data[feature.rightDataIndex][0])) * (width / 640);
            const y = (halfwayBetween(data[feature.leftDataIndex][1], data[feature.rightDataIndex][1])) * (height / 480);
            //Calculate and get feature angle
            xDiff = data[feature.leftDataIndex][0] - data[feature.rightDataIndex][0];
            yDiff = data[feature.leftDataIndex][1] - data[feature.rightDataIndex][1];
            angle = (Math.atan2(yDiff, xDiff) * 180 / Math.PI);
            switch (feature.name) {
                case "mouth":
                    push();
                    imageMode(CENTER);
                    translate(x, y);
                    rotate(angle - 180);
                    let wideness = distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]);
                    if ((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.35) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) {
                        console.log(`mouthOpen`);
                        image(mouthOpenImg, 0, 0, wideness * 2.2, wideness * 3)
                    } else if ((distanceBetweenPoints(data[feature.leftDataIndex][0], data[feature.leftDataIndex][1], data[feature.rightDataIndex][0], data[feature.rightDataIndex][1]) * 0.15) < (distanceBetweenPoints(data[feature.upDataIndex][0], data[feature.upDataIndex][1], data[feature.downDataIndex][0], data[feature.downDataIndex][1]))) {
                        console.log(`mouthMid`);
                        image(mouthMidImg, 0, 0, wideness * 2, wideness * 2)
                    } else {
                        console.log(`mouthClosed`);
                        image(mouthClosedImg, 0, 0, wideness * 2, wideness)
                    }
                    pop();
                    break;
                default:
                    push();
                    translate(x, y);
                    rotate(angle - 180);
                    // Display the emoji there
                    text(feature.emoji, 0, 0);
                    pop();
                    break;
            }
        }
    }
}

/**
Calculates the number halfway between a and b. Could also use lerp.
*/
function halfwayBetween(a, b) {
    return a + (b - a) / 2;
}

/**
Called by Facemesh when it sees a face, just stores the data in results
so we can see it in detecting()
*/
function handleFaceDetection(data) {
    if (data.length > 0) {
        results = data;
    }
}

/** returns the distance between two cartesian points */
const distanceBetweenPoints = (x1, y1, x2, y2) => Math.abs((Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))));

/** move the background of the html site */
function moveBackground() {
    backgroundPos++;
    document.getElementById("body").style.backgroundPosition = `${backgroundPos}px ${backgroundPos}px`;
}