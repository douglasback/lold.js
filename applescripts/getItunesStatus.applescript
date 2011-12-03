tell application "iTunes"    
    if player state is playing and kind of current track does not contain "Internet"  then
        return true
    else
        return false
    end if
end tell
