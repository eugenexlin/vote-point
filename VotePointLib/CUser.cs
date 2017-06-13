using System;
using Newtonsoft.Json.Linq;

namespace VotePointLib
{
	public class CUser
	{
		public string id;
		public string iconHash;
		public string name;
		public DateTime lastActivity = DateTime.Now;

		public JObject getJSON()
		{
			JObject result = new JObject();
			result.Add("userId", new JValue(id));
			result.Add("name", new JValue(name));
			result.Add("hash", new JValue(iconHash));
			result.Add("lastActivity", new JValue(lastActivity));
			return result;
		}
	}
}