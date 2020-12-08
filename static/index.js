var playerList= [];
    
let userid;
const button = document.getElementById('addplayer');
if (button) {
    button.addEventListener('click', async event => {
        userid =  document.getElementById("playerid").value;
        console.log(userid);
        const data = { userid };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        const response = await fetch('/api', options);
        const json = await response.json();
        console.log(json);
        var playerData = await getPlayerData(json);
        playerList.push(playerData);
        addRow(playerData);
        //$("#footer").load(location.href + " #footer");
        console.log(playerList);    
    });
}

const submit = document.getElementById('submit');
if (submit) {
    submit.addEventListener('click', async event => {
        const data = playerList;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        const response = await fetch('/generate', options);
        const nano_json = await response.json();
        console.log(nano_json);
        var leaderboard_url = window.location.href + "leaderboard/" + nano_json;
        window.location.href = leaderboard_url;
    });
}

function addRow(player) {
    var avatarURL = player.profile.avatar;
    var profileURL = player.profile.profileurl;
    var name = player.profile.personaname;
    var ranktier = player.rank_tier;

    var row = document.createElement("tr");
    row.className = "player";

    var avatarCell = document.createElement("td");
    var nameCell = document.createElement("td");
    var rankCell = document.createElement("td");
    var deleteCell = document.createElement("td");

    var cells = [avatarCell, nameCell, rankCell, deleteCell];

    avatarCell.innerHTML = '<img class="avatar-small" src=' + avatarURL + '>' + '</img>';
    nameCell.innerHTML = '<a target=_blank href=' + profileURL + '>' + name + '</a>';
    rankCell.innerHTML = '<img class="rank-' + ranktier + '-small" src="static/img_trans.gif"></img>';
    deleteCell.innerHTML = '<button>Delete</button>';

    var tbl = document.getElementById('playertable');
    if (tbl.rows.length == 0) {
        var tbl_header = document.createElement("tr");
        tbl_header.innerHTML = '<th>Avatar</th><th>Name</th><th>Rank</th><th>Delete</th>';
        tbl.appendChild(tbl_header);
    }

    cells.forEach(cell => row.appendChild(cell));
    
    document.getElementById('playertable').appendChild(row);

}

$("#playertable").on("click", "button", function(e) {
    e.preventDefault();
    var row_index = $(this).parent().parent().index();
    playerList.splice(row_index-1, 1);
    $(this).parent().parent().remove();
    console.log(playerList);
});

async function getPlayerData(steamid32) {
    api_url = 'https://api.opendota.com/api/players/' + steamid32;
    const response = await fetch(api_url);
    const json = await response.json();
    return json;
}