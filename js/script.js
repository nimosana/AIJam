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

/**
 * Description of preload
*/
function preload() {

}


/**
 * Description of setup
*/
function setup() {
    width = windowWidth * 0.8;
    height = windowWidth * 0.75;
    createCanvas(640, 480);
}


/**
 * Description of draw()
*/
function draw() {
    background(0);
}

/** move the background of the html site */
function moveBackground() {
    backgroundPos++;
    document.getElementById("body").style.backgroundPosition = `${backgroundPos}px ${backgroundPos}px`;
}