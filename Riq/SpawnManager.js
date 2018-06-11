var util = require('TechUtility');

module.exports = {
    update(spawner, unit, room)
    {
        if(room.energyAvailable >= unit.cost)
        {
          console.log("Unit "+unit.namePrefix+'Jack'+Game.time+" spawned!");
          spawner.spawnCreep(
              unit.body, unit.namePrefix+'Jack'+Game.time,
              {memory: util.joinDicts({
                  role: unit.role, owner: room.name},
                  unit.memory
              )}
          )
        }
    }
};
