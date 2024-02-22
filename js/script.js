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

// Just to track what state the program is in
const STATE = {
    STARTUP: `STARTUP`,
    DETECTING: `DETECTING`
};
let state = STATE.STARTUP;

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
        leftDataIndex: 195,
        rightDataIndex: 195,
    },
    {
        name: `mouth`,
        emoji: `👄`,
        leftDataIndex: 14,
        rightDataIndex: 14,
    },
];

/**
 * Description of preload
*/
function preload() {

}


/**
Create the canvas, start the webcam, start up Facemesh
*/
function setup() {
    createCanvas(640, 480);

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

    push();
    fill(255);
    textAlign(CENTER, CENTER);
    text(`Loading Facemesh...`, width / 2, height / 2);
    pop();
}

/**
Displays the video feed and the emoji mapped on top of it
*/
function detecting() {
    background(200, 127, 120);

    // Show the webcam
    image(video, 0, 0);

    // Default text settings
    textSize(48);
    textAlign(CENTER, CENTER);
    // Go through all the current results
    for (let result of results) {
        // Go through each of the possible features we're mapping
        for (let feature of face) {
            // Get the scaled mesh data for the current result (the data that
            // tells us where the features are located)
            const data = result.scaledMesh;
            // Calculate x as halfway between the left and right coordinates
            // of that feature
            const x = halfwayBetween(data[feature.leftDataIndex][0], data[feature.rightDataIndex][0]);
            const y = halfwayBetween(data[feature.leftDataIndex][1], data[feature.rightDataIndex][1]);
            // Display the emoji there
            text(feature.emoji, x, y);
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

/** move the background of the html site */
function moveBackground() {
    backgroundPos++;
    document.getElementById("body").style.backgroundPosition = `${backgroundPos}px ${backgroundPos}px`;
}