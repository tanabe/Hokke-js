#Hokke.js - define hotkey library

##usage
Hokke.js can bind any key types.
api are

 - map(key, callback)
 - unmap(key)
 - command(keys, callback)

###very simple

    Hokke.map("j", function(){alert("j")});

###useing arrow keys and Enter, Space
arrow keys are Left, Top, Right and Down.

    Hokke.map("Top", function(){alert("top")});

Enter, Space key is available too.

    Hokke.map("Enter", function(){alert("enter")});
    Hokke.map("Space", function(){alert("space")});

###useing modifier keys
modifier keys are Shift, Ctrl and Alt.

this mapping is Shift-j.

    Hokke.map("S-j", function(){alert("j")});

more complex, this mapping is Shift-Ctrl-Right.

    Hokke.map("S-C-j", function(){alert("j")});

###callback is not only function but also anchor element
this is mapping to anchor element (a tag).

    //HTML
    <a href="http://google.com" id="google" target="_blank">google</a>
    //JavaScript
    Hokke.map("C-g", document.getElementById("google"));

if anchor element has onlick handler, onlick handler is high priority.

    //HTML
    <a href="http://google.com" id="google" onclick="alert('google');>google</a>
    //JavaScript
    Hokke.map("C-g", document.getElementById("google"));

###command interface a.k.a konami command
Hokke.js can define any command.

this command definition means "user typing google within 5 seconds then alert showing".

    Hokke.command(["g", "o", "o", "g", "l", "e"], alert("google"), 5000);
