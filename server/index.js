// main server file where server setup is done using Express and with request handler functions

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const db = require('../database/index.js');
const helpers = require('./server-helpers.js');
require('dotenv').config();
require('../TestFunctions');
const {endersForFirstTwoRhymes, firstTwoRhymesWordsLists, rhymesForMeasure, titleNames, waterBodies, titleEndings} = require('../data/pirate-words.js');

// const helper = require('../helpers/apiHelpers');

const app = express();

// Probably not needed //
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(__dirname + '../client/'));
// Needed for React at Some Point // 
// app.use(express.static(path.join(__dirname, [REACT DIRECTORY])));

// TEST ENDPOINTS ==========================

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/health', (req, res) => {
  res.status(200).send('UP!');
});

// API SERVER ==============================

app.post('/api/user/riddle', (req, res) => {
  db.selectTreasureById(req.body.id_treasure, (err, treasure) => {
    if (err) {
      console.log(err);
    } else {
      let directions;

      axios({
        method: 'GET',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${treasure.location_data.latitude},${treasure.location_data.longitude}&rankby=distance&key=${process.env.G_PLACES_API}`,
      })
        .then(({ data }) => {
          const randomOne = Math.floor(Math.random() * 10);
          let randomTwo = Math.floor(Math.random() * 10);
          while (randomTwo === randomOne) {
            randomTwo = Math.floor(Math.random() * 10);
          }
          let randomThree = Math.floor(Math.random() * 10);
          while (randomThree === randomOne || randomThree === randomTwo) {
            randomThree = Math.floor(Math.random() * 10);
          }
          
          const riddleLocationThree = [data.results[randomOne].geometry.location.lng, data.results[randomOne].geometry.location.lat];
          const riddleLocationTwo = [data.results[randomTwo].geometry.location.lng, data.results[randomTwo].geometry.location.lat];
          const riddleLocationOne = [data.results[randomThree].geometry.location.lng, data.results[randomThree].geometry.location.lat];
          const landmarkOne = data.results[randomThree];
          const landmarkTwo = data.results[randomTwo];
          const landmarkThree = data.results[randomOne];

          const oneToTwo = helpers.getDirectionAndDistance(riddleLocationOne, riddleLocationTwo);
          const twoToThree = helpers.getDirectionAndDistance(riddleLocationTwo, riddleLocationThree);
          const threeToTreasure = helpers.getDirectionAndDistance(riddleLocationThree, [treasure.location_data.longitude, treasure.location_data.latitude]);

          // TODO: Make first line of directions include a street name
          axios({
            method: 'GET',
            url: `https://api.opencagedata.com/geocode/v1/json?q=${riddleLocationThree[1]}+${riddleLocationThree[0]}&key=${process.env.OPENCAGE_API}`
          })
            .then(({ data }) => {
              if (data.results[0].components.road === undefined) {
                directions = `Where no boat goes\n`;
              } else {
                directions = `Along the ${data.results[0].components.road}\n`;
                directions = directions.replace(/(street)|(avenue)|(lane)|(boulevard)|(road)|(roadway)|(route)|(roadway)|(drive)/gi, helpers.getRandomFromArray(waterBodies));
              }

              const firstEnding = helpers.getRandomFromArray(endersForFirstTwoRhymes);
              let directionsOne = `${Math.ceil(oneToTwo.paces)} paces ${oneToTwo.heading} of ${landmarkOne.name} ${firstEnding}\n`;
              directionsOne += `the ${landmarkTwo.name} ${helpers.getRandomFromArray(firstTwoRhymesWordsLists[firstEnding])}\n`;
              directions += directionsOne;

              const secondEnding = helpers.getRandomFromArray(endersForFirstTwoRhymes);
              let directionsTwo = `${Math.ceil(twoToThree.paces)} paces ${twoToThree.heading} of here ${secondEnding}\n`;
              directionsTwo += `the ${landmarkThree.name} ${helpers.getRandomFromArray(firstTwoRhymesWordsLists[secondEnding])}\n`;
              directions += directionsTwo;

              let directionsThree = `${Math.ceil(threeToTreasure.paces)} paces ${threeToTreasure.heading} must you measure\n`;
              directionsThree += `in order to find ${helpers.getRandomFromArray(rhymesForMeasure)}.`;
              directions += directionsThree;
              // directions = `From ${landmarkOne.name} walk ${Math.round(oneToTwo.paces)} paces ${oneToTwo.heading}.\n`;
              // directions += `From ${landmarkTwo.name} walk ${Math.round(twoToThree.paces)} paces ${twoToThree.heading}.\n`;
              // directions += `From ${landmarkThree.name} walk ${Math.round(threeToTreasure.paces)} paces ${threeToTreasure.heading}.`;

              const riddleTitleName = helpers.getRandomFromArray(titleNames[helpers.getRandomFromArray(['captains', 'crews'])]);
              const riddleTitleEnding = helpers.getRandomFromArray(titleEndings);
              const title = `${riddleTitleName} ${riddleTitleEnding}`;

              db.insertRiddle(title, req.body.latitude, req.body.longitude, req.body.address, req.body.city, req.body.state, req.body.zipcode, directions, treasure.id, req.body.id_user, (err, riddle) => {
                if (err) {
                  console.log(err);
                  res.status(500).send('RIDDLE COULD NOT BE INSERTED');
                } else {
                  res.status(200).send(directions);
                }
              });
            })

          // return axios({
          //   method: 'GET',
          //   url: `https://api.tomtom.com/routing/1/calculateRoute/${riddleLocationOne.lat},${riddleLocationOne.lng}:${riddleLocationTwo.lat},${riddleLocationTwo.lng}/json?maxAlternatives=0&instructionsType=text&avoid=unpavedRoads&sectionType=pedestrian&travelMode=pedestrian&key=${process.env.TOMTOM_API}`
          // })
          //   .then(({ data }) => {
          //     directions = data.routes[0].guidance.instructions.map((instruction) => {
          //       return instruction.message;
          //     }).join('\n');
          //     return axios({
          //       method: 'GET',
          //       url: `https://api.tomtom.com/routing/1/calculateRoute/${riddleLocationTwo.lat},${riddleLocationTwo.lng}:${riddleLocationThree.lat},${riddleLocationThree.lng}/json?maxAlternatives=0&instructionsType=text&avoid=unpavedRoads&sectionType=pedestrian&travelMode=pedestrian&key=${process.env.TOMTOM_API}`
          //     });
          //   })
          //   .then(({ data }) => {
          //     directions += '\n' + data.routes[0].guidance.instructions.map((instruction) => {
          //       return instruction.message;
          //     }).join('\n');
          //     return axios({
          //       method: 'GET',
          //       url: `https://api.tomtom.com/routing/1/calculateRoute/${riddleLocationThree.lat},${riddleLocationThree.lng}:${treasure.location_data.latitude},${treasure.location_data.longitude}/json?maxAlternatives=0&instructionsType=text&avoid=unpavedRoads&sectionType=pedestrian&travelMode=pedestrian&key=${process.env.TOMTOM_API}`
          //     });
          //   })
          //   .then(({ data }) => {
          //     directions += '\n' + data.routes[0].guidance.instructions.map((instruction) => {
          //       return instruction.message;
          //     }).join('\n');
          //     console.log(directions);
          //     res.status(200).send(data.routes[0]);
          //     // need to fix riddle title situation
              
          //     // db.insertRiddle('hey', 0, 0, null, null, null, 0, directions, treasure.id, 1, (err, riddle) => {
          //     //   if (err) {
          //     //     console.log(err);
          //     //     res.status(500).send('RIDDLE COULD NOT BE INSERTED');
          //     //   } else {
          //     //     res.status(200).send('TREASURE AND RIDDLE SUCCESSFULLY GENERATED AND STORED');
          //     //   }
          //     // });
          //   })
          //   .catch((err) => {
          //     console.log(err, 'RIDDLE NOT CREATED');
          //     res.status(500).send('RIDDLE NOT CREATED');
          //   });
        });
    }
  });
});

app.post('/api/server/treasure', (req, res) => {
  let directions;
  const randomNolaLat = (Math.random() * (30.020441 - 29.920557)) + 29.920557;
  const randomNolaLong = (Math.random() * (-90.042287 - -90.120793)) + -90.120793;
  axios({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${randomNolaLat},${randomNolaLong}&rankby=distance&key=${process.env.G_PLACES_API}`,
  })
    .then(({ data }) => {
      const lat = data.results[0].geometry.location.lat;
      const long = data.results[0].geometry.location.lng;
      return axios({
        method: 'GET',
        url: `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=${process.env.OPENCAGE_API}`
      })
      .then(({ data }) => {
        const gold = Math.ceil(Math.random() * 1000) + 500;
        const location = data.results[0].components;
        db.insertTreasure(gold, long, lat, `${location.house_number} ${location.road}`, location.city, location.state, location.postcode, 1, (err, treasure) => {
          if (err) {
            console.log(err);
            res.status(500).send('COULD NOT INSERT TREASURE');
          } else {
            axios({
              method: 'GET',
              url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${treasure.location_data.latitude},${treasure.location_data.longitude}&rankby=distance&key=${process.env.G_PLACES_API}`,
            })
              .then(({ data }) => {
                const randomOne = Math.floor(Math.random() * 10);
                let randomTwo = Math.floor(Math.random() * 10);
                while (randomTwo === randomOne) {
                  randomTwo = Math.floor(Math.random() * 10);
                }
                let randomThree = Math.floor(Math.random() * 10);
                while (randomThree === randomOne || randomThree === randomTwo) {
                  randomThree = Math.floor(Math.random() * 10);
                }
                
                const riddleLocationThree = [data.results[randomOne].geometry.location.lng, data.results[randomOne].geometry.location.lat];
                const riddleLocationTwo = [data.results[randomTwo].geometry.location.lng, data.results[randomTwo].geometry.location.lat];
                const riddleLocationOne = [data.results[randomThree].geometry.location.lng, data.results[randomThree].geometry.location.lat];
                const landmarkOne = data.results[randomThree];
                const landmarkTwo = data.results[randomTwo];
                const landmarkThree = data.results[randomOne];

                const oneToTwo = helpers.getDirectionAndDistance(riddleLocationOne, riddleLocationTwo);
                const twoToThree = helpers.getDirectionAndDistance(riddleLocationTwo, riddleLocationThree);
                const threeToTreasure = helpers.getDirectionAndDistance(riddleLocationThree, [treasure.location_data.longitude, treasure.location_data.latitude]);

                // TODO: Make first line of directions include a street name
                axios({
                  method: 'GET',
                  url: `https://api.opencagedata.com/geocode/v1/json?q=${riddleLocationThree[1]}+${riddleLocationThree[0]}&key=${process.env.OPENCAGE_API}`
                })
                  .then(({ data }) => {
                    if (data.results[0].components.road === undefined) {
                      directions = `Where no boat goes\n`;
                    } else {
                      directions = `Along the ${data.results[0].components.road}\n`;
                      directions = directions.replace(/(street)|(avenue)|(lane)|(boulevard)|(road)|(roadway)|(route)|(roadway)|(drive)/gi, helpers.getRandomFromArray(waterBodies));
                    }

                    const firstEnding = helpers.getRandomFromArray(endersForFirstTwoRhymes);
                    let directionsOne = `${Math.ceil(oneToTwo.paces)} paces ${oneToTwo.heading} of ${landmarkOne.name} ${firstEnding}\n`;
                    directionsOne += `the ${landmarkTwo.name} ${helpers.getRandomFromArray(firstTwoRhymesWordsLists[firstEnding])}\n`;
                    directions += directionsOne;
    
                    const secondEnding = helpers.getRandomFromArray(endersForFirstTwoRhymes);
                    let directionsTwo = `${Math.ceil(twoToThree.paces)} paces ${twoToThree.heading} of here ${secondEnding}\n`;
                    directionsTwo += `the ${landmarkThree.name} ${helpers.getRandomFromArray(firstTwoRhymesWordsLists[secondEnding])}\n`;
                    directions += directionsTwo;
    
                    let directionsThree = `${Math.ceil(threeToTreasure.paces)} paces ${threeToTreasure.heading} must you measure\n`;
                    directionsThree += `in order to find ${helpers.getRandomFromArray(rhymesForMeasure)}.`;
                    directions += directionsThree;
                    // directions = `From ${landmarkOne.name} walk ${Math.round(oneToTwo.paces)} paces ${oneToTwo.heading}.\n`;
                    // directions += `From ${landmarkTwo.name} walk ${Math.round(twoToThree.paces)} paces ${twoToThree.heading}.\n`;
                    // directions += `From ${landmarkThree.name} walk ${Math.round(threeToTreasure.paces)} paces ${threeToTreasure.heading}.`;
                    
                    const riddleTitleName = helpers.getRandomFromArray(titleNames[helpers.getRandomFromArray(['captains', 'crews'])]);
                    const riddleTitleEnding = helpers.getRandomFromArray(titleEndings);
                    const title = `${riddleTitleName} ${riddleTitleEnding}`;

                    db.insertRiddle(title, 0, 0, null, null, null, 0, directions, treasure.id, 1, (err, riddle) => {
                      if (err) {
                        console.log(err);
                        res.status(500).send('RIDDLE COULD NOT BE INSERTED');
                      } else {
                        res.status(200).send(directions);
                      }
                    });
                  })

                // return axios({
                //   method: 'GET',
                //   url: `https://api.tomtom.com/routing/1/calculateRoute/${riddleLocationOne.lat},${riddleLocationOne.lng}:${riddleLocationTwo.lat},${riddleLocationTwo.lng}/json?maxAlternatives=0&instructionsType=text&avoid=unpavedRoads&sectionType=pedestrian&travelMode=pedestrian&key=${process.env.TOMTOM_API}`
                // })
                //   .then(({ data }) => {
                //     directions = data.routes[0].guidance.instructions.map((instruction) => {
                //       return instruction.message;
                //     }).join('\n');
                //     return axios({
                //       method: 'GET',
                //       url: `https://api.tomtom.com/routing/1/calculateRoute/${riddleLocationTwo.lat},${riddleLocationTwo.lng}:${riddleLocationThree.lat},${riddleLocationThree.lng}/json?maxAlternatives=0&instructionsType=text&avoid=unpavedRoads&sectionType=pedestrian&travelMode=pedestrian&key=${process.env.TOMTOM_API}`
                //     });
                //   })
                //   .then(({ data }) => {
                //     directions += '\n' + data.routes[0].guidance.instructions.map((instruction) => {
                //       return instruction.message;
                //     }).join('\n');
                //     return axios({
                //       method: 'GET',
                //       url: `https://api.tomtom.com/routing/1/calculateRoute/${riddleLocationThree.lat},${riddleLocationThree.lng}:${treasure.location_data.latitude},${treasure.location_data.longitude}/json?maxAlternatives=0&instructionsType=text&avoid=unpavedRoads&sectionType=pedestrian&travelMode=pedestrian&key=${process.env.TOMTOM_API}`
                //     });
                //   })
                //   .then(({ data }) => {
                //     directions += '\n' + data.routes[0].guidance.instructions.map((instruction) => {
                //       return instruction.message;
                //     }).join('\n');
                //     console.log(directions);
                //     res.status(200).send(data.routes[0]);
                //     // need to fix riddle title situation
                    
                //     // db.insertRiddle('hey', 0, 0, null, null, null, 0, directions, treasure.id, 1, (err, riddle) => {
                //     //   if (err) {
                //     //     console.log(err);
                //     //     res.status(500).send('RIDDLE COULD NOT BE INSERTED');
                //     //   } else {
                //     //     res.status(200).send('TREASURE AND RIDDLE SUCCESSFULLY GENERATED AND STORED');
                //     //   }
                //     // });
                //   })
                //   .catch((err) => {
                //     console.log(err, 'RIDDLE NOT CREATED');
                //     res.status(500).send('RIDDLE NOT CREATED');
                //   });
              });
          }
        });
      });
    })
    .catch((err) => {
      console.log(err, 'DID NOT RETRIEVE LOCATIONS');
      res.status(500).send('NO LOCATIONS');
    })
});


// Able to set port and still work //
const port = process.env.PORT || 3001;

// Listen and console log current port //
app.listen(port, () => {
  console.log(`listening on port ${port}!`);
});


module.exports = app;
