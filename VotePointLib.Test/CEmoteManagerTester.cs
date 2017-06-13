using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using VotePointLib;
using System.Text.RegularExpressions;

namespace VotePointLib.Test
{
	[TestClass]
	public class CEmoteManagerTester
	{

		[TestMethod]
		public void TestReplaceEmote()
		{
			CEmoteManager.AddEmoteMapping("Kappa", "lel/Kappa.png", 1);

			string result;

			result = CEmoteManager.SpliceEmotes("Kappa");
			Assert.AreNotEqual("Kappa", result);
			Assert.IsTrue(result.Contains("img"));


			result = CEmoteManager.SpliceEmotes("kappa");
			Assert.AreEqual("kappa", result);

			result = CEmoteManager.SpliceEmotes("Kappa = Gray Face (no space)");
			Assert.IsTrue(result.Contains("Gray Face (no space)"));
			Assert.IsTrue(result.Contains("img"));
		}

		[TestMethod]
		public void TestNoDoubleEmote()
		{
			CEmoteManager.AddEmoteMapping("Kappa", "lel/Kappa.png", 1);

			string result;

			string[] delimiter = { "img" };

			result = CEmoteManager.SpliceEmotes("test Kappa test");
			result = CEmoteManager.SpliceEmotes(result);

			Assert.AreEqual(2 , result.Split(delimiter, StringSplitOptions.None).Length);
		}
		[TestMethod]
		public void TestRegex()
		{
			Regex oRegex;
			oRegex = new Regex("test");
			Assert.IsTrue(oRegex.IsMatch("test"));
			Assert.IsFalse(oRegex.IsMatch("toast"));

			oRegex = new Regex(@"test(\s+|$)");
			Assert.IsFalse(oRegex.IsMatch("toast"));
			Assert.IsTrue(oRegex.IsMatch("test  "));
			Assert.IsTrue(oRegex.IsMatch("test"));
			Assert.IsTrue(oRegex.IsMatch("  test\t"));

			oRegex = new Regex(@"(^|\s+)test(\s+|$)");
			Assert.IsTrue(oRegex.IsMatch("test"));
			Assert.IsTrue(oRegex.IsMatch(" asdf test sdf"));
			Assert.IsFalse(oRegex.IsMatch(" atest"));
		}
	}
}
