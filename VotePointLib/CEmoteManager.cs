using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Drawing;
using System.Text.RegularExpressions;

namespace VotePointLib
{
	public class CEmoteManager
	{
		/// <summary>
		/// need the ending slash
		/// </summary>
		public const string EMOTE_PATH = "/EMOTES/";
		protected static Dictionary<string, CEmoteMapping> EmoteMappings = new Dictionary<string, CEmoteMapping>();

		public static void InitializeEmotes()
		{
			EmoteMappings.Clear();

			string EmotePath = HttpContext.Current.Server.MapPath("~" + EMOTE_PATH);

			DirectoryInfo oDir = new DirectoryInfo(EmotePath);
			foreach (FileInfo oFile in oDir.GetFiles())
			{
				string name = oFile.Name;
				if (name.Contains("."))
				{
					char[] delimiterChars = { '.' };
					name = name.Split(delimiterChars)[0];
				}
				using (Bitmap bmp = new Bitmap(oFile.FullName)){
					AddEmoteMapping(name, EMOTE_PATH + oFile.Name, bmp.Width);
				}
			}

		}

		public static void AddEmoteMapping(string name, string url, int width)
		{
			EmoteMappings[name] = new CEmoteMapping(name, url, width);
		}
		public static string SpliceEmotes(string input)
		{

			string result = input;

			int sanity = 10000;

			foreach (CEmoteMapping oMapping in EmoteMappings.Values)
			{
				while (oMapping.regex.IsMatch(result))
				{
					sanity--;
					if(sanity <= 0)
					{
						break;
					}

					Match oMatch = oMapping.regex.Match(result);
					int index = oMatch.Index;
					int nameLength = oMapping.name.Length;
					while (result.Substring(index, nameLength) != oMapping.name)
					{
						index += 1;
						if (index > result.Length)
						{
							break;
						}
					}
					result = result.Substring(0, index) + oMapping.imgTag + result.Substring(index + nameLength);
				}
			}
			
			return result;
		}


	}
}