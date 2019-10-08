var budgetController = (function() {
  var _Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1;
  };

  _Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0)
      this.percentage = Math.round((this.value / totalIncome) * 100);
    console.log(this.percentage + " is the calculated percentage");
  };

  _Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var _Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  // DATA MODEL
  var _data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: 0
  };

  var _calculateTotal = function(type) {
    var sum = 0;
    _data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    _data.totals[type] = sum;
  };

  return {
    addNewItem: function(type, desc, value) {
      var newItem, ID;

      if (_data.allItems[type].length > 0) {
        ID = _data.allItems[type][_data.allItems[type].length - 1].id + 1;
      } else ID = 0;

      if (type === "inc") {
        newItem = new _Income(ID, desc, value);
      } else if (type === "exp") {
        newItem = new _Expense(ID, desc, value);
      }
      _data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids;

      ids = _data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);
      if (index != -1) {
        _data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      //Calculate Totals
      _calculateTotal("inc");
      _calculateTotal("exp");

      // Calculate budget: income - expense
      _data.budget = _data.totals.inc - _data.totals.exp;

      // Calculate percentage: Expense/Income * 100
      _data.percentage = Math.round(
        (_data.totals.exp / _data.totals.inc) * 100
      );
    },
    calculateAllPercentages: function() {
      //  console.log("Inside calculateAllPercentages in budget controller");
      _data.allItems.exp.forEach(function(current) {
        current.calcPercentage(_data.totals.inc);
      });
    },
    getAllPercentages: function() {
      var allPerc = _data.allItems.exp.map(function(current) {
        return current.percentage;
      });
      console.log(allPerc);
      return allPerc;
    },
    getBudget: function() {
      // Return budget
      return {
        budget: _data.budget,
        totalIncome: _data.totals.inc,
        totalExp: _data.totals.exp,
        percentage: _data.percentage
      };
    },
    testing: function() {
      console.log(_data);
    }
  };
})();

var uiController = (function() {
  var _DOMstrings = {
    type: ".add__type",
    desc: ".add__description",
    value: ".add__value",
    addBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePercLabel: ".item__percentage"
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(_DOMstrings.type).value,
        desc: document.querySelector(_DOMstrings.desc).value,
        value: parseFloat(document.querySelector(_DOMstrings.value).value)
      };
    },
    addListItem: function(newItem, type) {
      // 1. Create HTML string with placeholder text
      var html, newHtml, element;
      if (type === "inc") {
        element = _DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = _DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // 2. Replace placeholder with actual values
      newHtml = html.replace("%id%", newItem.id);
      newHtml = newHtml.replace("%desc%", newItem.desc);
      newHtml = newHtml.replace("%value%", newItem.value);
      // 3. Add HTML string to DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(selectorID) {
      //TODO Delete selected item
      // 1. Find parent node
      // 2. Remove the child node from the parent
      var el;

      el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearInputFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll(
        _DOMstrings.desc + ", " + _DOMstrings.value
      );
      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(current) {
        current.value = "";
      });
      fieldsArray[0].focus();
    },
    displayBudget: function(budgetObj) {
      document.querySelector(_DOMstrings.budgetLabel).textContent =
        budgetObj.budget;
      document.querySelector(_DOMstrings.incomeLabel).textContent =
        budgetObj.totalIncome;
      document.querySelector(_DOMstrings.expenseLabel).textContent =
        budgetObj.totalExp;
      if (budgetObj.percentage > 0) {
        document.querySelector(_DOMstrings.percentageLabel).textContent =
          budgetObj.percentage;
      } else {
        document.querySelector(_DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(allPercentages) {
      // Read all percentage fields from DOM
      var fields = document.querySelectorAll(_DOMstrings.expensePercLabel);

      // Loop over the percentage DOM fields and update with percentage fields
      //Custom forEach

      /* var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {
        if (allPercentages[index] > 0) {
          current.textContent = allPercentages[index] + "%";
        } else current.textContent = "---";
      }); */

      //Prototype forEach
      Array.prototype.forEach.call(fields, function(current, index) {
        if (allPercentages[index] > 0) {
          current.textContent = allPercentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    getDOMstrings: function() {
      return _DOMstrings;
    }
  };
})();

var appController = (function(budgetCtrl, uiCtrl) {
  var _DOM = uiCtrl.getDOMstrings();

  var _setupEventListeners = function() {
    document.querySelector(_DOM.addBtn).addEventListener("click", _ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        _ctrlAddItem();
      }

      //Setting up event listener for delete icon
      document
        .querySelector(_DOM.container)
        .addEventListener("click", _ctrlDeleteItem);
    });
  };
  var _updateBudget = function() {
    // Calculate budget
    budgetCtrl.calculateBudget();
    // Get updated budget
    var budget = budgetCtrl.getBudget();
    // Display budget on UI
    uiCtrl.displayBudget(budget);
  };
  var _ctrlAddItem = function() {
    // 1. Read input data
    var input = uiCtrl.getInput();

    if (input.desc != "" && input.value > 0) {
      // 2. Add it to data model
      var newItem = budgetCtrl.addNewItem(input.type, input.desc, input.value);

      // 3. Display new item on UI
      uiCtrl.addListItem(newItem, input.type);
      uiCtrl.clearInputFields();

      // 4.Calculate and update budget
      _updateBudget();

      // 5. Calculate all individual percentages
      console.log("Calling calculate Percentages method");
      _calculatePercentages();
    }
  };
  var _calculatePercentages = function() {
    // Calculate percentage of each expense - Update DS
    budgetCtrl.calculateAllPercentages();
    // Return percentages
    var allPercentages = budgetCtrl.getAllPercentages();
    uiCtrl.displayPercentages(allPercentages);
  };

  var _ctrlDeleteItem = function(event) {
    var itemID, splitID, id, type;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);
    }

    // 1. Delete the item from DS
    budgetCtrl.deleteItem(type, id);
    // 2. Delete the item from UI
    uiCtrl.deleteListItem(itemID);
    // 3. re-calculate budget and update UI
    _updateBudget();
    // 4. Calculate all individual percentages
    _calculatePercentages();
  };

  return {
    init: function() {
      _setupEventListeners();
      uiCtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
})(budgetController, uiController);

appController.init();
