using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace VotePointLib
{
	public class CEmoteMapping
	{
		public string name { get; }
		public string imgTag { get; }
		public Regex regex { get; }

		public CEmoteMapping(string pName, string url, int width)
		{
			name = pName;
			imgTag = GenerateImgTag(name, url, width);
			string sRegex = @"(^|\s+)" + name + @"(\s+|$)";
			Regex oRegex = new Regex(sRegex);
			regex = oRegex;
		}
		
		public static string GenerateImgTag(string name, string url, int width)
		{

			StringBuilder sResult = new StringBuilder();
			sResult.Append(String.Format("<span class='emoticon-holder' style='height:1px; width:{0}px;'>", width));
			
			sResult.Append(String.Format("<img class='emoticon' src='{0}' />", url));
			sResult.Append(String.Format("<span class='emoticon-text'>{0}</span>", name));

			sResult.Append("</span>");
			return sResult.ToString();
		}

	}
}
