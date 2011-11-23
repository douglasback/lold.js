tell application "iTunes"
	if player state is paused then return false
	if player state is playing then return true
end tell