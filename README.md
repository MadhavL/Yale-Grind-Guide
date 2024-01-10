## Project Description

This is an interactive map to explore study spots on Yale's campus. Users can interact with it using their right hand. As users move their hand, a cursor shows up on screen indicating the location they are pointing at. Users can navigate the map by panning up, down, right, and left when their cursor reaches the North, South, East and West edges of the map. They can also zoom in and out of the map by hovering over the zoom buttons on the screen. When the user's cursor hovers over the location pins of study spots for a few seconds, a popup showing detailed information about that study space (including facilities, directions, etc.) will appear.

## Demo Video

https://github.com/MadhavL/Yale-Grind-Guide/assets/19777241/bd9fe000-db17-4313-9202-2de328d3b301

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


## Deployment Environment Constraints

1. Users should ideally use our system when no one else is detected in the TV for the cursor to be stable, since we're only using the first person's right hand for the cursor.
