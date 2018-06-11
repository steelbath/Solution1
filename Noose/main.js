var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var spawner = require('spwnmgr');

module.exports.loop = function () {

    spawner.autospawn({'harvester':1,'upgrader':5, 'builder':2});
    
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        switch(creep.memory.role){
            case 'harvester':
            roleHarvester.run(creep);
            break;
            case 'upgrader':
            roleUpgrader.run(creep);
            break;
            case 'builder':
            roleBuilder.run(creep);
            break;
        }
    }
}