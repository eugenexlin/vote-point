using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace VotePointLib
{
	public class CCostPointController
	{
		//protected static Dictionary<string, CUser> idToUser = new Dictionary<string, CUser>();

		//public static string getUsersJson()
		//{
		//	JArray result = new JArray();
		//	foreach (CUser user in idToUser.Values)
		//	{
		//		result.Add(user.getJSON());
		//	}
		//	return result.ToString();
		//}
		//public static string getUsersJson(int channel)
		//{
		//	JArray result = ensureChannelCreated(channel).getUsers();
		//	return result.ToString();
		//}

		//public static CUser GetUser(string id)
		//{
		//	if (!idToUser.ContainsKey(id))
		//	{
		//		idToUser[id] = new CUser();
		//		idToUser[id].id = id;
		//	}
		//	return idToUser[id];
		//}
		//public static CChannel ensureChannelCreated(int channelNum)
		//{
		//	if (!channels.ContainsKey(channelNum))
		//	{
		//		lock (channelLock)
		//		{
		//			if (!channels.ContainsKey(channelNum))
		//			{
		//				channels[channelNum] = new CChannel();
		//			}
		//		}
		//	}
		//	return channels[channelNum];
		//}
		
		//public static void joinUserToChannel(string userid, int channel)
		//{
		//	CUser user = GetUser(userid);
		//	CChannel oOldChan = user.channel;
		//	oOldChan.removeUser(user.id);

		//	CChannel oChan = ensureChannelCreated(channel);
		//	user.channel = oChan;
		//	oChan.addUser(user);

		//}


	}
	
}