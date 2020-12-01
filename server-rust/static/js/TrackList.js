


var RageAgain = RageAgain || {};

RageAgain.TrackList = (function () {  
    
    var max = 1000; //the playlist will never grow bigger than this
    var pos = -1;
    var playlist = new Array();
    
    var TrackChangeDirection = {};
    TrackChangeDirection.FORWARD = 1;
    TrackChangeDirection.BACKWARD = -1;
    TrackChangeDirection.NONE = 0;
    
    //Adds track to end of the playlist
    //if the track param is an array then it will loop through and add each track
    var add = function(track) {
        
        if($.isArray(track)) {
            $(track).each(function(index, value) {
                add(value);
            });
            return;
        }
        
        if(playlist.length >= max) {
            playlist.shift(); //remove first item from playlist
            
            if(pos >= 0) pos--;
        }
        
        playlist.push(track);
        
        $.publish('/RageAgain/TrackList/trackListModified');
    }
    
    //Removes track from the playlist
    //returns the removed track or null
    var remove = function(track) {
        var index = playlist.indexOf(track);
        
        if(index != -1) {
            $track = playlist.splice(index, 1);
            
            if(pos > index && pos >= 0)
                pos--;
            
            $.publish('/RageAgain/TrackList/trackListModified');
            
            return $track;
        }
        
        return null;
    }
    
    //Returns the next track or null
    //updatePos: whether to automatically increment the playlist pos
    var next = function(updatePos) {
        if (typeof updatePos == "undefined")
            updatePos = true;
        
        if(!hasNext()) {
            $.publish('/RageAgain/TrackList/trackListFinished');
            return null;
        }
        
        var result = playlist[pos+1];
        
        if(updatePos == true) {
            pos++;
            $.publish('/RageAgain/TrackList/trackChange', [playlist[pos], playlist[pos-1], TrackChangeDirection.FORWARD]); //current, previous, direction
        }
        
        return result;
    }
    
    //Returns the prev track or null
    //updatePos: whether to automatically decrement the playlist pos
    var prev = function(updatePos) {
        if (typeof updatePos == "undefined")
            updatePos = true;
        
        if(!hasPrev())
            return null;
        
        var result = playlist[pos-1];
        
        if(updatePos == true) {
            pos--;
            $.publish('/RageAgain/TrackList/trackChange', [playlist[pos], playlist[pos+1], TrackChangeDirection.BACKWARD]); //current, previous, direction
        }
        
        return result;
        
    }
    
    var hasNext = function() {
        return (pos < playlist.length-1);
    }
    
    var hasPrev = function() {
        return (pos > 0);
    }
    
    var current = function() {
        if(pos < 0) return null;
        return playlist[pos];
    }
    
    var rewind = function() {
        pos = 0;
        
        $.publish('/RageAgain/TrackList/trackChange', [playlist[pos], next(false), TrackChangeDirection.BACKWARD]); //current, previous, direction
        return playlist[pos];
    }
    
    var fastForward = function() {
        pos = playlist.length - 1;
        
        $.publish('/RageAgain/TrackList/trackChange', [playlist[pos], prev(false), TrackChangeDirection.FORWARD]); //current, previous, direction
        return playlist[pos];
    }
    
    var skip = function(newPos) {
        if(typeof newPos == "undefined" || playlist[newPos] == undefined) {
            console.log("Tracklist.skip() Position is not valid. Ignoring...");
            return playlist[pos];
        }
        
        if(pos == newPos) {
            return playlist[pos];
        }
        
        var direction = TrackChangeDirection.NONE;
        var secondaryTrack = null;
        
        if(newPos > pos) {
            direction = TrackChangeDirection.FORWARD;
            secondaryTrack = next(false);
        } else {
            direction = TrackChangeDirection.BACKWARD;
            secondaryTrack = prev(false);
        }
        
        pos = newPos;
        $.publish('/RageAgain/TrackList/trackChange', [playlist[pos], secondaryTrack, direction]); //current, previous, direction
        return playlist[pos];
    }
    
    //Returns the size of the playlist
    var length = function() {
        return playlist.length;
    }
    
    var getPosition = function() {
        return pos;
    }
    
    //Returns how many tracks are yet to be played in the current playlist
    var upcomingLength = function() {
        return (playlist.length - 1) - pos;
    }
    
    //Clears all the next tracks from the playlist
    var clearUpcoming = function() {
        playlist = playlist.slice(0, pos+1);
        $.publish('/RageAgain/TrackList/trackListModified');
    }
    
    //Clear track history
    var clear = function() {
        playlist = new Array();
        pos = -1;
        $.publish('/RageAgain/TrackList/trackListModified');
    }
    
    //Saves playlist history back to server
    var save = function() {
        //@TODO implement save function
        $.publish('/RageAgain/TrackList/trackListSaved');
    }
    
    return {
        TrackChangeDirection: TrackChangeDirection,
        
        add: add,
        remove: remove,
        next: next,
        prev: prev,
        hasNext: hasNext,
        hasPrev: hasPrev,
        skip: skip,
        current: current,
        length: length,
        getPosition: getPosition,
        rewind: rewind,
        fastForward: fastForward,
        upcomingLength: upcomingLength,
        clearUpcoming: clearUpcoming,
        clear: clear,
        save: save
    }
})();