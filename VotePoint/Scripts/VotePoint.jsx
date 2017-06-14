//Section 

var votePointHub = $.connection.votePointHub;

votePointHub.client.alert = function (message) {
    alert(message);
};
votePointHub.client.setChannelState = function (channel) {
    let jChannel = JSON.parse(channel)
    VoteApp.setChannel(jChannel);
};
votePointHub.client.updateIcon = function (id, hash) {
    if (id == votePointUserID) {
        return;
    }
    VoteApp.updateIcon(id, hash);
}
votePointHub.client.updateName = function (id, name) {
    VoteApp.updateName(id, name);
}
votePointHub.client.hasVote = function (id) {
    VoteApp.setVote(id);
}
votePointHub.client.undoVote = function (id) {
    VoteApp.undoVote(id);
}

votePointHub.client.removeUser = function (id, hash) {
    if (id == votePointUserID) {
        return;
    }
    VoteApp.updateIcon(id, hash);
}



var COOKIE_SAVED_CHANNEL = "vote_point_saved_channel"

var votePointSavedChannel = getCookie(COOKIE_SAVED_CHANNEL);
if (votePointSavedChannel === undefined) {
    votePointSavedChannel = 1;
    votePointSaveSavedChannel(votePointSavedChannel);
}
function votePointSaveSavedChannel(channel) {
    votePointSavedChannel = channel
    setCookie(COOKIE_SAVED_CHANNEL, channel);
}


votePointHub.client.reregisterUser = function () {
    registerSelf(votePointSavedChannel)
}

//enable logging
$.connection.hub.logging = false;
$.connection.hub.start().done(function () {
    registerSelf(votePointSavedChannel);
});


function registerSelf(channel) {
    $("#spanChannelNum").text(channel);
    votePointSaveSavedChannel(channel);
    votePointHub.server.registerUser(votePointUserID, votePointUserName, votePointUserIconHash, channel);
    setTimeout(function () {
        try {
            VoteChatFeed.addSystemMessage("You joined <span style='font-weight:bold;'>Channel " + channel + "</span>");
        } catch (ex){
        }
    },100)
}
function castVote(points) {
    votePointHub.server.castVote(points);
}
function removeVote() {
    votePointHub.server.castVote(0);
}
function showAllVotes() {
    votePointHub.server.showAllVotes(votePointUserID);
}
function resetVotes() {
    votePointHub.server.resetVotes(votePointUserID);
}
function resetChannel() {
    votePointHub.server.resetChannelUsers();
}

function addRandomUser() {
    let user = new Object();
    user.userId = generateUUID();
    user.name = "User";
    user.hash = getHex512();
    VoteApp.addUser(user)

    jdenticon();
}

function getRandomDarkishColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 8) + 4];
    }
    return color;
}
function getRandomHSLColor() {
    var h = Math.floor(Math.random() * 360);
    var sLev = ["30%", "50%", "70%"];
    var s = sLev[Math.floor(Math.random() * 3)];
    var lLev = ["40%", "60%"];
    var l = lLev[Math.floor(Math.random() * 3)];
    var outArr = [];
    outArr.push("hsl(");
    outArr.push(h);
    outArr.push(",");
    outArr.push(s);
    outArr.push(",");
    outArr.push(l);
    outArr.push(")");
    return outArr.join("");
}

function toggleChannelDisplay() {
    hideNavBarIfMobileMode();
    $("#channel-selector").slideToggle(100);
}


function toggleScreenMode() {
    hideNavBarIfMobileMode();
    VotePointFullView = !VotePointFullView;
    setScreenMode();
}

function setScreenMode() {
    VoteApp.toggleScreenMode(VotePointFullView);
}

var VotePointFullView = true;
if (typeof window.mobilecheck == 'function' && window.mobilecheck()) {
    VotePointFullView = false;
}

const UserCardList = function (props) {
    if (!props.fullView) {
        for (let i = 0; i < props.cards.length; i++) {
            let card = props.cards[i];
            if (card.userId == votePointUserID) {
                return (<UserCard {...card} />);
            }
        }
    }
    return (
        <div >
            {props.cards.map(card => <UserCard {...card} />)}
        </div>
    );
}
const UserCard = function (props) {
    let addClass = '';
    if (props.userId == votePointUserID) {
        addClass += ' current-user ';
    }
    let activity = 'Active';
    let millis = (new Date()).getTime() - new Date(props.lastActivity).getTime();
    if (millis > 30000) {
        activity = moment.duration(millis).humanize() + " ago";
    }
    return (
        <div className={'user-card subtle-border' + addClass }>
            <input className='hdnId' type="hidden" value={props.userId} />
            <table>
                <tbody>
                    <tr>
                        <td>
                            <div className='svg-holder'>
                            <svg width="100%" height="100%" data-jdenticon-hash={props.hash } data-user-id={props.userId}>
                                No SVG Support
                            </svg>
                            </div>
                        </td>
                        <td>
                            <div className='name-holder'>
                               <div className='div-user-name'>
                                   {props.name}
                               </div>
                               <div className='div-user-activity'>
                                    {activity}
                               </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <Ballot {...props}></Ballot>
        </div>
    );
}

const Ballot = function (props) {
    let ballotStyle = {
        display: "none"
    }
    if (props.hasVote) {
        ballotStyle.display = "block";
    }
    let ballotClass = (props.showVote ? " shown-ballot " : "");
    let ballotHtml = (props.showVote ? props.vote : "");

    let clickFunction = null;
    if (props.userId == votePointUserID) {
        clickFunction = removeVote
    }

    return (
        <div className={"ballot-container " + ballotClass}>
            <div className='ballot-dotted no-select'>Please Vote</div>
            <div className='ballot' style={ballotStyle} onClick={clickFunction}>
                <div className='ballot-text'>
                    {ballotHtml}
                </div>
            </div>
        </div>
    );
}

class ChannelSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            channel: votePointSavedChannel,
            channelCount: props.count
        };
        this.changeChannel = this.changeChannel.bind(this)
    }
    
    changeChannel(value) {
        this.setState({
            channel: value
        });
        registerSelf(value);
    }

    render() {
        let channels = [];
        for (let i = 1; i <= this.state.channelCount; i++) {
            channels.push(i);
        }
        return (
            <div id='channel-selector' style={{ display: "none" }} >
                <div className='channel channel-label'>Channel: </div>
                {
                    channels.map(function (channel) {
                        let addClass = '';
                        if (this.state.channel == channel) {
                            addClass += ' selected-channel ';
                        }
                        return <ChannelButton className={addClass} channel={channel} passInFunction={this.changeChannel }  />
                    },this)
                }
                <div className='channel channel-cap'>&nbsp;</div>
            </div>
        );
    }
}
class ChannelButton extends React.Component {
    constructor(props) {
        super(props);
        this.channel = props.channel;
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        this.props.passInFunction(this.channel);
    }
    render(){
        return (
            <button className={'channel button ' + this.props.className} onClick={this.handleClick}>{this.channel}</button>
        );
    }
}

const FinalVote = function (props) {

    let finalStyle = {
        display: "none"
    };
    if (props.showVote == true) {
        finalStyle.display = "block";
    }
    let main = props.averageVoteRounded.toString().substring(0, 8);
    let sub = props.averageVote.toString().substring(0, 8);
    if (props.averageVote == 0) {
        main = "0";
        sub = "No Vote"
    }

    return (
        <div className="vote-result subtle-border" style={finalStyle}>
            <div className="main-number">{props.averageVoteRounded}</div>
            <div className="sub-number">{sub}</div>
        </div>
    );
}

class ActionButton extends React.Component {

    constructor(props) {
        super(props);
        this.tempRed = null;
        this.state = {
            fullView: props.fullView,
            showVote: false,
            prevVote: false,
            prevTime: new Date(0)
        };
        this.handleClick = this.handleClick.bind(this);
    }

    setShow(showVote) {
        this.setState({
            showVote: showVote
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            fullView: nextProps.fullView,
        })
    }

    handleClick() {

        var t = new Date();
        t.setSeconds(t.getSeconds() - 2);
        if (t < this.state.prevTime) {
            return;
        }   

        if (!this.state.showVote) {
            showAllVotes();
        } else {
            resetVotes();
        }
    }
    
    render() {
        if (!this.state.fullView) {
            return(<div></div>);
        }

        let inner = null;
        if (this.state.showVote) {
            inner = (<div className="restart"></div>);
        } else {
            inner = (<div className="show"></div>);
        }

        if (this.state.showVote != this.state.prevVote) {
            this.state.prevVote = this.state.showVote;
            this.state.prevTime = new Date();
            $(".div-show-vote").removeClass("generic-clickable");
            $(".div-show-vote").addClass("disabled-button");
            setTimeout(function () {
                $(".div-show-vote").removeClass("disabled-button");
                $(".div-show-vote").addClass("generic-clickable");
            }, 2000);
        }

        return (
            <div className="div-show-vote generic-clickable round-screen-button" onClick={this.handleClick} >
                {inner}
            </div>
        );
    }
}

class ChannelStats extends React.Component {

    constructor(props) {
        super(props);
        this.state = props;

    }

    componentWillReceiveProps(props) {
        this.setState(props)
    }

    setStats(props) {
        this.setState(props)
    }

    render() {
        let voteText = "votes set";
        if (this.state.votes == 1) {
            voteText = "vote set"
        }
        let userText = "connected users";
        if (this.state.users == 1) {
            userText = "connected user"
        }

        return(
            <div className="channel-background-display no-select">
                <div className="channel-stats">
                    <div>
                        {this.state.votes} {voteText}
                    </div>
                    <div>
                        {this.state.users} {userText}
                    </div>
                </div>
                <div className="channel-display">
                    Channel {this.state.channel}
                </div>

            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showVote: false,
            fullView: VotePointFullView,
            channel: votePointSavedChannel,
            averageVote: 1,
            averageVoteRounded: 1,
            cards: [
                {
                    userId: votePointUserID,
                    name: votePointUserName,
                    hash: votePointUserIconHash,
                    lastActivity: new Date(),
                    hasVote: false,
                }
            ],
            colorMap : {}
        };
    }

    setChannel(jChannel) {
        this.setState(jChannel);
        this.actionButton.setShow(this.state.showVote);
        setTimeout(jdenticon, 0);
    }

    //no update state because icon is not important
    updateIcon(id, hash) {
        $(votePointReact).find(".hdnId[value='" + id + "']").closest("div").find("svg").each(function () {
            $(this).attr('data-jdenticon-hash', hash);
            try {
                jdenticon.update(this);
            } catch (ex) {
            }
        });
    }
    updateName(id, name) {
        $(votePointReact).find(".hdnId[value='" + id + "']").closest("div").find(".div-user-name").each(function () {
            $(this).text(name);
        });
    }

    setVote(id) {
        let card = this.getUserByID(id);
        card.hasVote = true;
        $(votePointReact).find(".hdnId[value='" + id + "']").closest("div").find(".ballot").each(function () {
            var ballot = this;
            $(ballot).removeClass("set-card-animation");
            $(ballot).hide();
            setTimeout(function () {
                $(ballot).show();
                $(ballot).addClass("set-card-animation");
            }, 1);
        });
        this.renderChannelStats()
    }
    undoVote(id) {
        let card = this.getUserByID(id);
        card.hasVote = false;
        $(votePointReact).find(".hdnId[value='" + id + "']").closest("div").find(".ballot").each(function () {
            var ballot = this;
            $(ballot).removeClass("set-card-animation");
            $(ballot).fadeOut(100);
        });
        this.renderChannelStats()
    }

    addUser(jCard) {
        this.setState(prevState => ({
            cards: prevState.cards.concat(jCard)
        }));
    }

    getUserByID(id) {
        for (let i = 0; i < this.state.cards.length; i++) {
            let card = this.state.cards[i];
            if (card.userId == id) {
                return card;
            }
        }
        return null;
    }

    getUserColor(id) {
        if (!this.state.colorMap[id]) {
            this.state.colorMap[id] = getRandomHSLColor();
        }
        return this.state.colorMap[id];
    }

    toggleScreenMode(fullView) {
        this.setState({
            fullView: fullView
        })
        jdenticon();
    }

    getChannelStats() {
        let userCount = 0;
        let voteCount = 0;
        for (let i = 0; i < this.state.cards.length; i++) {
            let card = this.state.cards[i];
            if (card.hasVote) {
                voteCount += 1;
            }
            userCount += 1;
        }
        var stats = new Object();
        stats.votes = voteCount;
        stats.users = userCount;
        stats.channel = this.state.channel;
        return stats;
    }

    renderChannelStats() {
        this.channelStats.setStats(this.getChannelStats());
    }

    render() {
        let stats = this.getChannelStats();
        return (        
            <div className="vote-app" >
                <ChannelSelector count={64} />
                <UserCardList fullView={this.state.fullView}
                              cards={this.state.cards} />
                <FinalVote fullView={this.state.fullView}
                           showVote={this.state.showVote}
                           averageVote={this.state.averageVote}
                           averageVoteRounded={this.state.averageVoteRounded} />
                <ActionButton ref={instance => { this.actionButton = instance; }} 
                              showVote={this.state.showVote}
                              fullView={this.state.fullView}></ActionButton>
                <ChannelStats ref={instance => { this.channelStats = instance; }}
                                {...stats}/>
            </div>
      );
    }
}

var VoteApp = ReactDOM.render(<App />, document.getElementById("votePointReact"));


jdenticon();


function openNumPad() {
    $("#inputCost").click();
}

var CostPointNumPad;

$(document).ready(function () {
    $("#inputCost").numpad();

    $("#inputCost").on("change", function () {
        var cost = $("#inputCost").val();
        castVote(cost);
        if (typeof window.mobilecheck == 'function' && !window.mobilecheck()) {
            $("#chat-textarea").focus();
        }
    })

    $(".navbar").find("ul:first").append(
        "<li><a href='javascript:toggleChannelDisplay();'>Channel</a></li>")

    $(".navbar").find("ul:first").append(
        "<li><a href='javascript:resetChannel();'>Reset Users</a></li>")

    $(".navbar").find("ul:first").prepend(
        "<li><a href='javascript:toggleScreenMode();'>Toggle View</a></li>")

    $(document).keydown(function (e) {
        //ENTER
        if (e.keyCode == 13) {
            e.preventDefault();
            e.stopPropagation();
            openNumPad();
        }
        // ESC
        if (e.keyCode == 27) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof hideNameChange === "function")
            {
                hideNameChange();
            }
            if (typeof hideSampleIcons === "function")
            {
                hideSampleIcons();
            }
            $(".nmpd-wrapper").find(".cancel").click();
            if (typeof window.mobilecheck == 'function' && !window.mobilecheck()) {
                $("#chat-textarea").focus();
            }
        }
    })
});
