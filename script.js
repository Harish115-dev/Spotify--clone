// global variable for songs for playing one by one 
console.log("lets started");
let currentsong = new Audio();
let songs = [];
let currentSongIndex = 0;
let currentFolder = "";

// filter songs name for display
function cleanSongName(href) {
    let name = href.split("/").pop();
    name = decodeURIComponent(name);
    
    if (name.includes("\\")) name = name.split("\\").pop();
    
    name = name.replace(/\.(mp3|m4a|wav|aac)$/i, "");
    name = name.replace(/\b(songs)\b/ig, "");
    name = name.replace(/\\/g, "");
    name = name.replace(/[(){}\[\]]/g, "");
    return name.trim();
}
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;

    return `${mins}:${secs}`;
}

// Fetch album info from info.json
async function getAlbumInfo(folder) {
    try {
        let response = await fetch(`./songs/${folder}/info.json`);
        if (response.ok) {
            let info = await response.json();
            return info;
        }
    } catch (error) {

    }
    

    return {
        title: decodeURIComponent(folder).replace(/%20/g, " "),
        description: "Click to play songs",
        artist: ""
    };
}


async function getAlbumCover(folder) {
    try {
        let coverUrl = `./songs/${folder}/cover.jpg`;
        let response = await fetch(coverUrl, { method: 'HEAD' });
        
        if (response.ok) {
            return coverUrl;
        }
    } catch (error) {
    }
    
    // Return default image if cover doesn't exist
    return "https://d2rd7etdn93tqb.cloudfront.net/wp-content/uploads/2022/03/spotify-playlist-cover-man-with-headphones-sunglasses-032322.jpg";
}

// Get all albums/folders
async function getAlbums() {
    try {
        let response = await fetch(`./songs/`);
        let html = await response.text();
        
        let div = document.createElement("div");
        div.innerHTML = html;
        let links = div.getElementsByTagName("a");
        
        let albums = [];
        
        for (let link of links) {
            let href = link.href;
            
            // Simple check: Does it end with / and contain /songs/?
            if (href.includes("/songs/") && href.endsWith("/")) {
                let folderName = href.split("/songs/")[1].replace("/", "");
                
                // Skip empty and parent directory
                if (folderName && folderName !== "..") {
                    albums.push(folderName);
                }
            }
        }
        
        // Fallback if no folders found
        return albums.length > 0 ? albums : ["NCS","thefatrat","NEFFEX"];
        
        
    } catch (error) {
        return ["NCS","thefatrat","NEFFEX"]; 
    }
}

// Get songs from a specific folder
async function getsongs(folder) {
    
        currentFolder = folder;
        
        let url = folder ? `./songs/${folder}/` : `./songs/`;
        
        let a = await fetch(url);
        let response = await a.text();

        let div = document.createElement("div");
        div.innerHTML = response;

        let as = div.getElementsByTagName("a");
        
        let songs = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];

            if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
                let originalUrl = element.href;
                let title = cleanSongName(element.href);
                songs.push({
                    title: title,
                    url: originalUrl
                });
            }
        }

        return songs;
    } 
        
    


// Play music function
const playmsuic = (track, title) => {
    currentsong.src = track;
    currentsong.play();
    play.src = "img/pause.svg";
    document.querySelector(".songinfo").textContent = title;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

// Display all songs in the playlist/library section
function displaySongs() {
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""; // Clear existing songs


    if (songs.length === 0) {
        songul.innerHTML = '<li style="color: white; padding: 20px;">No songs found</li>';
        return;
    }

    for (const song of songs) {
        songul.innerHTML += `<li data-file="${song.url}">
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.title}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach click event listeners to song items
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const file = e.dataset.file;
            if (!file) return;
            
            const title = e.querySelector(".info div").textContent.trim();
            currentSongIndex = songs.findIndex(song => song.url === file);
            playmsuic(file, title);
        });
    });
}

// UPDATED: Display albums as cards with info.json and cover.jpg support
async function displayAlbums() {
    let albums = await getAlbums();
    let cardContainer = document.querySelector(".cardcontainer");
    
    if (!cardContainer) {
        console.error("Card container not found!");
        return;
    }
    
    cardContainer.innerHTML = ""; 
    

    let rootSongs = await getsongs("");
    
    if (rootSongs.length > 0) {
        cardContainer.innerHTML += `<div class="card" data-folder="">
            <div class="play">
                <img src="img/play.svg" alt="">
            </div>
            <img src="https://d2rd7etdn93tqb.cloudfront.net/wp-content/uploads/2022/03/spotify-playlist-cover-man-with-headphones-sunglasses-032322.jpg" alt="">
            <h3>All Songs</h3>
            <p style="font-size: 12px;">All your music in one place</p>
        </div>`;
    }

    // Create cards for each album with custom info and cover
    for (const album of albums) {
        // Fetch album info from info.json
        let albumInfo = await getAlbumInfo(album);
        
        // Fetch album cover image
        let albumCover = await getAlbumCover(album);
        
        
        cardContainer.innerHTML += `<div class="card" data-folder="${album}">
            <div class="play">
                <img src="img/play.svg" alt="">
            </div>
            <img src="${albumCover}" alt="${albumInfo.title}">
            <h3>${albumInfo.title}</h3>
            <p style="font-size: 12px;">${albumInfo.description}</p>
        </div>`;
    }

    // If no albums and no root songs
    if (albums.length === 0 && rootSongs.length === 0) {
        cardContainer.innerHTML = '<p style="color: white; padding: 20px;">No albums or songs found. Add music to your songs folder!</p>';
        return;
    }

    // Attach click event listeners to all cards
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async (e) => {
            let folder = card.dataset.folder;
            
            songs = await getsongs(folder);
            
            displaySongs();
            
            if (songs.length > 0) {
                 currentSongIndex = 0;
                playmsuic(songs[0].url, songs[0].title);
                
            }
        });
    });
}

async function main() {
    
    // Display albums as cards
    await displayAlbums();

    // Load all songs from root by default
    songs = await getsongs("");
    displaySongs();

    // Show FIRST song by default in play bar (do NOT autoplay)
    if (songs.length > 0) {
        currentsong.src = songs[0].url;
        document.querySelector(".songinfo").innerHTML = songs[0].title;
        document.querySelector(".songtime").innerHTML = "00:00/00:00";
    }

    // Play/pause button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    // Time update for seek bar
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Seek bar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * (percent) / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburgercontainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Previous button
    previous.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        let song = songs[currentSongIndex];
        playmsuic(song.url, song.title);
    });

    // Next button
    forward.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        let song = songs[currentSongIndex];
        playmsuic(song.url, song.title);
    });

    // Volume control
const volumeInput = document.querySelector('.range input');

if (volumeInput) {
    volumeInput.addEventListener("input", (e) => {
        const vol = e.target.value;

        currentsong.volume = vol / 100;

        const volImg = document.querySelector(".volume>img");

        // Change icon depending on volume
        if (vol == 0) {
            volImg.src = "img/mute.svg";
        } else {
            volImg.src = "img/volume.svg";
        }
    });
}

    // to mute  the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = .10;

        }
    })
    document.querySelector(".bar").addEventListener("click",e=>{
        if(e.target.classList.contains("bar")){
            document.querySelector(".left").style.left = "0";
        }
    })

    
}

main();