
// 500 paces south of <location> you will seek
// a <location2> ${insertFromBelow}
const rhymesForSeek = [
  'of which this riddle do speak',
  'not meant for the meek',
  'to which you must now sneak',
  'and when you arrive, you mustn\'t make a peep',
  'you must peek',
];

// 500 paces south of <location> there will be
// a <location2> ${insertFromBelow}
const rhymesForBe = [
  'there you will see',
  'to follow the next clue from me',
  'at least to some degree',
  'where you can rest and take a knee',
  'perfect to read the next rhyme for free',
];

module.exports.firstTwoRhymesWordsLists = {
  'there will be': rhymesForBe,
  'you will seek': rhymesForSeek,
}

// 500 paces south must you measure
// in order to find ${insertFromBelow}
module.exports.rhymesForMeasure = [
  'a lofty sum of treasure',
  'a pirate\'s hidden pleasure',
  'the gold embedded feathers',
  'riches that last forever',
];

module.exports.endersForFirstTwoRhymes = [
  'there will be',
  'you will seek',
];

module.exports.maleWords = [

];

module.exports.femaleWords = [

];

module.exports.captainNames = [
  'Captain Morgan\'s',
  'Captain Navi\'s',
  'Captain Prince\'s',
  'Captain Creed\'s',
  'Captain Blackbeard\'s',
  'Captain Whitebeard\'s',
  'Captain Hoogstandjes\'',
  'Captain Brownbeard\'s',
  'Captain Tempest\'s',
  'Captain Digby\'s',
  'Captain Jinx\'s',
  'Captain Fraud\'s',
  'Captain Stone\'s',
  'Captain Stanton\'s',
  'Captain Tidus\'',
];

module.exports.crewNames = [
  'The Nice Guy Pirates\'',
  'The Floaters\'',
  'The Sea Wolves\'',
  'The Goon Platoon\'',
  'The Blue Shirt Bandits\'',
  'The Son\'s of the Sea\'s',
  'The Shadow Pillagers\'',
  'The Blackbeard Pirates\'',
  'The Shortsail Pirates\'',
  'The Strong Wind Pirates\'',
  'The Buccaneers\'',
  'The Lucky Four\'s',
  'The Undaunted\'s',
  'The Samwell Pirates\'',
];

module.exports.titleNames = {
  crews: module.exports.crewNames,
  captains: module.exports.captainNames,
};

module.exports.titleEndings = [
  'Hidden Booty',
  'Lost Tresure',
  'Last Stand',
  'Forgotten Ship',
  'Riches',
  'Stashed Jewels',
  'Final Cache',
  'Rest',
  'Stash',
  'Hunt',
  'Grave',
];

module.exports.waterBodies = [
  'Canal',
  'Stream',
  'Creek',
  'River',
];
