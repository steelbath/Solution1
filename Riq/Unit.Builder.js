/** Upgrader **/
var util = require('TechUtility');
var creep;

function confirmPath(target)
{
    if(!creep.memory.path)
    {
        creep.memory.targetID = target.id;
        creep.memory.path = true;
        //creep.memory.path = creep.pos.findPathTo(target);
    }
}

function move()
{
  creep.moveTo(Game.getObjectById(creep.memory.targetID));
}

module.exports = {
  update(_creep)
  {
    creep = _creep;
    var storageIDs = creep.room.memory.storageIDs;
    var sites = creep.room.unfinishedStructures;

    if(sites.length)
    {
        if(creep.memory.action === "build" || creep.carry.energy == creep.carryCapacity)
        {
            if(!creep.memory.targetID)
            {
                target = creep.pos.findClosestByRange(sites);
                creep.memory.targetID = target.id;
            }
            else
                target = Game.getObjectById(creep.memory.targetID);

            result = creep.build(target);

            switch(result)
            {
                case ERR_NOT_IN_RANGE:
                    confirmPath(target);
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    creep.memory.action = "travel";
                    break;
                case ERR_INVALID_TARGET:
                    creep.memory.targetID = null;
                    break;
                default:
                    creep.memory.action = "build";
                    creep.memory.path = false;
                    break;
            }
        }
        else
        {
            var target = null;
            for(key in storageIDs)
            {
                storage = Game.getObjectById(storageIDs[key]);
                if(storage.store)
                  store = storage.store;
                else
                  store = storage.energy;

                if(store > creep.carryCapacity)
                {
                  target = storage;
                  break;
                }
            }
            if(target)
            {
                if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    confirmPath(target);
                }
                else
                    creep.memory.path = false;
            }
        }
    }

    if(creep.memory.path)
        move();
  }
};
