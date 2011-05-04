#Hokke.js - define hotkey library

##what is it
Hokke.js is hotkey define library.
hot-key -> hokey -> hokke
hokke is delicious fish
http://ja.wikipedia.org/wiki/%E3%83%9B%E3%83%83%E3%82%B1

##usage

 - Hokke.map(key, callback)
 - Hokke.unmap(key)
 - Hokke.command(keys, callback)

###ok, this is very simple

    Hokke.map("j", function(){alert("j")});

###using arrow keys and Enter, Space
arrow keys are Left, Top, Right and Down.

    Hokke.map("Top", function(){alert("top")});

Enter, Space key is available too.

    Hokke.map("Enter", function(){alert("enter")});
    Hokke.map("Space", function(){alert("space")});

###using modifier keys
modifier keys are Shift, Ctrl and Alt.

this mapping is Shift-j.

    Hokke.map("S-j", function(){alert("j with Shift key")});

more complex, this mapping is Shift-Ctrl-Right.

    Hokke.map("S-C-j", function(){alert("j with Shift key and Ctrl key")});

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
