

module.exports = {
    /*
        Cost Table:

        MOVE:           50
        WORK:           100
        CARRY:          50
        ATTACK:         80
        RANGED_ATTACK:	150
        HEAL:           250
        TOUGH:          10
        CLAIM:          600
    */

    smallHarvester: {
        body: [CARRY, CARRY, WORK, MOVE, MOVE],
        cost: 300,
        namePrefix: 'Small_Harverster_',
        role: 'harvester',
        memory: {}
    },

    smallUpgrader: {
        body: [CARRY, CARRY, WORK, MOVE, MOVE],
        cost: 300,
        namePrefix: 'Small_Upgrader_',
        role: 'upgrader',
        memory: {}
    },

    smallBuilder: {
        body: [CARRY, CARRY, WORK, MOVE, MOVE],
        cost: 300,
        namePrefix: 'Small_Builder_',
        role: 'builder',
        memory: {}
    },

    getRoomCreepsDict(room)
    {
      roomCreeps = {
        'harvester': [],
        'upgrader': [],
        'builder': []
      };
      for(var name in Game.creeps)
      {
        if(Game.creeps[name].memory.owner === room.name)
          for(var role in roomCreeps)
            if(Game.creeps[name].memory.role === role)
            {
              roomCreeps[role].push(Game.creeps[name]);
              break;
            }
      }
      return roomCreeps;
    }
};
