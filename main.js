import Map from 'ol/Map.js';
import OSM, {ATTRIBUTION} from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Overlay from 'ol/Overlay.js';
import {toLonLat} from 'ol/proj.js';
import {toStringHDMS} from 'ol/coordinate.js';
import * as olPixel from 'ol/pixel';

//var host = "127.0.0.1:5173";
var host = "cpsc484-01.yale.internal:8888";
$(document).ready(function() {
  frames.start();
});

var frames = {
  socket: null,

  start: function() {
    var url = "ws://" + host + "/frames";
    frames.socket = new WebSocket(url);
    frames.socket.onmessage = function (event) {
      frames.show(JSON.parse(event.data));
    }
  },

  show: function (frame) {
    console.log(frame);
    setup_cursor(frame);
  }
};

var ctx = canvas.getContext("2d");
var img=  document.createElement('img');
var update = false; //to keep track of rendering buffer
var cursor_x; //this is the global variable that contains the location of the user's hand (x coord)
var cursor_y; //keep track of y coord for user hand (cursor)

function setup_cursor(frame) {
  var map = document.getElementById("map");
  var canvas = document.getElementById("canvas");
  //occupy entire screen
  canvas.width = map.clientWidth;
  canvas.height = map.clientHeight;

  // ...then set the internal size to match
  canvas.width  = map.offsetWidth;
  canvas.height = map.offsetHeight;

  // Normalize by subtracting the root (pelvis) joint coordinates
  if (frame.people[0] != null) {
    var pelvis_x = frame.people[0].joints[0].position.x;
    var pelvis_y = frame.people[0].joints[0].position.y;
    // var pelvis_z = frame.people[0].joints[0].position.z;
    cursor_x = 2* (frame.people[0].joints[14].position.x - pelvis_x) * -1;
    var right_hand_y = (frame.people[0].joints[14].position.y - pelvis_y) * -1;
    cursor_y = canvas.height - right_hand_y - 200;
    // var right_hand_z = (frame.people[0].joints[15].position.z - pelvis_z) * -1;

    //Debugging
    var valid = frame.people[0].joints[14].valid; //whether this exists
    var confidence = frame.people[0].joints[14].confidence; //confidence level, should be >= 2 for accuracy
  }
  
  img.onload = function(){
    if (frame.people[0] != null) {
        if (cursor_x > 0 && cursor_x < 1100 && cursor_y > 0 && cursor_y < 1100 && confidence >= 1) {
            console.log('Right hand, confidence: %d, valid: %s', confidence, valid);
            console.log("X: ", cursor_x);
            console.log("Y: ", cursor_y);
            update = true; //set render flag to true
            //X - 50 (left) to 480 (right)
            //Y - 500 (bottom) to 0 (top)
        }
    }
    
  }

  img.src='images/cursor.svg';
}

//Function to check whether the map has a feature at the current cursor location
function select_location() {
    var rawPixel = [cursor_x, cursor_y];
    if (map.hasFeatureAtPixel(rawPixel) === true) {
        console.log("FIRED");
        //The below code will pull up the popup for a location pin as soon as the "cursor" (the right hand from kinect) overlaps with a location pin on a map
        //TO DO: add a "timed" functionality, that waits for x seconds to confirm the cursor is staying at that location before the popup is pulled up
        setTimeout(() => {
            console.log("Showing Popup!");
            map.dispatchEvent({   
                type: 'singleclick',
                coordinate: map.getCoordinateFromPixel(rawPixel),
                pixel: rawPixel,
            });
        }, 3000);

    } else {
        //To Do: if map does NOT have feature at location, set the timer flag to false (so that we don't continue counting for the popup)
        //and close any existing popups (if open), using the method I created in closer.onclick
        setTimeout(() => {
            closer.click();
        }, 2000);
    }
}

function zoom_in_out() {
    if (cursor_x > 0 && cursor_x <= 60 && cursor_y > 0 && cursor_y < 75) {
        setTimeout(() => {
            console.log("Zooming in!");
            document.getElementsByTagName('button')[0].click();
          }, 3000);
    }
    if (cursor_x > 0 && cursor_x <= 60 && cursor_y >= 75 && cursor_y <= 150) {
        setTimeout(() => {
            console.log("Zooming out!");
            document.getElementsByTagName('button')[1].click();
          }, 3000);
    }
}

function panning() {
    var view = map.getView();
    var center = view.getCenter();
    var center_px = map.getPixelFromCoordinate(center);

    if (cursor_x > 60 && cursor_y <= 75 && cursor_y > 0) {
        // UP
        // boundary also need to take into account position of zoom in/out
        setTimeout(() => {
            console.log("Panning up!");
            var newCenter_px = [center_px[0], center_px[1]-50];
            var newCenter = map.getCoordinateFromPixel(newCenter_px);
            view.setCenter(newCenter);
          }, 5000);
    }
    if (cursor_x > 0 && cursor_y < 950 && cursor_y >= 850) {
        // DOWN
        setTimeout(() => {
            console.log("Panning down!");
            var newCenter_px = [center_px[0], center_px[1]+50];
            var newCenter = map.getCoordinateFromPixel(newCenter_px);
            view.setCenter(newCenter);
          }, 5000);
    }
    if (cursor_x >= 0 && cursor_x <= 60 && cursor_y > 150) {
        // LEFT
        // boundary also need to take into account position of zoom in/out
        setTimeout(() => {
            console.log("Panning left!");
            var newCenter_px = [center_px[0]-50, center_px[1]];
            var newCenter = map.getCoordinateFromPixel(newCenter_px);
            view.setCenter(newCenter);
          }, 5000);
    }
    if (cursor_x < 1100 && cursor_x >= 1000 && cursor_y > 0) {
        // RIGHT
        setTimeout(() => {
            console.log("Panning right!");
            var newCenter_px = [center_px[0]+50, center_px[1]];
            var newCenter = map.getCoordinateFromPixel(newCenter_px);
            view.setCenter(newCenter);
          }, 5000);
    }
}

//To eliminate flickering in page, only update animation frame when it is being rendered
function renderFunction(){
    if(update){  // only raw if needed
       update = false;
       console.log("here: ",  cursor_x, cursor_y)
       ctx.drawImage(img, cursor_x, cursor_y, 30, 30);
       zoom_in_out();
       panning();
       select_location();
    }
    requestAnimationFrame(renderFunction);
}

requestAnimationFrame(renderFunction);

//Madhav: added code for getting pop up elements
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

//Madhav: added Database info for yale study spaces
const studySpaceTitle = ['Bass Library', 'Bass - Group Study Rooms', 'Bass - Individual Study Rooms', 'Sterling - Starr Reading Room', 'Sterling - Music Library', 
'Sterling - Digital Humanities Lab', 'Robert B. Haas Library', 'Haas - Group Study Rooms', 'Law Library', 'Marx Library',
'Marx - Group Study Rooms', 'The Steep', 'Evans Hall', 'The Underground', 'The Good Life Center'];

const studySpaceInfo = ['The newly renovated Anne T. and Robert M. Bass Library is the starting point for undergraduate research support and library instruction as well as a popular student workspace. Through its staff, services, and a print collection of 61,000 volumes, Bass Library supports the Yale College curriculum across all subject areas. Bass Library staff work with faculty and other Yale Library staff to introduce students to the full range of Yale University Library collections, resources, and services. Originally called Cross-Campus Library, Bass Library is adjacent and connected to Sterling Memorial Library via the Wright Reading Room below Sterling Library’s Gothic Nave.',
'Group study rooms in Bass Library can be used for classes, workshops, meetings, and other group work. These rooms have a variety of seating configurations, from long tables to soft seating. All group study rooms have wireless internet access and power outlets. They must be reserved online.',
'Individual study rooms in Bass Library have one ADA compliant desk and seat, along with wireless internet access and power outlets. They can be reserved online.',
'Starr Reading Room, the main reading room of Sterling library, is at the south end of the library, next to Trumbull College. It is a reference room designed in the style of a monastic refectory. Under a barrel-vaulted ceiling, the room is lined with traceried windows and oak bookshelves decorated with a botanical frieze. A 1998 restoration was funded by The Starr Foundation. Access to internet and power outlets are available.', 
'The Irving S. Gilmore Music Library Reading Room is located within Sterling Memorial Library. The music library is a public space within Sterling that houses common desks with power outlets, and comfortable seating.',
'The Franke Family Digital Humanities Laboratory (DHLab) within Sterling library is an open, communal workspace. While the desks do not have power outlets themselves, wall outlets may be found around the room.',
'Bridging Paul Rudolph Hall and the Jeffrey Loria Center for the History of Art, the Robert B. Haas Family Arts Library houses the former Art & Architecture, Arts of the Book, and Drama library collections, as well as staff and services for the Visual Resources Collection. On-site, the library contains approximately 125,000 volumes, plus related rare and unique materials. Off-site, over 300,000 arts books and periodicals are stored in the Library Shelving Facility for delivery to any Yale Library. Haas Library features a variety of seating options for quiet study, including large tables, armchairs, and couches. There are power outlets on the desks.',
'Rooms 108 (main level) and B36 (lower level) in the Haas Library are available to reserve online. These rooms can be used for workshops, meetings, and other group work. There is wireless internet access and power outlets.',
'The Lillian Goldman Law Library is located within the heart of the Yale Law School complex, providing the Law School community with ready access to one of the world\'s finest collections of printed legal materials. A major goal of the Law School\'s library is to support the needs of twenty-first-century legal researchers by integrating access to print and online sources throughout the library. The library has space in the main reading rooms for studying.',
'Marx Science and Social Science Library provides Yale faculty, students, and staff with state-of-the-art information services in a technology-rich environment. It is designed to provide easily accessible support for science, social science and interdisciplinary researchers. Marx Science and Social Science Library is located on the concourse (lower) level of Kline Tower. You may access Marx Library through the southeast entrance of the Yale Science Building OR through the YSB Pavilion.',
'Some rooms in Marx may be reserved by small groups for studying or meetings. View availability online. Some rooms have whiteboards, others have monitors, and some have a large wireless display. Located on the lower level of Marx Library.',
'Steep embraces the culture of community, bringing together people, food and conversation in a calm, comfortable space. When you’re on the move, come grab what you need, but if you can stay a while – Steep is worth the climb. Located in a new, light-filled space that’s warm and welcoming, Steep offers freshly roasted beans and single-origin coffee, organic teas, kombucha on tap, blended smoothies, cold-pressed juices, open-faced sandwiches made to order on thin rye, locally baked pastries, snacks of dried fruits or vegetables, dark chocolate, and yogurt. Steep also features 24-hour self-checkout technology via grab-and-go coolers and a Stumptown Coffee bean-to-cup machine. Steep is located at the Yale Science Building on Science Hill at 260 Whitney Avenue, and accepts credit cards and Eli Bucks (cashless).',
'The 225,000-square-foot Edward P. Evans Hall, the home of the Yale School of Management, opened in January 2014. The building is situated at the northern end of the Yale University campus at 165 Whitney Avenue. With its striking modern design, glass façade, and large courtyard, Evans Hall has taken its place among the architectural landmarks that distinguish the Yale campus.',
'Located on the lower level of the Yale Schwarzman Center, The Underground is a signature space for casual dining and entertainment – a contemporary, open design that makes for easy gathering and happy collision with friends and new faces. On the menu: delicious fare with a flair and a stage showcasing stand-up, spoken word, sports broadcasts, and other performances and programs.',
'Founded in 2018 by Professor and Head of Silliman College Laurie Santos, The Good Life Center offers free wellness-focused programming for undergraduate, graduate, and professional students. Through evidence-backed programming on mindfulness, gratitude, social connection, exercise, sleep, acts of kindness, time in nature, play, and time affluence, The Good Life Center encourages students to slow down and figure out just what wellness means for them, personally.'
]
//Madhav: added Overlay element for the popups
const overlay = new Overlay({
     element: container,
     autoPan: true,
     autoPanAnimation: {
         duration: 250
     }
 });

 //Madhav: function for closing the popups
 closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

const openCycleMapLayer = new TileLayer({
  source: new OSM({
    attributions: [
      'All maps © <a href="https://www.opencyclemap.org/">OpenCycleMap</a>',
      ATTRIBUTION,
    ],
    url:
      'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' +
      '?apikey=e1d04b4a56d34cff9b730e768870bcc6',
  }),
});

const openSeaMapLayer = new TileLayer({
  source: new OSM({
    attributions: [
      'All maps © <a href="https://www.openseamap.org/">OpenSeaMap</a>',
      ATTRIBUTION,
    ],
    opaque: false,
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
  }),
});

//Madhav: added functionality for popups and markers
const Bass = new Feature({
    geometry: new Point(fromLonLat([-72.927302, 41.3107916])),
});
Bass.setId(0);

const BassGroup = new Feature({
    geometry: new Point(fromLonLat([-72.927521, 41.310216])),
});
BassGroup.setId(1);

const BassIndividual = new Feature({
    geometry: new Point(fromLonLat([-72.928087, 41.310522])),
});
BassIndividual.setId(2);

const SterlingStarr = new Feature({
    geometry: new Point(fromLonLat([-72.9286514175899, 41.31109237909119])),
});
SterlingStarr.setId(3);

const SterlingMusic = new Feature({
    geometry: new Point(fromLonLat([-72.92924962949023, 41.31153907002043])),
});
SterlingMusic.setId(4);

const SterlingLab = new Feature({
    geometry: new Point(fromLonLat([-72.9295900693673, 41.31087845163865])),
});
SterlingLab.setId(5);

const HaasMain = new Feature({
    geometry: new Point(fromLonLat([-72.93167378336699, 41.30870410067195])),
});
HaasMain.setId(6);

const HaasGroup = new Feature({
    geometry: new Point(fromLonLat([-72.93219112663509, 41.308767732621284])),
});
HaasGroup.setId(7);

const LawLibrary = new Feature({
    geometry: new Point(fromLonLat([-72.92792089321028, 41.31200486925708])),
});
LawLibrary.setId(8);

const MarxLibrary = new Feature({
    geometry: new Point(fromLonLat([-72.9224396038956, 41.317494745394505])),
});
MarxLibrary.setId(9);

const MarxGroup = new Feature({
    geometry: new Point(fromLonLat([-72.92179657616171, 41.31738642665719])),
});
MarxGroup.setId(10);

const Steep = new Feature({
    geometry: new Point(fromLonLat([-72.92254908435662, 41.31706760543722])),
});
Steep.setId(11);

const EvansHall = new Feature({
    geometry: new Point(fromLonLat([-72.92055186316632, 41.3152438500028])),
});
EvansHall.setId(12);

const Underground = new Feature({
    geometry: new Point(fromLonLat([-72.92612233025436, 41.31119913309569])),
});
Underground.setId(13);

const GoodLife = new Feature({
    geometry: new Point(fromLonLat([-72.92665021526943, 41.311979445631344])),
});
GoodLife.setId(14);

//Madhav: functionality for marking location pins on the map
const marker = new VectorLayer({
    source: new VectorSource({
        features: [
            Bass,
            BassGroup,
            BassIndividual,
            SterlingStarr,
            SterlingMusic,
            SterlingLab,
            HaasMain,
            HaasGroup,
            LawLibrary,
            MarxLibrary,
            MarxGroup,
            Steep,
            EvansHall,
            Underground,
            GoodLife
    ]
    }),
    style: new Style({
        image: new Icon({
            src: '/images/library-pin.png',
            scale: 0.1,
            anchor: [0.5, 1]
        })
    })
});

const map = new Map({
  layers: [openCycleMapLayer, openSeaMapLayer, marker],
  target: 'map',
  view: new View({
    maxZoom: 19,
    minZoom: 14.5,
    center: fromLonLat([-72.92470149022789, 41.31218303265929]), //Madhav: changed to center on old campus
    zoom: 15.8,
  }),
  overlays: [overlay]
});

//Madhav: added functionality to show information in popup if a location is clicked
map.on('singleclick', function (evt) {
    console.log("Pixel: ", evt.pixel);
    if (map.hasFeatureAtPixel(evt.pixel) === true) {
        const feature_id = map.getFeaturesAtPixel(evt.pixel)[0].getId();
        //console.log(feature_id);
        const coordinate = evt.coordinate;
        //const hdms = toStringHDMS(toLonLat(coordinate));
    
        content.innerHTML = '<h3>' + studySpaceTitle[feature_id] +'</h3><p>' + studySpaceInfo[feature_id] + '</p>';
        overlay.setPosition(coordinate);
    }
    else {
        overlay.setPosition(undefined);
        closer.blur();
    }
  });
