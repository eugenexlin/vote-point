using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace VotePointLib
{
	public class CChatValidator
	{

		public static Regex oScriptRegex = new Regex("<[^>]*script");
		public static bool isTextSafe(string sText)
		{
			if (oScriptRegex.IsMatch(sText))
			{
				return false;
			}

			return true;
		}


	}
}
