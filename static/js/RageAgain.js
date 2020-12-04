
var router = new Simrou({
    '/episode/:playlist_id': {
        get: function() {
            console.log('ROUTE: /episode/'+params.playlist_id);
            router.navigate('/episode/'+params.playlist_id+'/1');
        }
    },
    '/episode/:playlist_id/:track_pos': {
        get: function(event, params) {
            console.log('ROUTE: /episode/'+params.playlist_id+'/'+params.track_pos);
            
            var playlist_id = params.playlist_id == 'top200' ? 'top200' : parseInt(params.playlist_id);
            var track_pos = parseInt(params.track_pos);

            RageAgain.loadPlaylist(playlist_id, function(playlist_id) {
                RageAgain.TrackList.skip(track_pos - 1);
            });
        }
    },
    '/home': {
        get: function() {
            console.log('ROUTE: /home');

            Player.play(); //play intro video
        }
    }
});

$(function() {
    RageAgain.init();
    router.start('/home');
});


var RageAgain = (function () {
    
    var currentPlaylist = null;
    
    var init = function () {
        
        ///// TOOLTIPS /////
        $(document).tooltip({
            selector: 'a[rel=tooltip]',
            placement: function(tooltip, target) {                
                return $(target).attr('data-placement') || 'top';
            },
            trigger: 'manual'
        });
        
        $('a[rel=tooltip]').mouseenter(function(e) {
            
            $(this).tooltip('show');
            
            if($('body').children('.tooltip').offset().left < 0) {
                $('body').children('.tooltip').offset({left:0});
            }
            
            setTimeout(function() {
                if($('body').children('.tooltip').offset() && $('body').children('.tooltip').offset().left < 0) {
                    $('body').children('.tooltip').animate({left:0}, 50);
                }
            }, 200);
            
            e.preventDefault();
            e.stopImmediatePropagation();
        });
        
        $('a[rel=tooltip]').mouseleave(function(e) {
            $(this).tooltip('hide');
        });
        
        
        $('.nav .skip-to-year').click(function(e) {
            var year = $(this).attr('data-year');
            var anchor = $('a[name=episode-'+year+']');
            
            $('#pop-up-container').scrollTop(anchor.position().top);
        });
        
        $('.sort-by-date').click(function(e) {
            $('#specials').hide();
            $('#episodes').show();
            
            $('.sort-by-date').parent().addClass('active');
            $('.sort-by-special').parent().removeClass('active');
            
            $('.skip-to-year-toggle').parent().removeClass('disabled');
        });
        
        $('.sort-by-special').click(function(e) {
            $('#specials').show();
            $('#episodes').hide();
            
            $('.sort-by-date').parent().removeClass('active');
            $('.sort-by-special').parent().addClass('active');
            
            $('.skip-to-year-toggle').parent().addClass('disabled');
        });
        
        
        ///// TOP MENU /////
        $('.episode-button').click(function(e) {
            changeTab('episodeList');
        });

        $('.now-playing-button').click(function(e) {
            changeTab('nowPlaying');
        });
        
        $('.player-backward').click(function(e) {
            //RageAgain.TrackList.prev();
            if(RageAgain.TrackList.hasPrev()) {
                router.navigate('/episode/'+currentPlaylist+'/'+(RageAgain.TrackList.getPosition()));
            }
        });
        
        $('.player-forward').click(function(e) {
            //RageAgain.TrackList.next();
            if(RageAgain.TrackList.hasNext()) {
                router.navigate('/episode/'+currentPlaylist+'/'+(RageAgain.TrackList.getPosition()+2));
            }
        });
        
        $('.player-pause').click(function(e) {
            Player.togglePause();
        });
        
        ///// PLAYLIST LINKS /////
        
        //$('.playlist').click(function(e) {
        //    loadPlaylist($(this).attr('data-playlist_id'));
        //});
        
        ///// EVENTS /////
        $.subscribe("/RageAgain/TrackList/trackChange", onTrackChange);
        $.subscribe("/RageAgain/TrackList/trackListFinished", function() {
            changeTab('episodeList');
        });
        $.subscribe("/RageAgain/SourceList/loadSuccess", onSourcesLoaded);
        $.subscribe("/RageAgain/SourceList/sourceChange", onSourceChange);
        $.subscribe("/RageAgain/SourceList/loadError", onSourceListLoadFailed);
        
        $.subscribe("/Player/error", function() {
            RageAgain.SourceList.setCurrentError();
            
            var result = RageAgain.SourceList.next(); //load next alt sources, until we have tried them all
            
            if(result === null) {
                RageAgain.TrackList.next();
            }
        });
        $.subscribe("/Player/ended", function() {
            RageAgain.TrackList.next(); //load next track
        });
        $.subscribe("/Player/paused", function() {
            $('.player-pause i').removeClass().addClass('icon-play');
        });
        $.subscribe("/Player/playing", function() {
            $('.player-pause i').removeClass().addClass('icon-pause');
        });
        
        
        ///// KEYBOARD SHORTCUTS /////
        $(document).keyup(function(e) {
            var key = e.which;
            
            //Left arrow
            if(key == 37) {
                RageAgain.TrackList.prev();
            }
            
            //Right arrow
            if(key == 39) {
                RageAgain.TrackList.next();
            }
            
            //Space bar
            if(key == 32) {
                Player.togglePause();
            }
            
            return true;
        });
        
        // Prevent default (i.e. scrolling) for the left and right arrow keys
        $(document).keydown(function(e) {
            var key = e.which;
            
            if(key == 37 || key == 39) {
                e.preventDefault();
                return false;
            }
            return true;
        });

    }
    
    var onTrackChange = function (event, curTrack, prevTrack, direction) {
        RageAgain.SourceList.load(curTrack);
        
        $('#nav-right').fadeIn();
        
        $('.artist').text(curTrack.artist);
        $('.track').text(curTrack.track);
        
        document.title = curTrack.track+' by '+curTrack.artist+' | RAGEagain';
        
        if(curTrack.label) {
            $('.tracklabel').text('('+curTrack.label+')');
        } else {
            $('.tracklabel').text('');
        }
        
        $('#now-playing-info').hide().delay(1500).fadeIn('slow').delay(8000).fadeOut();
        
        if(!Player.isPlaying()) {
            Player.play();
        }
    }
    
    var onSourcesLoaded = function () {
        Player.loadVideoById(RageAgain.SourceList.current().data.videoId);
    }
    
    var onSourceListLoadFailed = function () {
        //remove this track and load next one
        //@TODO notify user that track failed to load
        console.log("No sources available. Removing track..."+RageAgain.TrackList.current().track + ' - '+ RageAgain.TrackList.current().artist);
        RageAgain.TrackList.remove(RageAgain.TrackList.current());
        RageAgain.TrackList.next();
    }
    
    var onSourceChange = function () {
        Player.loadVideoById(RageAgain.SourceList.current().data.videoId);
    }
    
    var changeTab = function (tabName) {
        
        if(tabName == 'episodeList') {
            
            $('header #nav-left a').removeClass('active');
            $('.episode-button').addClass('active');
            
            $('#overlay').fadeIn();
            $('#episode-container').show();
            $('#pop-up-container').show();
            
        } else if(tabName == 'nowPlaying') {
            
            $('header #nav-left a').removeClass('active');
            $('.now-playing-button').addClass('active');
            
            $('#overlay').fadeOut();
            $('#episode-container').hide();
            $('#pop-up-container').hide();
        }
        
    }
    
    var loadPlaylist = function (id, callback) {
        
        if (typeof id == "undefined") {
            throw "RageAgain.loadPlaylist() id is undefined.";
        }
        
        if(currentPlaylist == id) {
            console.log('This playlist is already playing...');
            
            if($.isFunction(callback))
                callback(currentPlaylist);
            
            return;
        }
        
        var url = '/tracks/getByPlaylistId/'+id+'.json';
        
        if(id == 'top200') {
            url = '/tracks/getTop200.json';
        }
        
        $.getJSON(url, function(data) {
            
            $('#fullscreen-loader').hide();
            
            if(!data || data.length < 1 || !data.tracks) {
                alert('Failed to load selected playlist. Empty server response.');
                return;
            }
            
            currentPlaylist = id;
            
            var tracks = new Array();
            
            //Re-organise tracks data
            $.each(data.tracks, function(key, value) {
                tracks.push(value);
            });
            
            RageAgain.TrackList.clear();
            RageAgain.TrackList.add(tracks);
            //RageAgain.TrackList.next();
            
            if($.isFunction(callback))
                callback(currentPlaylist);
            
            $('a span.now-playing-label').remove();
            $('a[data-playlist_id='+id+']').append('<span class="label label-important now-playing-label">p</span>');
            
            changeTab('nowPlaying');
        });
    }
    
    return {
        init: init,
        loadPlaylist: loadPlaylist
    }
})();