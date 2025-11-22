// global variable for songs for playing one by one 
console.log("lets started");
let currentsong=new Audio();
let songs;
let currentSongIndex = 0;




// filter songs name for display
function cleanSongName(href) {
    let name = href.split("/").pop();                    
    name = decodeURIComponent(name);                      
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

    // Add leading zero if needed
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;

    return `${mins}:${secs}`;
}



// getting songs
async function getsongs(folder) {
    cfolder=folder
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
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
// songs songs to play one at a time
const playmsuic= (track,title)=>{
    currentsong.src=track
    currentsong.play()      
    play.src="pause.svg"
    document.querySelector(".songinfo").textContent=title
    document.querySelector(".songtime").innerHTML="00:00/00:00"

}


async function main() {

    songs = await getsongs();
    
    // show FIRST song by default in play bar (do NOT autoplay)
    if (songs.length > 0) {
        currentsong.src = songs[0].url;   // only load
        document.querySelector(".songinfo").innerHTML = songs[0].title;
        document.querySelector(".songtime").innerHTML = "00:00/00:00";
    }

    
// showing songs to playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];

    for (const song of songs) {
        songul.innerHTML += `<li data-file="${song.url}">
                        <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.title}</div>
                                
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div>
                        
        </li>`;
    }
// playing song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{  
            const file = e.dataset.file;
            const title=e.querySelector(".info div").textContent.trim();
            currentSongIndex = songs.findIndex(song => song.url === file);
            console.log("playing:", file);
            playmsuic(file,title);
    
        })

    })
    //   play , next and previous  for song
    play.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src="pause.svg"
        }
        else{
            currentsong.pause()
            play.src="play.svg"
        }
    })
    // listen for time update at seek bar
    currentsong.addEventListener("timeupdate",()=>{
        console.log(currentsong.currentTime,currentsong.duration)
        document.querySelector(".songtime").innerHTML=`${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100 +"%"
    })

    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left= percent +"%"
        currentsong.currentTime=(currentsong.duration)*(percent)/100
    })
    // hamburger event listner
    document.querySelector(".hamburgercontainer").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })
    // to close hamburger on close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-110%"
    })
    // event listner for next and previous buttons
    previous.addEventListener("click",()=>{
       if (songs.length === 0) return; // avoid errors
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; 
    let song = songs[currentSongIndex];
    playmsuic(song.url, song.title);

    })
    forward.addEventListener("click",()=>{
    if (songs.length === 0) return; 
    currentSongIndex = (currentSongIndex + 1) % songs.length; 
    let song = songs[currentSongIndex];
    playmsuic(song.url, song.title);  
    })
    // volume bar
    document.querySelector('.range').addEventListener("input",(e)=>{
        currentsong.volume=e.target.value/100

    })
    

}
main();




