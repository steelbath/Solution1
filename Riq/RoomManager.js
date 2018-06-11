var SpawnManager = require('SpawnManager');
var Harvester = require('Unit.Harvester');
var Upgrader = require('Unit.Upgrader');
var Builder = require('Unit.Builder');
var util = require('TechUtility');
var units = require('Units');

RoomStatus = {'CONNECT': 1, 'TRADE': 2, 'BUILD': 3, 'FORTIFY': 4, 'DEFEND': 5, 'ATTACK': 6, 'HARVEST': 7}; // describes the most important need of actions in the current room

status = RoomStatus.HARVEST; // default room status
spawner = "None";
UPGRADERS_NEEDED = 5;
BUILDERS_NEEDED = 3;
profiler = require('screeps-profiler');

// createPriorizedConstruction(Game.getObjectById("87d4ada5af2d3c9").room, 25, 18, "extension", 97)
createPriorizedConstruction = function(room, x, y, structure, priority)
{
    if(room.createConstructionSite(x, y, structure) === OK)
    {
        Memory.rooms[room.name].queuedActions.addBuildingToPriorityQueue.push({
            x: x,
            y: y,
            structure: structure,
            priority: priority
        });
        console.log(Memory.rooms[room.name].queuedActions.addBuildingToPriorityQueue)
    }
}

function buildStorageAround(room, pos, dist=3)
{
    var size = dist-2;
    positions.push([pos.x - dist, pos.y + dist]);
    positions.push([pos.x + dist, pos.y + dist]);
    positions.push([pos.x + dist, pos.y - dist]);
    positions.push([pos.x - dist, pos.y - dist]);
    for(var i = 1; i <= size; i++)
    {
        // South West
        positions.push([pos.x - dist + i, pos.y + dist]);
        positions.push([pos.x - dist, pos.y + dist - i]);

        // South East
        positions.push([pos.x + dist - i, pos.y + dist]);
        positions.push([pos.x + dist, pos.y + dist - i]);

        // North East
        positions.push([pos.x + dist - i, pos.y - dist]);
        positions.push([pos.x + dist, pos.y - dist + i]);

        // North West
        positions.push([pos.x - dist + i, pos.y - dist]);
        positions.push([pos.x - dist, pos.y - dist + i]);
    }
    for(key in positions)
    {
        var results = room.lookAt(positions[key][0], positions[key][1])
        var canCreate = true;
        for(resKey in results)
        {
            result = results[resKey];
            if(result.type === "structure" || result.type === "terrain" && result.terrain === "wall")
            {
                canCreate = false;
                break;
            }
        }

        if(canCreate)
            room.createConstructionSite(positions[key][0], positions[key][1], STRUCTURE_EXTENSION);
    }
}

function allocateRoom(room)
{
    room.memory.sourceIDs = _.map(getSources(room), function(source){return source.id;});
    room.memory.storageIDs = _.map(room.spawners, function(spawn){return spawn.id;});
    room.memory.harvestersNeeded = 0;
    for(key in room.memory.sourceIDs)
    {
        source = Game.getObjectById(room.memory.sourceIDs[key]);
        source.memory.maxHarvesters = 0;

        /* Temp hack for development to always recheck harvester amount */
        temp = _.filter(Game.creeps, (creep) => creep.memory.sourceID === source.id);
        source.memory.harvesterAmount = temp.length;

        positions = [];
        positions.push(room.lookAt(source.pos.x -1, source.pos.y +1));
        positions.push(room.lookAt(source.pos.x -1, source.pos.y));
        positions.push(room.lookAt(source.pos.x -1, source.pos.y -1));
        positions.push(room.lookAt(source.pos.x, source.pos.y -1));
        positions.push(room.lookAt(source.pos.x +1, source.pos.y -1));
        positions.push(room.lookAt(source.pos.x +1, source.pos.y));
        positions.push(room.lookAt(source.pos.x +1, source.pos.y +1));
        positions.push(room.lookAt(source.pos.x , source.pos.y +1));
        for(key in positions)
            for(resKey in positions[key])
            {
                result = positions[key][resKey];
                if(result.type === "terrain" && result.terrain !== "wall")
                    source.memory.maxHarvesters++;
            }
        room.memory.harvestersNeeded += source.memory.maxHarvesters;
    }
    room.memory.allocated = true;
    for(var key in room.spawners)
        buildStorageAround(room, room.spawners[key].pos);
}

function getSpawners(room)
{
    return room.find(FIND_MY_SPAWNS);
}

function getSources(room)
{
    return room.find(FIND_SOURCES);
}

function getOptimalSource(sourceIDs)
{
    var optimalSourceID = sourceIDs[0];
    var leastUsers = 9999999;
    for(key in sourceIDs)
    {
        source = Game.getObjectById(sourceIDs[key]);
        users = source.memory.harvesterAmount;
        if(users < source.memory.maxHarvesters && users < leastUsers)
        {
            leastUsers = users;
            optimalSourceID = source.id;
        }
    }
    return optimalSourceID;
}

function getNextUnit(room)
{
    if(room.builders.length == 0 &&
       room.harvesters.length >= room.memory.harvestersNeeded/2+1 &&
       room.unfinishedStructures.length > 0)
    {
        neededUnit = units.smallBuilder;
    }
    else if(room.harvesters.length < room.memory.harvestersNeeded)
    {
        neededUnit = units.smallHarvester;
        neededUnit.memory = util.joinDicts({'sourceID': getOptimalSource(room.memory.sourceIDs)}, neededUnit.memory);
    }
    else if(room.upgraders.length < UPGRADERS_NEEDED)
    {
        neededUnit = units.smallUpgrader;
    }
    else if(room.builders.length < BUILDERS_NEEDED)
    {
        neededUnit = units.smallBuilder;
    }
    return neededUnit;
}

profiler.registerObject(Harvester, "Harvester");
profiler.registerObject(Builder, "Builder");
profiler.registerObject(Upgrader, "Upgrader");

module.exports = {
    update(room)
    {
        if(!room.controller || !room.controller.my)
            return;

        room.unfinishedStructures = _.filter(Game.constructionSites, (site) => site.room.id === room.id);
        room.spawners = getSpawners(room);
        if(!room.memory.allocated)
        {
            console.log("Room "+room.name+" allocated")
            allocateRoom(room);
        }

        checkQueue("room", room);
        var roomCreepsDict = units.getRoomCreepsDict(room);
        room.harvesters = roomCreepsDict['harvester'];
        room.upgraders = roomCreepsDict['upgrader'];
        room.builders = roomCreepsDict['builder'];

        /* Get room situation and set status accordingly */
        neededUnit = null
        noBuild = false;
        noUpgrade = false;
        if(room.harvesters.length < room.memory.harvestersNeeded/2)
        {
            noBuild = true;
            noUpgrade = true;
        }

        /* Choose actions for this room, based on status */

        /*
        switch(status){
            case RoomStatus.BUILD:

                break;
            case RoomStatus.CONNECT:

                break;
            case RoomStatus.WAR:

                break;

            default:
                break;
        }

        /* Update creeps */
        for(var creep of room.harvesters)
            Harvester.update(creep);
        for(var creep of room.upgraders)
            Upgrader.update(creep);
        for(var creep of room.builders)
            Builder.update(creep);

        var hasAvailableSpawner = false;
        for(var key in room.spawners)
            if(room.spawners[key].spawning == null)
            {
                if(room.spawners[key].energy >= 300)
                {
                    hasAvailableSpawner = true;
                    spawner = room.spawners[key];
                    break;
                }
            }

        if(hasAvailableSpawner)
        {
            neededUnit = getNextUnit(room);
            if(neededUnit)
                SpawnManager.update(spawner, neededUnit, room)
        }
    }
};
