const softkeyCallback = {
    left: function() {console.log("LEFT")},
    right: function() {console.log("RIGHT")},
    center: function() {imageUpload.click()}
};

function handleKeyDown(evt)
{
    switch (evt.key)
    {
        case 'SoftLeft':
            softkeyCallback.left();
        break;
        case 'SoftRight':
            softkeyCallback.right();
        break;
        case 'Enter':
            softkeyCallback.center();
        break;
    }
};

document.addEventListener('keydown', handleKeyDown);