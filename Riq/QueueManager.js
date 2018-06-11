// file scope vars so we dont need to explicitly always instantiate them
var room;
var creep;



function roomQueue()
{
    if(!Memory.rooms[room.name].queuedActions)
        Memory.rooms[room.name].queuedActions = {};

    actions = Memory.rooms[room.name].queuedActions
    for(var action in actions)
    {
        switch(action)
        {
            case "XYZfunc, dont make own block for all":
            case "can use this one generally for all funcs":
            case "just remember to use this text as func name":
            case "and remember to create same named func into":
            case "roomActions dinctionary which takes 1 argument":
            case "addBuildingToPriorityQueue":
                roomActions[action](actions[action]);
                break;
            default:
                console.error("[QueueManager]: ", action, " is not a defined action!");
                break;
        }
    }
}

var roomActions = {
    addBuildingToPriorityQueue: function(buildingData){
        if(buildingData.length !== 0)
        {
            console.log("had something in queue")
            for(var x = 0; x < buildingData.length; x++)
            {
                var building = null;
                var cnstrData = buildingData[x];
                var objs = room.lookAt(cnstrData.x, cnstrData.y);
                for(var objKey in objs)
                {
                    var obj = objs[objKey];
                    if(obj.type === "constructionSite"
                    && obj.constructionSite.structureType === cnstrData.structure)
                    {
                        building = obj.constructionSite;
                        break;
                    }
                }
                if(building)
                {
                    buildingPriorityQueue.push({
                        id: building.id,
                        priority: cnstrData.priority
                    });
                    buildingData.splice(x, 1);
                    x--;
                }
            }
        }
    },
}


// Target is the object type and obj is actual instance of that object type
checkQueue = function(target, obj){
    switch(target)
    {
        case "room":
            room = obj;
            roomQueue();
            break;
        case "creep":
            break;
        default:
            console.error("[QueueManager]: Undefined queue target!");
            break;
    }
}
