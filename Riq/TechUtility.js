module.exports = {
    listProperties(obj)
    {
       let propList = "";
       for(let propName in obj)
       {
          if(typeof(obj[propName]) != "undefined")
          {
             propList += propName + ": " + obj[propName] + "\n";
          }
       }
       console.log(propList);
    },
    joinDicts(d1, d2)
    {
      for(let key in d2)
        d1[key] = d2[key];

      return d1;
    }
};
