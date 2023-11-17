## Instructions

0. First, make sure line 17 and 18 in `main.js` are used correctly. If reading data from TV, make sure host is set to "cpsc484-01.yale.internal:8888". If reading data from local recording, set host to "127.0.0.1:5173".

1. Make sure you have node and npm installed. This project was tested with node v19 and npm v9.5

2. Run `npm install` to get the node dependencies

3. Finally, run `npm start` and check out the page.

To make use of an existing recording, follow the following steps:

1. Run `npm start` on this repo

2. Clone repo from `https://github.com/Yale-CPSC484-HCI/recorder`

3. From that local cloned repo, run `pipenv run python src/main.py --data-path data/sample --mode play --local-port 5173`, where `5173` should match this repo's web socket port number (in instructions, step #0)

4. Developer console networks tab should show status `101` for `frames`. Can also check console log in developer console for output


## Project Description

This is an interactive map to explore study spots on Yale's campus. Users can interact with it using their right hand. As users move their hand, a cursor shows up on screen indicating the location they are pointing at. Users can navigate the map by panning up, down, right, and left when their cursor reaches the North, South, East and West edges of the map. They can also zoom in and out of the map by hovering over the zoom buttons on the screen. When the user's cursor hovers over the location pins of study spots for a few seconds, a popup showing detailed information about that study space (including facilities, directions, etc.) will appear.

The tasks being addressed:

1. The user is able to interact and navigate with the map by zooming in and out, and panning North, South, East and West on the map

2. The user is able to view study spots information in the form of a pop-up, by hovering over the pins on map

Note: Task 1 is the same as in A5, while Task 2 is the same as task (iii) in our A3. We chose not to implement the parking spots/shuttle feature as that wasn't deemed necessary by the people we interviewed, and there are no publicly available APIs for Yale's shuttles.

## Deployment Environment Constraints

1. Users should ideally use our system when no one else is detected in the TV for the cursor to be stable, since we're only using the first person's right hand for the cursor.

## Collaboration Record

- Susie Liu (yl2465): Worked on zooming in/out of map, panning the map and initial cursor set up with canvas. Wrote README and worked on setting up the project on display. Fine-tuned the cursor for display.

- Madhav (mal243): Implemented markers (for the study spot location pins) on OpenLayers API, implemented popups, (UI & functionality to show when a marker on the map is selected, and destroy when a different marker is selected). Debugged and stabilized cursor tracking logic based on Kinect sensor data. Initial marker selection functionality with hand cursor. Collected and wrote all data for study spots and added location in map along with details.

- Samantha (srt44): Worked on outlining the information in the outer UI design. Meet with my team to test the interface/read in data correctly. Wrote the instructions and formatted the information.
