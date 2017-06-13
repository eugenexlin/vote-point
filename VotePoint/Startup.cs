using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Owin;
using React.AspNet;
using Microsoft.AspNetCore.Builder;
using Microsoft.Owin;

[assembly: OwinStartup(typeof(VotePoint.Startup))]
namespace VotePoint
{
	public class Startup
	{
		public void ConfigureServices(IServiceCollection services)
		{
			// Add framework services.
			services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
			services.AddReact();


		}
		public void Configuration(IAppBuilder owinapp)
		{
			owinapp.MapSignalR();
		}

	}
}