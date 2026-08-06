local Methods = require(script.Parent.Core.Methods)

local RoAnalytics = {}

function RoAnalytics.SendHeartbeat()
	return Methods.SendHeartbeat()
end

function RoAnalytics.Log(eventName, info, player)
	return Methods.Log(eventName, info, player)
end

function RoAnalytics.SetPlayerContext(player, context)
	return Methods.SetPlayerContext(player, context)
end

function RoAnalytics.RequestGroupRank(player, eventKey)
	return Methods.RequestGroupRank(player, eventKey)
end

function RoAnalytics.RegisterLiveAction(actionKey, handler)
	return Methods.RegisterLiveAction(actionKey, handler)
end

function RoAnalytics.RegisterPlayerDataAdapter(adapter)
	return Methods.RegisterPlayerDataAdapter(adapter)
end

function RoAnalytics.Start()
	Methods.Start()
end

return RoAnalytics
