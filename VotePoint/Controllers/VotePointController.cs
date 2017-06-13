using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace VotePoint.Controllers
{
    public class VotePointController : Controller
    {
        // GET: VotePoint
        public ActionResult Index()
        {
            return View();
        }
    }
}