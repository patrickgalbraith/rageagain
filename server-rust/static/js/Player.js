
var Player = (function () {
    
    var playheadInterval = 0;
    var endSeconds = null;
    var playerReady = false;
    
    var defaultPlaybackQuality = 'hd720'; //default
    
    ///////////////////////////////
    //           EVENTS
    ///////////////////////////////
    
    var onPlayerError = function (event) {
        console.log("OnPlayerError triggered: "+event.data);
        $.publish('/Player/error', [event]);
    }
    
    var onPlayerReady = function (event) {
        playerReady = true;
        $.publish('/Player/ready', [event]);
    }
    
    var onPlayerStateChange = function (event) {
        
        /////// PLAYING ///////
        if (event.data == YT.PlayerState.PLAYING) {
            
            startPlayhead();
            $.publish('/Player/playing', [event]);
            
        /////// ENDED ///////
        } else if(event.data == YT.PlayerState.ENDED) {
            
            stopPlayhead();
            $.publish('/Player/ended', [event]);
            
        /////// PAUSED ///////
        } else if(event.data == YT.PlayerState.PAUSED) {
            
            stopPlayhead();
            $.publish('/Player/paused', [event]);
            
        /////// BUFFERING ///////
        } else if(event.data == YT.PlayerState.BUFFERING) {
            
            stopPlayhead();
            $.publish('/Player/buffering', [event]);
            
        /////// CUED ///////
        } else if(event.data == YT.PlayerState.CUED) {
            
            $.publish('/Player/cued', [event]);
            
        }
    }
    
     ///////////////////////////////
    //          PLAYHEAD
    ///////////////////////////////
    
    var startPlayhead = function () {
        playheadInterval = setInterval(updatePlayhead, 100);
    }
    
    var stopPlayhead = function () {
        clearInterval(playheadInterval);
    }
    
    var updatePlayhead = function (event) {
        
        if(typeof(ytPlayer.getCurrentTime()) == 'undefined') {
            clearInterval(playheadInterval);
            return;
        }
        
        var playerCurrentTime = ytPlayer.getCurrentTime();
        var playerDuration = ytPlayer.getDuration();
        
        if(endSeconds !== null && playerCurrentTime >= endSeconds) {
            endSeconds = null;
            stop();
        }
    }
    
    var seekToPercent = function (event) {
        var time = percent * ytPlayer.getDuration();
        ytPlayer.seekTo(time, true);
    }

    ///////////////////////////////
    //       CORE FUNCTIONS
    ///////////////////////////////
    
    var isReady = function () {
        return playerReady;
    }
    
    var play = function () {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                play();
            });
            return;
        }
        
        ytPlayer.playVideo();
    }
    
    var stop = function () {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                stop();
            });
            return;
        }
        
        ytPlayer.stopVideo();
    }
    
    var pause = function () {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                pause();
            });
            return;
        }
        
        ytPlayer.pauseVideo();
    }
    
    var unPause = function () {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                unPause();
            });
            return;
        }
        
        ytPlayer.playVideo();
    }
    
    var togglePause = function () {
        if(!isReady())
            return;
        
        if(isPaused())
            ytPlayer.playVideo();
        else
            ytPlayer.pauseVideo();
    }
    
    var isPaused = function () {
        if(!isReady())
            return false;
        
        return (getState() == YT.PlayerState.PAUSED);
    }
    
    var isPlaying = function () {
        if(!isReady())
            return false;
        
        return (getState() == YT.PlayerState.PLAYING);
    }
    
    var getState = function () {
        if(!isReady())
            return -1;
        
        return ytPlayer.getPlayerState();
    }
    
    var cueVideoById = function (videoId, startSeconds, suggestedQuality) {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                cueVideoById(videoId, startSeconds, suggestedQuality);
            });
            return;
        }
        
        if(typeof startSeconds === "undefined") {
            startSeconds = 0;
        }
        
        if(typeof suggestedQuality === "undefined") {
            suggestedQuality = defaultPlaybackQuality;
        }
        
        ytPlayer.cueVideoById(videoId, startSeconds, suggestedQuality);
    }
    
    var loadVideoById = function (videoId, startSeconds, suggestedQuality) {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                loadVideoById(videoId, startSeconds, suggestedQuality);
            });
            return;
        }
        
        if(typeof startSeconds === "undefined") {
            startSeconds = 0;
        }
        
        if(typeof suggestedQuality === "undefined") {
            suggestedQuality = defaultPlaybackQuality;
        }
        
        ytPlayer.loadVideoById(videoId, startSeconds, suggestedQuality);
    }
    
    var getCurrentTime = function () {
        if(!isReady())
            return 0;
        
        return ytPlayer.getCurrentTime();
    }
    
    var getDuration = function () {
        if(!isReady())
            return 0;
        
        return ytPlayer.getDuration();
    }
    
    var seekTo = function (seconds, allowSeekAhead) {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                loadVideoById(seconds, allowSeekAhead);
            });
            return;
        }
        
        ytPlayer.seekTo(seconds, allowSeekAhead);
    }
    
    var clearVideo = function () {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                clearVideo();
            });
            return;
        }
        
        ytPlayer.clearVideo();
    }
    
    var mute = function () {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                mute();
            });
            return;
        }
        
        ytPlayer.mute();
    }
    
    var unMute = function () {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                unMute();
            });
            return;
        }
        
        ytPlayer.unMute();
    }
    
    var isMuted = function () {
        if(!isReady())
            return false;
        
        return ytPlayer.isMuted();
    }
    
    var toggleMute = function () {
        if(isMuted())
            unMute();
        else
            mute();
    }
    
    var setVolume = function (volume) {
        if(!isReady()) {
            $.subscribe("/Player/ready", function() {
                setVolume(volume);
            });
            return;
        }
        
        ytPlayer.setVolume(volume);
    }
    
    var getVolume = function () {
        if(!isReady())
            return 100;
        
        return ytPlayer.getVolume();
    }
    
    
    
    return {        
        onPlayerError: onPlayerError,
        onPlayerReady: onPlayerReady,
        onPlayerStateChange: onPlayerStateChange,
        
        play: play,
        stop: stop,
        pause: pause,
        unPause: unPause,
        togglePause: togglePause,
        isPlaying: isPlaying,
        isPaused: isPaused,
        
        isReady: isReady,        
        getState: getState,
        cueVideoById: cueVideoById,
        loadVideoById: loadVideoById,
        getCurrentTime: getCurrentTime,
        getDuration: getDuration,
        seekTo: seekTo,
        clearVideo: clearVideo,
        mute: mute,
        unMute: unMute,
        isMuted: isMuted,
        toggleMute: toggleMute,
        setVolume: setVolume,
        getVolume: getVolume
    }
})();