local Methods = require(script.Parent.Core.Methods)

local PresenceService = {}

function PresenceService.SendHeartbeat()
	return Methods.SendHeartbeat()
end

function PresenceService.Log(eventName, info, player)
	return Methods.Log(eventName, info, player)
end

function PresenceService.SetPlayerContext(player, context)
	return Methods.SetPlayerContext(player, context)
end

function PresenceService.RegisterLiveAction(actionKey, handler)
	return Methods.RegisterLiveAction(actionKey, handler)
end

function PresenceService.Start()
	warn("[PresenceService] API Start called:", script:GetFullName())
	Methods.Start()
end

return PresenceService
