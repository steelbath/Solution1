/** Harvester **/
var util = require('TechUtility');

var creep;

function confirmPath(target)
{
    if(!creep.memory.path)
    {
        creep.memory.targetID = target.id;
        //creep.memory.path = creep.pos.findPathTo(target);
    }
}

function move()
{
  creep.moveTo(Game.getObjectById(creep.memory.targetID));
  /*
    itemsOnNextStep = creep.room.lookAt(
        creep.memory.path[0].x,
        creep.memory.path[0].y
    )
    pathObstructed = false;
    for(var key in itemsOnNextStep)
    {
        obj = itemsOnNextStep[key];
        if(obj.type == 'creep' && obj.creep.name != creep.name)
        {
            creep.say("bad path!");
            pathObstructed = true;
            break;
        }
    }

    if(!pathObstructed)
    {
        err = creep.moveByPath(creep.memory.path);
        console.log(err);
        if(err)
        {
            if(err == ERR_NO_PATH)
            {
                creep.memory.path = creep.pos.findPathTo(creep.memory.target);
                console.log("refound the path!");
            }
            creep.moveByPath(creep.memory.path);
        }
    }
    else
    {
        console.log("remaking path!");
        creep.memory.path = creep.pos.findPathTo(creep.memory.target.pos.x, creep.memory.target.pos.y);
        creep.moveByPath(creep.memory.path);
    }
  */
}

function allocateCreep(creep)
{
    source = Game.getObjectById(creep.memory.sourceID);
    source.memory.harvesterAmount++;
    creep.memory.allocated = true;
}

module.exports = {
  update(_creep)
  {
    creep = _creep;
    if(creep.spawning)
      return

    if(!creep.memory.allocated)
      allocateCreep(creep);

    var sources = creep.room.sources;
    var targets = creep.room.find(FIND_STRUCTURES,
        {
            filter: (structure) =>
            {
                return (
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        }
    );


    if(creep.memory.action === "storing" || creep.carry.energy === creep.carryCapacity)
    {
          // console.log(targets);
          if(targets.length)
          {
              var result = creep.transfer(targets[0], RESOURCE_ENERGY);
              if(result === ERR_NOT_IN_RANGE)
              {
                confirmPath(targets[0]);
              }
              else if(result === ERR_FULL || (result === OK && creep.carry.energy > 0))
              {
                creep.memory.action = "storing";

                var newTarget = null;
                for(var x = 1; x < targets.length && !newTarget; x++)
                  if(targets[x].energy < targets[x].energyCapacity)
                    newTarget = targets[x];

                if(!newTarget)
                  targets = creep.room.find(FIND_STRUCTURES,
                    {
                      filter: (structure) =>
                      {
                          return (
                              structure.structureType == STRUCTURE_EXTENSION ||
                              structure.structureType == STRUCTURE_SPAWN) &&
                              structure.energy < structure.energyCapacity;
                      }
                    }
                  )
                else
                  targets = [newTarget];

                creep.memory.path = false;
              }
              else
              {
                creep.memory.action = "traveling";
                creep.memory.path = false;
              }
          }
    }
    else
    {
        if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE)
        {
          confirmPath(Game.getObjectById(creep.memory.sourceID));
        }
        else
          creep.memory.path = false;
    }

    //if(creep.memory.path)
        move();
  }
};
