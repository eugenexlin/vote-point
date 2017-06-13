var COOKIE_USER_ID = "vote_point_user_id"
var COOKIE_USER_NAME = "vote_point_user_name"
var COOKIE_USER_ICON_HASH = "vote_point_user_icon_hash"

var votePointUserID = getCookie(COOKIE_USER_ID);
if (votePointUserID === undefined) {
    votePointUserID = generateUUID();
    setCookie(COOKIE_USER_ID, votePointUserID);
}
var votePointUserName = getCookie(COOKIE_USER_NAME);
if (votePointUserName === undefined) {
    votePointUserName = "Anonymous" 
}
var votePointUserIconHash = getCookie(COOKIE_USER_ICON_HASH);
if (votePointUserIconHash === undefined) {
    votePointUserIconHash = getHex512()
    votePointSaveUserIconHash(votePointUserIconHash);
}

function votePointSaveUserName(name) {
    votePointUserName = name
    setCookie(COOKIE_USER_NAME, name);
}
function votePointSaveUserIconHash(hash) {
    votePointUserIconHash = hash
    setCookie(COOKIE_USER_ICON_HASH, hash);
}

function votePointChangeIcon(hash) {
    votePointSaveUserIconHash(hash);

    $("svg").each(function () {
        var userId = $(this).attr('data-user-id');
        if (typeof userId === typeof undefined || userId === false) {
            return true;
        }
        if (userId === votePointUserID) {
            $(this).attr('data-jdenticon-hash', hash);
            try {
                jdenticon.update(this);
            } catch (ex) {
                //do nothing..
            }
            votePointHub.server.updateIconHash(hash)
        }
    })
}

$(window).on("beforeunload", function () {
    votePointHub.server.exitVotePoint();
});

$(document).click(function (e) {
    var target = e.target; //target div recorded
    if ($(target).closest('.icon-select-container').length <= 0) {
        hideSampleIcons();
    }
    if ($(target).closest('.name-input-container').length <= 0) {
        hideNameChange();
    }
    $(".qr-code-container").hide();
    
});

$(".icon-select-container").click(function (e) {
    let target = e.target; //target div recorded
    if ($(target).closest('.icon-select-container').length <= 0) {
        $(".icon-select-container").hide(); //if the click element is not the above id will hide
    } else {
        let clickedIcon = $(target).closest('svg');
        if (clickedIcon.length) {
            var hash = $(clickedIcon).attr("data-jdenticon-hash");
            votePointChangeIcon(hash);
        }
    }
})
function hideNavBarIfMobileMode() {
    if ($('.navbar-collapse').find("li:first").css("float") != "left") {
        $('.navbar-collapse').collapse('hide');
    }
}

function showSampleIcons() {
    hideNavBarIfMobileMode();
    $(".icon-select-container").show();
    
    let hashes = [];
    for(let i = 0; i < 64; i++){
        hashes.push(getHex512());
    }
    ReactDOM.render(<IconList hashes={hashes } />, document.getElementById("icon-select-icons"));

    $("#icon-select-icons").find("svg").each(function () {
        try{
            jdenticon.update(this);
        } catch (ex) {
            //do nothing..
        }
    })
}
function hideSampleIcons() {
    $("#icon-select-icons").html("");
    $(".icon-select-container").hide();
}

function showNameChange() {
    hideNavBarIfMobileMode();
    $(".name-input-container").show();
    $("#nameInput").val(votePointUserName);
    $("#nameInput").focus();
    $("#nameInput").select();
}
function hideNameChange() {
    $("#nameInput").blur();
    $(".name-input-container").hide();
}
$("#nameInput").keydown(function (e) {
    if (e.keyCode == 13) {
        submitNameChange();
    }
});
$("#btnNameInput").click(function (e) {
    submitNameChange();
});
function submitNameChange() {
    let sName = $("#nameInput").val();
    if (sName == "") {
        sName = "Anonymous"
    }
    if (sName.length > 100) {
        sName = sName.substring(0, 100);
    }

    votePointSaveUserName(sName)
    votePointHub.server.updateUserName(votePointUserName)
    hideNameChange()
}

function fetchQRCode() {
    hideNavBarIfMobileMode();
    $(".qr-code-container").show();
    var qrImg = document.getElementById('qr-canvas');
    qrImg.src = "";
    let url = "https://api.qrserver.com/v1/create-qr-code/?data=";
    let thisPage = window.location.href;
    thisPage = thisPage.replace("http://", "").replace(/\/$/, "");
    url += thisPage;
    let img = new Image();
    img.onload = function () {
        showQRCode(img);
    };
    img.src = url;
}

function showQRCode(img) {
    var qrImg = document.getElementById('qr-canvas');
    qrImg.src = img.src;
}
const Icon = function (props) {
    let size = (props.size ? props.size : 64);
    return (
    <div className='icon-select-icon'>
        <svg width={size} height={size} data-jdenticon-hash={props.hash} data-user-id={props.userId }>
            No SVG Support
        </svg>
    </div>
    );
}
const IconList = function (props) {
    return (
        <div>
            <div>
                <table style={{marginLeft:"auto", marginRight: 0}}>
                <tbody>
                <tr>
                    <td style={{verticalAlign:"top"}}>
                        <div style={{marginRight: '1em', fontSize: '1.2em'}}>                           
                            Current:
                        </div>
                    </td>
                    <td>
                        <Icon hash={votePointUserIconHash} userId={votePointUserID} size='128' />
                    </td>
                </tr>
                </tbody>
                </table>
            </div>
            <div>
                {props.hashes.map(hash => <Icon hash={hash } userId='' />)}
            </div>
        </div>
    );
}
