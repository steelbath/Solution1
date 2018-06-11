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
    var controller = creep.room.controller;

    if(creep.memory.action === "upgrade" || creep.carry.energy === creep.carryCapacity)
    {
        result = creep.upgradeController(controller);
        if(result == ERR_NOT_IN_RANGE)
        {
            confirmPath(controller);
        }
        else if(result == ERR_NOT_ENOUGH_RESOURCES)
        {
            creep.memory.action = "travel";
        }
        else
        {
            creep.memory.action = "upgrade";
            creep.memory.path = false;
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

    if(creep.memory.path)
        move();
  }
};
