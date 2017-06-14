using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Microsoft.AspNet.SignalR;
using VotePointLib;
using System.Threading.Tasks;

namespace VotePoint.Hubs
{
	public class VotePointHub : Hub
	{
		public const int MAX_CHAT_MESSAGE_CHARS = 10000;

		protected static Dictionary<string, JoinState> connectionIDtoState = new Dictionary<string, JoinState>();
		
		protected static Dictionary<int, CChannel> channels = new Dictionary<int, CChannel>();
		protected static Object channelLock = new Object();

		protected static Dictionary<string, DateTime> connectionIDActivity = new Dictionary<string, DateTime>();

		public class JoinState
		{
			public CUser user = null;
			public CChannel channel = null;
			public bool isValid()
			{
				return (user != null) && (channel != null);
			}
		}

		/// <summary>
		/// if requireValid, will signal client to resend register info if failed to find any.
		/// </summary>
		/// <returns></returns>
		public JoinState getJoinState(bool requireValid = true)
		{
			JoinState result = new JoinState();
			if (connectionIDtoState.ContainsKey(Context.ConnectionId))
			{
				result = connectionIDtoState[Context.ConnectionId];
                result.user.lastActivity = DateTime.Now;
            }
			if (requireValid && !result.isValid())
			{
				signalUnmappableConnectionID();
			}
			return result;
		}

		public Task UnregisterUser(JoinState state)
		{
			state.channel.removeUser(state.user.id);
			return Groups.Remove(Context.ConnectionId, state.channel.group);
		}

		public void ResetChannelUsers()
		{
			JoinState state = getJoinState();
			if (!state.isValid()) { return; }

			SendSystemMessage(state.channel, String.Format("<strong>{0}</strong> is resetting the channel", state.user.name));

			state.channel.removeAllUsers();
			
			Clients.Group(state.channel.group).reregisterUser();
		}

		public void RegisterUser(string userId, string name, string iconHash, int channelNum)
		{
			bool isChannelChanged = true;
			Task unregisterTask = null;
			JoinState prevState = getJoinState(false);
			if (prevState.isValid())
			{
				if (channelNum != prevState.channel.id)
				{
					unregisterTask = UnregisterUser(prevState);
				}else
				{
					isChannelChanged = false;
				}
			}
			
			CChannel channel = ensureChannelCreated(channelNum);

			Task registerTask = null;
			if (isChannelChanged) {
				registerTask = Groups.Add(Context.ConnectionId, channel.group);
			}

			CUser user = new CUser();
			user.id = userId;
			user.name = name;
			user.iconHash = iconHash;

			channel.addUser(user);
			JoinState newState = new JoinState();
			newState.user = user;
			newState.channel = channel;

			connectionIDtoState[Context.ConnectionId] = newState;
			

			if (unregisterTask != null)
			{
				unregisterTask.Wait();
				RefreshConnectedUsers(prevState.channel);
			}
			if (registerTask != null)
			{
				registerTask.Wait();
			}
			RefreshConnectedUsers(channel);
		}

		//notifies all connected users of a channel of current connected users.
		public void RefreshConnectedUsers(CChannel channel)
		{
			JObject prevChanOut = channel.getChannelState();
			Clients.Group(channel.group).setChannelState(prevChanOut.ToString());
		}

		public void UpdateIconHash(string iconHash)
		{
			JoinState state = getJoinState();
			if (!state.isValid()) { return; }

			CUser user = state.user;
			user.iconHash = iconHash;
			Clients.Group(state.channel.group).updateIcon(user.id, user.iconHash);
		}
		public void UpdateUserName(string userName)
		{
			JoinState state = getJoinState();
			if (!state.isValid()) { return; }

			CUser user = state.user;
			user.name = userName;
			Clients.Group(state.channel.group).updateName(user.id, user.name);
		}

		public void ExitVotePoint()
		{
			JoinState state = getJoinState(false);
			if (!state.isValid()) { return; }
			Task unregister = UnregisterUser(state); //no need to wait. worst case we oour own notification that we left.
			RefreshConnectedUsers(state.channel);
		}

		public void CastVote(int cost)
		{
			JoinState state = getJoinState();
			if (!state.isValid()) { return; }

			state.channel.setVote(state.user.id, cost);
			if (state.channel.showVotes)
			{
				RefreshConnectedUsers(state.channel);
			}
			else
			{
				if (cost > 0)
				{
					Clients.Group(state.channel.group).hasVote(state.user.id);
				}
				else
				{
					Clients.Group(state.channel.group).undoVote(state.user.id);
				}
			}


		}
		public void ShowAllVotes(string userId)
		{
			JoinState state = getJoinState();
			if (!state.isValid()) { return; }

			SendSystemMessage(state.channel, String.Format("<strong>{0}</strong> revealed the vote", state.user.name));

			state.channel.showVotes = true;
			RefreshConnectedUsers(state.channel);

		}

		public void ResetVotes(string userId)
		{
			JoinState state = getJoinState();
			if (!state.isValid()) { return; }

			SendSystemMessage(state.channel, String.Format("<strong>{0}</strong> reset the vote", state.user.name));

			state.channel.resetVotes();
			RefreshConnectedUsers(state.channel);

		}
		
		public void SendChatMessage(string textMessage)
		{

			string message = System.Web.HttpUtility.HtmlEncode(textMessage);
			JoinState state = getJoinState();
			if (!state.isValid()) { return; }

			JObject jMessage = new JObject();
			jMessage.Add("id", new JValue(state.user.id));

			if (!CChatValidator.isTextSafe(message))
			{
				jMessage.Add("isDeleted", new JValue(true));
			}
			else {

				if (message.Length > MAX_CHAT_MESSAGE_CHARS)
				{
					message = message.Substring(0, MAX_CHAT_MESSAGE_CHARS);
				}
				string emoteMessage = CEmoteManager.SpliceEmotes(message);

				jMessage.Add("html", new JValue(emoteMessage));
			}
			
			Clients.Group(state.channel.group).addChat(jMessage.ToString());
		}

		protected void SendSystemMessage(CChannel channel, string html)
		{
			JObject jMessage = new JObject();
			jMessage.Add("isSystem", new JValue(true));
			jMessage.Add("html", new JValue(html));

			Clients.Group(channel.group).addChat(jMessage.ToString());
		}

		public void signalUnmappableConnectionID()
		{
			Clients.Caller.reregisterUser();
		}
		
		public static CChannel ensureChannelCreated(int channelNum)
		{
			if (!channels.ContainsKey(channelNum))
			{
				lock (channelLock)
				{
					if (!channels.ContainsKey(channelNum))
					{
						channels[channelNum] = new CChannel(channelNum);
					}
				}
			}
			return channels[channelNum];
		}
		

	}
}