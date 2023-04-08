const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const cos = Math.cos
const sin = Math.sin

const imageData = ctx.createImageData(100, 100);

// Iterate through every pixel
// for (let i = 0; i < imageData.data.length; i += 4) {
//   // Modify pixel data
//   imageData.data[i + 0] = 190 * ((i / 4) % 2); // R value
//   imageData.data[i + 1] = 0; // G value
//   imageData.data[i + 2] = 210  * ((i / 4) % 2) ; // B value
//   imageData.data[i + 3] = 255; // A value
// }

// Iterate through every pixel
// for (let i = 0; i < imageData.data.length; i += 4) {
//   mid = imageData.data.length / 2;
//   if (i > mid) {
//     break;
//   }
//   // Modify pixel data
//   imageData.data[i + 0] = 190 * ((i / 4) % 2); // R value
//   imageData.data[i + 1] = 0; // G value
//   imageData.data[i + 2] = 210  * ((i / 4) % 2) ; // B value
//   imageData.data[i + 3] = 255; // A value
// }
// i = 50 * 4;
// for (let j = 0; j < 16; j++) {
//     rowoffset = j * imageData.width * 4;
//     for (let spo = 0; spo < 3; spo++) { // subpixel offset
//         imageData.data[rowoffset + i + spo] = 0;
//     }
//     imageData.data[rowoffset + i + 3] = 255; // A value
// }


// // try to draw a circle
TAU = Math.PI * 2
CENTER = [50, 50]
RADIUS = 25
NUM_VERTICES = 12
PERIOD = 1300 // in ms
FRAME_COUNT = 0

const unit_circle    = get_circle_points(NUM_VERTICES);
const scaled_circle  = unit_circle.map(
    p => p.map(coord => RADIUS * coord)
)

function get_circle_points(numvertices) {
    let points = Array();
    for (let i = 0; i < numvertices; i++) {
        const angle = TAU * i / NUM_VERTICES;
        points[i] = [Math.cos(angle), Math.sin(angle), 0];
    }
    return points;
}


function render_loop() {
    render_frame();
    requestAnimationFrame(render_loop);
}

const start_time = Date.now()
function render_frame() {
    const elapsed_time = (Date.now() - start_time);
    show_fps(elapsed_time);

    const PHASE = (TAU * elapsed_time) / PERIOD;
    const yaw_circle = rotate_about_x(scaled_circle, (TAU * 3) / 16)
    const rotated_circle = rotate_about_y(yaw_circle, PHASE);
    //const rotated_circle = rotate_about_z(yaw_circle, PHASE);
    const ellipse        = rotated_circle.map(
        ([x, y, z]) => [x, Math.round(y / 3), z]
    )
    let other_ellipse = translate_pointset(ellipse, [0, 5, 0]);
    let other_ellipse2 = translate_pointset(ellipse, [0, -5, 0]);
    other_ellipse2 = rotate_about_x(other_ellipse2, PHASE);
    other_ellipse = rotate_about_x(other_ellipse, -PHASE + TAU / 4);

    const translated_point_sets = translate_pointsets([ellipse, other_ellipse, other_ellipse2], CENTER);

    // Write black pixels, flush buffer, THEN rewrite pixels as 0 alpha, which blanks the screen
    for (const alpha of [255, 0]) {
        for (const pointset of translated_point_sets) {
            render_pointset(pointset, alpha, imageData);
        }

        if (alpha == 255) {
            // Draw image data to the canvas
            ctx.putImageData(imageData, 0, 0);
        }
    }
}

function show_fps(elapsed_time) {
    if (FRAME_COUNT % 100 == 0) {
        const framerate = FRAME_COUNT / (elapsed_time / 1000) ;
        console.log(`cumulative framerate: ${framerate}`);
    }
    FRAME_COUNT++;
}

function render_pointset(pointset, alpha, imageData) {
    for (const p of pointset) {
        const base = point2pixel(p, imageData.width);
        for (let spo = 0; spo < 3; spo++) {
            imageData.data[base + spo] = 0;
        }
        imageData.data[base + 3] = alpha;
    }
}

function point2pixel([x, y, z], width) {
    const rowoffset = x * 4
    const coloffset = y * width * 4
    return rowoffset + coloffset;
}

function translate_pointset(pointset, delta) {
    return pointset.map(point =>
        point.map((coord, i) => coord + delta[i])
    );
}

function translate_pointsets(pointsets, delta) {
    return pointsets.map(ps => translate_pointset(ps, delta));
}

function rotate_about_z(pointset, theta) {
    return pointset.map(
        ([x, y, z]) => [  // Matrix multiplication: bullshit-style
            Math.round(x * cos(theta) - y * sin(theta)),
            Math.round(x * sin(theta) + y * cos(theta)),
            z,
        ]
    );
}

function rotate_about_x(pointset, theta) {
    return pointset.map(
        ([x, y, z]) => [  // Matrix multiplication: bullshit-style
            x,
            Math.round( y * cos(theta) + z * sin(theta)),
            Math.round(-y * sin(theta) + z * cos(theta)),
        ]
    );
}

function rotate_about_y(pointset, theta) {
    return pointset.map(
        ([x, y, z]) => [  // Matrix multiplication: bullshit-style
            Math.round(x * cos(theta) - z * sin(theta)),
            y,
            Math.round(x * sin(theta) + z * cos(theta)),
        ]
    );
}

render_loop();

// function timeout_loop() {
//     setTimeout(timeout_loop, 5);
//     render_frame()
// }
// timeout_loop();


// TAU = Math.PI * 2
// CENTER = [50, 50]
// RADIUS = 25
// NUM_VERTICES = 12
// ANGULAR_PERIOD = 4 // seconds / turn
// let start_timestamp = Date.now()
// let drawn = 0;

// while (drawn = 0) {
//     let timestamp = Date.now()
//     let timestep = (timestamp - start_timestamp) / 1000; // seconds

//     START_ANGLE = timestep / (TAU * ANGULAR_PERIOD);
//     for (let i = 0; i < NUM_VERTICES; i++) {
//         const angle = START_ANGLE + TAU * (i) / NUM_VERTICES;
//         const x = Math.round(CENTER[0] + RADIUS * Math.cos(angle));
//         const y = Math.round(CENTER[1] + RADIUS * Math.sin(angle));
//         //const c = y * (imageData.width * 4) + x * 4 + 2
//         const rowoffset = x * 4;
//         const coloffset = y * imageData.width * 4;
//         const c = rowoffset + coloffset;
//         for (let spo = 0; spo < 3; spo++) { // subpixel offset
//             imageData.data[c + spo] = 0;
//         }
//         imageData.data[c + 3] = 255; // A value
//     }
//     // Draw image data to the canvas
//     ctx.putImageData(imageData, 0, 0);
//     drawn = 1;
// }