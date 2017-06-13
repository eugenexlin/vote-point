
votePointHub.client.addChat = function (sMessage) {
    let jMsg = JSON.parse(sMessage)
    VoteChatFeed.appendMessage(jMsg);
}

function sendChatMessage() {
    let jText = $("#chat-textarea");
    let text = jText.val();
    jText.val("");
    if (text != "") {
        votePointHub.server.sendChatMessage(text);
    }
}


function toggleChatDisplay() {
    hideNavBarIfMobileMode();
    VotePointChatVisible = !VotePointChatVisible;
    VoteChatFeed.toggleScreenMode(VotePointChatVisible);
}
var VotePointChatVisible = true;
if (typeof window.mobilecheck == 'function' && window.mobilecheck()) {
    VotePointChatVisible = false;
}

const ChatMessage = function (props) {
    //last check for no script tag
    if ((/<[^>]*script/).test(props.html)) {
        return (<div></div>);
    }

    let msgClass = "";
    let userName = "";
    let userNameStyle = {};
    let colonStyle = { display: "none"};
    let chatHTML;
        if (props.isSystem) {
            msgClass = "system"
        } else {
            //try set message sayer
            if (props.id == votePointUserID) {
                userName = votePointUserName
                userNameStyle.color = VoteApp.getUserColor(votePointUserID);
            } else {
                try {
                    userName = VoteApp.getUserByID(props.id).name;
                    userNameStyle.color = VoteApp.getUserColor(props.id);
                } catch (ex) {
                }
                if (userName == "") {
                    userName = "UNKNOWN"
                    userNameClass = "unknown"
                }
            }
            colonStyle.display = "inline"
        }
        if (props.isDeleted) {
            msgClass = "deleted"
            chatHTML = { __html: "&lt;message deleted&gt;" };
        } else {
            chatHTML = { __html: props.html };
        }

    return (
        <div className={"chat-message " + msgClass}>        
            <div className="chat-user-name" style={userNameStyle}>{userName}</div>

            <div style={colonStyle}>:&nbsp;</div>
            
            <div className="chat-html" dangerouslySetInnerHTML={chatHTML} ></div>
        </div>
    );
}

class ChatFeed extends React.Component {
    //you are to insert messages in front of array.
    constructor(props) {
        super(props);
        this.state = {
            fullView: VotePointChatVisible,
            messages: [
                {
                    id: null,
                    isDeleted: false,
                    isSystem: true,
                    html : ""
                },
                {
                    id: null,
                    isDeleted: false,
                    isSystem: true,
                    html: "Welcome To Vote Point Chat"
                }
            ]
        };
    }

    showRules(arrRules) {
        let msgHTML = [];
        msgHTML.push("Rules:<br/>");
        msgHTML.push("<ul>");
        for (let i = 0; i < arrRules.length; i++) {
            msgHTML.push("<li>");
            msgHTML.push(arrRules[i]);
            msgHTML.push("</li>");
        }
        msgHTML.push("</ul>");
        this.addSystemMessage(msgHTML.join(""));
    }

    addSystemMessage(html) {
        let jMsg = new Object();
        jMsg.isSystem = true;
        jMsg.html = html;
        this.appendMessage(jMsg);
    }

    appendMessage(jMsg) {
        let lockBottom = false;
        let chat = $('#chat-messages');
        if ((chat.scrollTop() + chat.outerHeight()) >= (chat[0].scrollHeight - 5)) {
            lockBottom = true;
        }

        this.state.messages.push(jMsg);
        while (this.state.messages.length > 300) {
            this.state.messages.shift();
        }
        this.forceUpdate();
        if (lockBottom) {
            setTimeout(function () {
                let chat = $('#chat-messages');
                chat.scrollTop(chat[0].scrollHeight);
            },100);
        }
    }

    toggleScreenMode(fullView) {
        this.setState({
            fullView: fullView
        })
    }

    render() {
        let chatStyle = { display: "none" };
        if (this.state.fullView) {
            chatStyle.display = "block";
        }

        return (
            <div className="chat-feed subtle-border" style={chatStyle} >
                <div id="chat-messages">
                    {this.state.messages.map(message => <ChatMessage {...message} />)}
                </div>
                <table className="chat-input-table">
                  <tbody>
                        <tr>
                            <td style={{ width: "100%" }}>
                                <textarea id="chat-textarea" placeholder='Send a Message' className='box-sizing-border' >

                                </textarea>
                            </td>
                            <td style={{verticalAlign: "top"}}>
                                <div id="chat-submit" >▶</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

}

    var VoteChatFeed = ReactDOM.render(<ChatFeed />, document.getElementById("voteChatFeed"));


    setTimeout(function () {
        let arrRules = [];

        arrRules.push("No Harassment");
        arrRules.push("No Memes");

        VoteChatFeed.showRules(arrRules);
    }, 1)

    $(document).ready(function () {

        $(".navbar").find("ul:first").append(
            "<li><a href='javascript:toggleChatDisplay();'>Chat</a></li>")

        $("#chat-messages").niceScroll({
            cursorcolor: "#8ac", // change cursor color in hex
            cursoropacitymin: 0.1, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
            cursoropacitymax: 0.8, // change opacity when cursor is active (scrollabar "visible" state), range from 1 to 0
            cursorwidth: "5px", // cursor width in pixel (you can also write "5px")
            cursorborder: "none;", // css definition for cursor border
            cursorborderradius: "5px", // border radius in pixel for cursor
            horizrailenabled:false,
            zindex: "auto"
        });

        $("#chat-textarea").keydown(function (e) {
            let shifted = e.shiftKey
            if (e.keyCode == 13) {
                if (shifted) {

                } else {
                    if ($("#chat-textarea").val() == "") {
                        e.preventDefault();
                        e.stopPropagation();
                        openNumPad();
                        return;
                    } else {
                        e.preventDefault();
                        e.stopPropagation();
                        sendChatMessage();
                        return;
                    }
                }
            }
            if (e.keyCode == 27) {
                e.preventDefault();
                $("#chat-textarea").val("");
                return;
            }
            e.stopPropagation();
        });

        $("#chat-submit").click(function (e) {
            e.stopPropagation();
            sendChatMessage();
        });
    });

