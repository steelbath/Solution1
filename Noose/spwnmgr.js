module.exports = {
autospawn(keyDict){
    for(var key in keyDict){
        var creepsbyrole = _.filter(Game.creeps, (creep) => creep.memory.role == key);
    if(creepsbyrole.length < keyDict[key] & Game.spawns['Spawn1'].energy >= 300) {
        console.log(keyDict[key]);
        var newName = key + Game.time;
        console.log('Spawning new'+ key + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: key}});        
    }
}
}
};