using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace VotePointLib
{
	/// <summary>
	/// channel contains the information about each user's vote.
	/// </summary>
	public class CChannel
	{
		public readonly int id;
		public readonly string group;

		public bool showVotes;
		//user ID to 
		protected Dictionary<string, int> costVotes = new Dictionary<string, int>();
		protected Dictionary<string, CUser> idToUser = new Dictionary<string, CUser>();

		public CChannel(int id)
		{
			this.id = id;
			this.group = Convert.ToString(id);
		}

		public void removeAllUsers()
		{
			costVotes.Clear();
			idToUser.Clear();
			showVotes = false;
		}

		public void removeUser(string id)
		{
			costVotes.Remove(id);
			idToUser.Remove(id);
		}
		public void addUser(CUser user)
		{
			idToUser[user.id] = user;
		}

		public JObject getChannelState()
		{
			JObject result = new JObject();
            result.Add("channel", new JValue(id));
            result.Add("showVote", new JValue(showVotes));
			double voteTotal = getAverageVote();
			result.Add("averageVote", new JValue(voteTotal));
			result.Add("averageVoteRounded", new JValue(Math.Round(voteTotal)));
			result.Add("cards", getUsers());
			return result;
		}

		public double getAverageVote()
		{
			double voteTotal = 0;
			double voteCount = 0;
			foreach (CUser user in idToUser.Values)
			{
				JObject jUser = user.getJSON();
				int vote = 0;
				if (costVotes.ContainsKey(user.id))
				{
					vote = costVotes[user.id];
				}
				if (vote > 0)
				{
					voteTotal += vote;
					voteCount += 1;
				}
			}
			if (voteCount == 0)
			{
				return 0;
			}
			return voteTotal / voteCount;
		}
		public JArray getUsers()
		{
			JArray result = new JArray();
			foreach (CUser user in idToUser.Values)
			{
				JObject jUser = user.getJSON();
				int vote = 0;
				if (costVotes.ContainsKey(user.id))
				{
					vote = costVotes[user.id];
				}
				bool hasVote = (vote > 0);
				jUser.Add("showVote", new JValue(showVotes));
				jUser.Add("hasVote", new JValue(hasVote));
				jUser.Add("vote", new JValue(vote));
				result.Add(jUser);
			}
			return result;
		}

		public CUser getUser(string id)
		{
			if (!idToUser.ContainsKey(id))
			{
				idToUser[id] = new CUser();
				idToUser[id].id = id;
			}
			return idToUser[id];
		}

		public void resetVotes()
		{
			showVotes = false;
			costVotes.Clear();
		}

		public void setVote(string id, int cost)
		{
			costVotes[id] = cost;
		}
	}
}