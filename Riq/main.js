util = require('TechUtility'); // used for object introspection, see TechUtility package for the functions
RoomManager = require('RoomManager');
BinaryHeap = require('BinaryHeap');
QueueManager = require('QueueManager');

require("Globals");

console.log(globalVar);
globalFunc();

// Add getter setter memory method for sources
// Found from interwebs
if(!Source.prototype.memory)
  Object.defineProperty(Source.prototype, 'memory', {
      get: function() {
          if(_.isUndefined(Memory.sources)) {
              Memory.sources = {};
          }
          if(!_.isObject(Memory.sources)) {
              return undefined;
          }
          return Memory.sources[this.id] = Memory.sources[this.id] || {};
      },
      set: function(value) {
          if(_.isUndefined(Memory.sources)) {
              Memory.sources = {};
          }
          if(!_.isObject(Memory.sources)) {
              throw new Error('Could not set source memory');
          }
          Memory.sources[this.id] = value;
      }
  });

// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
profiler = require('screeps-profiler');

if(!Memory.heaps)
  Memory.heaps = {};

buildingPriorityQueue = undefined;
if(!Memory.heaps.buildingPriorityQueue)
  buildingPriorityQueue = new BinaryHeap.MaxPriorityHeap();
else
  buildingPriorityQueue = BinaryHeap.MaxPriorityHeap.deserialize(
    Memory.heaps.buildingPriorityQueue
  );

console.log(buildingPriorityQueue.getValueAtTop());


// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function() {
    profiler.wrap(function() {
    // Main.js logic should go here.

    // Update creep existence
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            creep = Memory.creeps[i];
            console.log(creep.room)
            //util.listProperties(creep);
            if(creep.role === "harvester"){
              source = Game.getObjectById(creep.sourceID);
              source.memory.harvesterAmount--;
            }
            delete Memory.creeps[i];
        }
    }

    for (var key in Game.rooms)
    {
        RoomManager.update(Game.rooms[key]);
    }

    Memory.heaps.buildingPriorityQueue = buildingPriorityQueue.serialize();

    console.log(Game.cpu.getUsed());
  });
}

/*
  //BinaryHeap debug and testing

  var total =  Game.cpu.getUsed();
  var start = total;
  var priorityHeap = new BinaryHeap.MaxPriorityHeap();
  console.log("Building class took: ", (Game.cpu.getUsed() - start))

  var start = Game.cpu.getUsed();
  generatedData = [];
  for(var x = 0; x < 100; x++)
  {
    var rand = Math.random() * 100;
    generatedData.push({
      some: "data",
      filler: "shit",
      priority: rand
    });
  }
  console.log("Generating data took: ", (Game.cpu.getUsed() - start))

  var start = Game.cpu.getUsed();
  for(var key in generatedData)
    priorityHeap.push(generatedData[key]);
  console.log("adding and sorting data took: ", (Game.cpu.getUsed() - start))

  var start = Game.cpu.getUsed();
  var serialized = priorityHeap.serialize();
  console.log("serialization took: ", (Game.cpu.getUsed() - start))

  var start = Game.cpu.getUsed();
  var newHeap = BinaryHeap.MaxPriorityHeap.deserialize(serialized);
  console.log("deserialization took: ", (Game.cpu.getUsed() - start))
  console.log("Top value: ", newHeap.pop().priority, "Total time spent: ", (Game.cpu.getUsed() - total))
*/
