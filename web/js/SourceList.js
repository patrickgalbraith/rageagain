
var RageAgain = RageAgain || {};

RageAgain.SourceList = (function () {  
    
    var pos = -1;
    var sourcelist = new Array();
    var ytRequestUrl = 'http://gdata.youtube.com/feeds/api/videos/-/'+encodeURIComponent('{http://gdata.youtube.com/schemas/2007/categories.cat}')+'Music';
    
    var add = function (videoInfo) {
        var el = $('#alt-sources a')[sourcelist.length];
        var newItem = new RageAgain.SourceList.Source(sourcelist.length, videoInfo, el);
        sourcelist.push(newItem);
    }
    
    var next = function() {
        if(!hasNext())
            return null;
        
        pos++;
        $.publish('/RageAgain/SourceList/sourceChange');
        return sourcelist[pos];
    }
    
    var prev = function() {
        if(!hasPrev())
            return null;
        
        pos--;
        $.publish('/RageAgain/SourceList/sourceChange');
        return sourcelist[pos];
    }
    
    var hasNext = function() {
        return (pos < sourcelist.length-1);
    }
    
    var hasPrev = function() {
        return (pos > 0);
    }
    
    var seek = function ($pos) {
        if($pos < 0 || $pos > sourcelist.length) return;
        
        pos = $pos;
        
        $.publish('/RageAgain/SourceList/sourceChange');
    }
    
    var indexOf = function (sourceListItem) {
        return sourcelist.indexOf(sourceListItem);
    }
    
    var current = function () {
        if(pos < 0) return null;
        return sourcelist[pos];
    }
    
    var clear = function () {
        
        $(sourcelist).each(function(index, sourceListItem){
            sourceListItem.destroy();
        });
        
        pos = -1;
        sourcelist = new Array();
        
        $.publish('/RageAgain/SourceList/sourceListCleared');
    }
    
    //sets the current source as invalid/error
    var setCurrentError = function () {
        if(pos < 0) return;
        
        sourcelist[pos].onError();
    }
    
    //load new sources from Youtube
    var load = function (track) { 
        clear();
        
        $.publish('/RageAgain/SourceList/loadBegin');
        
        request_data = {};
        
        if(track.id) {
            request_data.track_id = track.id;
        } else {
            request_data.track_artist = track.artist;
            request_data.track_name = track.track;
            request_data.track_label = track.label;
        }
        
        $.ajax({
            url: '/youtube/get_sources.json',
            dataType: "json",
            data: request_data,
            success: function(data) {
                
                if(typeof(data.error) !== "undefined") {
                    
                    console.log("RageAgain.SourceList: loadError: Returned result error. "+data.error);
                    
                    $.publish('/RageAgain/SourceList/loadError');
                    //return load_backup(track.artist, track.track);
                }
                
                $.each(data.sources, function(index, value){
                    add({
                        "title": value.title,
                        "videoId": value.id,
                        //"category": value.category,
                        "duration": value.duration
                        //"thumbnail": value.thumbnail
                    });
                });
                
                pos = 0;
                
                $.publish('/RageAgain/SourceList/sourceChange');
                $.publish('/RageAgain/SourceList/loadSuccess');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $.publish('/RageAgain/SourceList/loadError');
                
                console.log("RageAgain.SourceList: loadError: "+textStatus);
            }
        });
    }
    
    //load new sources from Youtube using simple query string
    var load_backup = function (artistName, trackName) {        
        clear();
        
        console.log("RageAgain.SourceList: load_backup");
        
        $.publish('/RageAgain/SourceList/loadBegin');
        
        $.ajax({
            url: ytRequestUrl,
            dataType: "jsonp",
            data: {
                "max-results": 6,
                "q": generateQueryString(artistName, trackName),
                "alt": "jsonc",
                "v": 2
            },
            success: function(data) {
                
                if(typeof(data.data.items) === "undefined") {
                    
                    $.publish('/RageAgain/SourceList/loadError');
                    
                    console.log("RageAgain.SourceList: loadError: Returned result is empty.");
                    return;
                }
                
                $.each(data.data.items, function(index, value){
                    add({
                        "title": value.title,
                        "videoId": value.id,
                        "category": value.category,
                        "duration": value.duration,
                        "thumbnail": value.thumbnail
                    });
                });
                
                pos = 0;
                
                $.publish('/RageAgain/SourceList/sourceChange');
                $.publish('/RageAgain/SourceList/loadSuccess');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $.publish('/RageAgain/SourceList/loadError');
                
                console.log("RageAgain.SourceList: loadError: "+textStatus);
            }
        });
    }
    
    var generateQueryString = function (artistName, trackName) {
        
        //q = '"' + artistName + " - " + trackName + '"';
        var q = artistName.toLowerCase() + " - " + trackName.toLowerCase();
        
        var bannedWords = ['cover', 'remix', 'performing', 'lesson']; //live

        $(bannedWords).each(function(key, value) {
            if(q.indexOf(value) === -1)
                q += ' -intitle:'+value;
        });
        
        return q;
    }
    
    var onSourceChange = function () {
        
        //Repaint the thumbnails
        $(sourcelist).each(function(index, value) {
            value.repaint();
        });
        
    }
    
    $.subscribe("/RageAgain/SourceList/sourceChange", onSourceChange);
    
    return {
        add: add,
        next: next,
        prev: prev,
        hasNext: hasNext,
        hasPrev: hasPrev,
        current: current,
        clear: clear,
        seek: seek,
        indexOf: indexOf,
        setCurrentError: setCurrentError,
        load: load
    }
})();