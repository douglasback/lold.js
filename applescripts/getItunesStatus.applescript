tell application "System Events"
	if application process "iTunes" exists then
		tell application "iTunes"
			
			if player state is playing and kind of current track does not contain "Internet"  then
				
				return true
			else
				return false
			end if
		end tell
	else
		return false
	end if
end tell