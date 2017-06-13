using React;

[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(VotePoint.ReactConfig), "Configure")]

namespace VotePoint
{
	public static class ReactConfig
	{
		public static void Configure()
		{
			//System.IO.File.WriteAllText("c:/temp/react.txt","a");
			// If you want to use server-side rendering of React components, 
			// add all the necessary JavaScript files here. This includes 
			// your components as well as all of their dependencies.
			// See http://reactjs.net/ for more information. Example:
			//ReactSiteConfiguration.Configuration.AddScript("~/Scripts/UserSettings.jsx");
			//ReactSiteConfiguration.Configuration.AddScript("~/Scripts/VotePoint.jsx");

			// If you use an external build too (for example, Babel, Webpack,
			// Browserify or Gulp), you can improve performance by disabling 
			// ReactJS.NET's version of Babel and loading the pre-transpiled 
			// scripts. Example:
			//ReactSiteConfiguration.Configuration
			//	.SetLoadBabel(false)
			//	.AddScriptWithoutTransform("~/Scripts/bundle.server.js")
		}
	}
}