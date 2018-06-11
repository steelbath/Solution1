class ExtendableBinaryHeap
{
  constructor()
  {
    this.nodes = [];
    this.nodes.push([]); // make the array start from 1 instead of 0
  }

  ascendHeap()
  {
    var heapPos = this.nodes.length -1;
    var shouldAscend = true;
    var parentPos;
    while(shouldAscend)
    {
      parentPos = Math.floor(heapPos/2);
      if(parentPos === 0)
        break;

      if(this.comparer(this.nodes[heapPos], this.nodes[parentPos]))
      {
        var temp = this.nodes[parentPos];
        this.nodes[parentPos] = this.nodes[heapPos];
        this.nodes[heapPos] = temp;
        heapPos = parentPos;
      }
      else
        shouldAscend = false;
    }
  }

  descendHeap()
  {
    var heapPos = 1;
    var shouldDescend = true;
    var firstChildPos;
    var secondChildPos;
    while(shouldDescend)
    {
      firstChildPos = (heapPos * 2);
      secondChildPos = (heapPos * 2) + 1;
      if(firstChildPos < this.nodes.length)
      {
        var swapTarget;
        if (secondChildPos < this.nodes.length)
          swapTarget = this.comparer(this.nodes[firstChildPos], this.nodes[secondChildPos])
                       ? firstChildPos
                       : secondChildPos;
        else
          swapTarget = firstChildPos;

        if(!this.comparer(this.nodes[heapPos], this.nodes[swapTarget]))
        {
          var temp = this.nodes[swapTarget];
          this.nodes[swapTarget] = this.nodes[heapPos];
          this.nodes[heapPos] = temp;
          heapPos = swapTarget;
        }
        else
          shouldDescend = false;
      }
      // bottom level reached, we are the largest number
      else
        shouldDescend = false;
    }
  }

  /**
  * Adds new value into heap
  */
  push(value)
  {
    this.nodes.push(value);
    this.ascendHeap();
  }

  /**
  * Returns top value from heap and removes it from heap
  */
  pop()
  {
    var val = this.nodes.length > 1 ? this.nodes[1] : null;
    if(val)
      this.descendHeap();
    return val;
  }

  /**
  * Returns top value from heap without causing changes to heap
  */
  getValueAtTop()
  {
    return this.nodes.length > 1 ? this.nodes[1] : null;
  }

  /**
  * Serializes node data into JSON-string format
  *
  * @type {function}
  *
  * @returns {string|Serialized node data}
  */
  serialize()
  {
    return JSON.stringify(this.nodes);
  }

  /**
  * Builds new BinaryHeap from the serialized JSON-data
  *
  * @type {function}
  *
  * @param {string} serializedData Serialized node data as JSON
  *
  * @returns {BinaryHeap}
  */
  static deserialize(serializedData)
  {
    var data = JSON.parse(serializedData);
    var binaryHeap = new this();
    binaryHeap.nodes = data;
    return binaryHeap;
  }

  comparer(node1, node2){throw new Error('Not implemented');}
}

class MaxPriorityHeap extends ExtendableBinaryHeap
{
  constructor(){ super(); }
  comparer(node1, node2)
  {
    return node1.priority > node2.priority;
  }
}

/* Only for example currently */
class MinBuildingHealthHeap extends ExtendableBinaryHeap
{
  /*
    Building is object with various attributes ie.
    {
      type: structure,
      name: whatever,
      health: 12345
    }
  */
  constructor(){ super(); }

  /* To make the heap always have lowest value at top, we invert the comparer function*/
  comparer(node1, node2)
  {
    return node1.health < node2.health;
  }
}

module.exports = {MaxPriorityHeap, MinBuildingHealthHeap};
