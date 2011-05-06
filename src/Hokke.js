/**
 * Hokke.js
 * simple attach keyboard shortcut library
 * @author Hideaki Tanabe<tanablog@gmail.com>
 * under MIT license
 */
(function(window) {
  var LEFT_ARROW_CODE  = -37;
  var UP_ARROW_CODE   = -38;
  var RIGHT_ARROW_CODE = -39;
  var DOWN_ARROW_CODE  = -40;

  var SHIFT_KEY_FLAG = 1;
  var ALT_KEY_FLAG   = 2;
  var CTRL_KEY_FLAG  = 4;

  var existingKeyDownEventHandler = null;
  var existingKeyPressEventHandler = null;
  var existingKeyUpEventHandler = null;

  var maps = [];
  var modifierKeyFlag = 0;
  var keyCode = 0;

  var pressed = false;
  var commands = [];
  var commandStack = [];
  var timer = null;

  /**
   * capture modifier keys and arrow key
   * @name keyDownHandler
   * @function
   * @param event keyboard event
   */
  var keyDownHandler = function(event) {
    //if event.target is input then do nothing
    var target;

    //IE has not has not event.target
    if (event) {
      target = event.target;
    } else {
      target = window.event.srcElement;
    }

    if (isTextInputElement(target)) {
      return;
    }

    if (!event) {
      event = window.event;
    }

    modifierKeyFlag = 0;

    if (event.shiftKey) {
      modifierKeyFlag += SHIFT_KEY_FLAG;
    }

    if (event.altKey) {
      modifierKeyFlag += ALT_KEY_FLAG;
    }

    if (event.ctrlKey) {
      modifierKeyFlag += CTRL_KEY_FLAG;
    }


    //left arrow
    if (event.keyCode === 37) {
      fire(search(modifierKeyFlag, LEFT_ARROW_CODE));
      pushCommand({modifierKeyFlag: modifierKeyFlag, keyCode: LEFT_ARROW_CODE});
    //top arrow
    } else if (event.keyCode === 38) {
      fire(search(modifierKeyFlag, UP_ARROW_CODE));
      pushCommand({modifierKeyFlag: modifierKeyFlag, keyCode: UP_ARROW_CODE});
    //right arrow
    } else if (event.keyCode === 39) {
      fire(search(modifierKeyFlag, RIGHT_ARROW_CODE));
      pushCommand({modifierKeyFlag: modifierKeyFlag, keyCode: RIGHT_ARROW_CODE});
    //down arrow
    } else if (event.keyCode === 40) {
      fire(search(modifierKeyFlag, DOWN_ARROW_CODE));
      pushCommand({modifierKeyFlag: modifierKeyFlag, keyCode: DOWN_ARROW_CODE});
    //standard key
    } else {
      //normalize to lower case
      keyCode = String.fromCharCode(event.keyCode).toLowerCase().charCodeAt(0);
      //console.log(keyCode);
    }
    //console.log(modifierKeyFlag, "down", event.keyCode, event.charCode);
  };

  /**
   * capture ascii keys
   * @name keyPressHandler
   * @function
   * @param event keyboard event
   */
  var keyPressHandler = function(event) {
    var target;

    //IE has not has not event.target
    if (event) {
      target = event.target;
    } else {
      target = window.event.srcElement;
    }

    //if event.target is input then do nothing
    if (isTextInputElement(target) || keyCode === 0) {
      return;
    }

    //symbol will ignore Shift key
    if (isSymbol(keyCode)) {
      modifierKeyFlag -= SHIFT_KEY_FLAG;
      if (modifierKeyFlag < 0) {
        modifierKeyFlag = 0;
      }
    }
    fire(search(modifierKeyFlag, keyCode));
    pushCommand({modifierKeyFlag: modifierKeyFlag, keyCode: keyCode});
    //console.log(modifierKeyFlag, "press", event.keyCode, event.charCode);
    //console.log(String.fromCharCode(event.keyCode));
  };

  /**
   * check element type is input
   * @name isTextInputElement
   * @function
   * @param element target element
   * @return true/false
   */
  var isTextInputElement = function(element) {
    return /input|textarea/i.test(element.tagName);
  };

  /**
   * 
   * @name search
   * @function
   * @param modifierKeyFlag modifier key flag 0..7
   * @param keyCode key code
   * @return callback
   */
  var search = function(modifierKeyFlag, keyCode) {
    if (keyCode) {
      for (var i = 0, length = maps.length; i < length; i++) {
        var map = maps[i];
        if (map.key.modifierKeyFlag === modifierKeyFlag 
            && map.key.keyCode === keyCode) {
          return map.callback;
        }
      }
    }
    return null;
  };

  /**
   * fire callback function or open url
   * @name fire
   * @function
   * @param callback 
   */
  var fire = function(callback) {
    if (!callback) {
      return;
    }

    //if callback is function
    if (typeof callback === "function") {
      callback.apply();
    //if callback is anchor object
    } else if (typeof callback === "object") {
      var element = callback;
      //element has click event
      if (element.onclick) {
        element.onclick.apply(element);
      //element is normal anchor element
      } else {
        var url = element.href;
        var target = element.target;
        if (!target) {
          location.href = url;
        } else {
          window.open(url, target);
        }
      }
    }
  };

  /**
   * parse formatted key
   * @name parseFormattedKey
   * @function
   * @param formattedKey 
   * @return modifierKeyFlag and keyCode
   */
  var parseFormattedKey = function(formattedKey) {
    var pattern = /^([ASC]-){0,3}(\S{1}|Left|Right|Up|Down|Space|Enter)$/gi;
    var modifierKeyFlag = 0;
    var keyCode = 0;
    if (pattern.exec(formattedKey)) {
      //FIXME I want use RegExp group capture instead of split. but not work.
      var keys = formattedKey.split(/-/);
      var key = keys.pop().toLowerCase();
      switch (key) {
        case "left":
          keyCode = LEFT_ARROW_CODE;
          break;
        case "up":
          keyCode = UP_ARROW_CODE;
          break;
        case "right":
          keyCode = RIGHT_ARROW_CODE;
          break;
        case "down":
          keyCode = DOWN_ARROW_CODE;
          break;
        case "space":
          keyCode = 32;
          break;
        case "enter":
          keyCode = 13;
          break;
        default:
          //normalize to lower case
          keyCode = key.charCodeAt(0);
          break;
      }

      //modifier key
      for (var i = 0, length = keys.length; i < length; i++) {
        switch (keys[i].toLowerCase()) {
          case "s":
            if (!isSymbol(keyCode)) {
              modifierKeyFlag += SHIFT_KEY_FLAG;
            }
            break;
          case "a":
            modifierKeyFlag += ALT_KEY_FLAG;
            break;
          case "c":
            modifierKeyFlag += CTRL_KEY_FLAG;
            break;
        }
      }
    }
    return {modifierKeyFlag: modifierKeyFlag, keyCode: keyCode};
  };

  /**
   * check input command
   * @name checkCommand
   * @function
   * @param keys setting keys
   * @param commandStack input stack
   * @param timer timer
   * @param callback callback function
   */
  var checkCommand = function(keys, commandStack, timer, callback) {
    //TODO refactoring not good...
    return function() {
      checkCommandStack(keys, commandStack, timer, callback);

      //clear stack
      commandStack.splice(0, commandStack.length);
    }
  };

  /**
   * check input command (internal)
   * @name checkCommand
   * @function
   * @param keys setting keys
   * @param commandStack input stack
   * @param timer timer
   * @param callback callback function
   */
  var checkCommandStack = function(keys, commandStack, timer, callback) {
    //console.log("check" , timer.interval);
    var isCorrect = true;
    //if same length -> verify
    if (commandStack.length > 0 && commandStack.length === keys.length) {
      for (var i = 0, length = commandStack.length; i < length; i++) {
        //console.log(commandStack[i], keys[i]);
        if ((commandStack[i].modifierKeyFlag !== keys[i].modifierKeyFlag) 
        || (commandStack[i].keyCode !== keys[i].keyCode)) {
          isCorrect = false;
          break;
        }
      }

      //if correct input, fire callback
      if (isCorrect) {
        //console.log("ok");
        fire(callback);
      }
      timer.stop();
    }
    //console.log(commandStack);
  };


  /**
   * push commnad to stack
   * @name pushCommand
   * @function
   * @param parsedKey modifierKeyFlag and keyCode
   */
  var pushCommand = function(parsedKey) {
    if (!pressed) {
      for (var i = 0, length = commands.length; i < length; i++) {
        var timer = commands[i].timer;
        if (!timer.isRunning) {
          timer.start();
        }
        commands[i].commandStack.push(parsedKey);

        //check input keys
        checkCommandStack(
          commands[i].formattedKeys,
          commands[i].commandStack,
          commands[i].timer,
          commands[i].callback
        );
        //console.log(commands[i].commandStack);
      }

      //FIXME if watching 'pressed' flag, cannott accept faster typing
      //current Off
      //pressed = true;
    }
  };

  /**
   * check key is alphabet
   * @name isAlphabet
   * @function
   * @param keyCode
   * @return 
   */
  var isAlphabet = function(keyCode) {
    return (64 < keyCode && keyCode < 91) || (96 < keyCode && keyCode < 123);
  };

  /**
   * check keyCode is symbol
   * @name isSymbol
   * @function
   * @param keyCode
   * @return 
   */
  var isSymbol = function(keyCode) {
    if (isNaN(keyCode)) {
      throw Error(keyCode + " is not a number");
      return false;
    }
    return (32 < keyCode && keyCode < 65) || (90 < keyCode && keyCode < 97) || (122 < keyCode && keyCode < 127);
  };

  /**
   * Timer class
   * @name Timer
   * @function
   * @param callback callback function
   * @param time time(ms)
   */
  var Timer = function(callback, time) {
    this.interval = null;
    this.callback = callback;
    this.time = time;
    this.isRunning = false;
  };

  Timer.prototype.setCallback = function(callback) {
    this.callback = callback;
  };

  Timer.prototype.start = function() {
    this.interval = setInterval(this.callback, this.time);
    this.isRunning = true;
  };

  Timer.prototype.stop = function() {
    clearInterval(this.interval);
    this.isRunning = false;
  };

  window.Hokke = {
    /**
     * add hotkey
     * @name map
     * @function
     * @param key hotkey
     * @param callback callback is function or anchor element
     */
    map: function(key, callback) {
      //not initialized
      if (maps.length === 0) {
        //avoid conflict
        if (document.onkeydown) {
          existingKeyDownEventHandler = document.onkeydown;
        }

        document.onkeydown = function(event) {
          if (existingKeyDownEventHandler) {
            existingKeyDownEventHandler.apply(document, arguments);
          }
          keyDownHandler.apply(document, arguments);
        };

        //avoid conflict
        if (document.onkeypress) {
          existingKeyPressEventHandler = document.onkeypress;
        }

        document.onkeypress = function(event) {
          if (existingKeyPressEventHandler) {
            existingKeyPressEventHandler.apply(document, arguments);
          }
          keyPressHandler.apply(document, arguments);
        };

      }
      //add new setting to maps
      //console.log(parseFormattedKey(key));
      maps.push({key: parseFormattedKey(key), callback: callback});
    },

    /**
     * remove hotkey
     * @name unmap
     * @function
     * @param key hotkey
     */
    unmap: function(key) {
      var parsedKey = parseFormattedKey(key);
      for (var i = 0, length = maps.length; i < length; i++) {
        var map = maps[i];
        if (map.key.modifierKeyFlag === parsedKey.modifierKeyFlag 
            && map.key.keyCode === parsedKey.keyCode) {
          maps.splice(i, 1);
          return;
        }
      }
    },

    /**
     * 
     * @name command
     * @function
     * @param keys array of key
     * @param callback callback is function or anchor element
     * @param time ms
     */
    command: function(keys, callback, time) {
      //console.log(keys);
      //var timer = new Timer(function(){console.log("test")}, 1000);
      if (commands.length === 0) {
        if (document.onkeyup) {
          existingKeyUpEventHandler = document.onkeyup;
        }

        document.onkeyup = function(event) {
          if (existingKeyUpEventHandler) {
            existingKeyUpEventHandler.apply(document, arguments);
          }
          pressed = false;
        };
      }

      var commandStack = [];
      var formattedKeys = [];
      for (var i = 0, length = keys.length; i < length; i++) {
        formattedKeys.push(parseFormattedKey(keys[i]));
      }
      var timer = new Timer(null, time);
      timer.setCallback(checkCommand(formattedKeys, commandStack, timer, callback));
      commands.push(
        {
          formattedKeys: formattedKeys,
          commandStack: commandStack,
          timer: timer,
          callback: callback
        }
      );
    }
  };
})(window);
