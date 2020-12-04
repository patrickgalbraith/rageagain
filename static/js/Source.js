

RageAgain.SourceList.Source = function($index, videoInfo, $el) {
    
    var data = videoInfo;
    var el = $el; //the associated dom element <a>
    var index = $index;
    var error = false;
    
    var paint = function () {
        //$(el).children('img').attr('src', data.thumbnail.sqDefault);
    }
    
    var repaint = function () {
        if(index == RageAgain.SourceList.indexOf(RageAgain.SourceList.current()))
            onSelected();
        else
            onDeselected();
    }
    
    var onSelected = function () {
        //$(el).children('img').addClass('selected');
    }
    
    var onDeselected = function () {
        //$(el).children('img').removeClass('selected');
    }
    
    var onError = function () {
        error = true;
        //$(el).children('img').addClass('error');
        //$(el).unbind();
    }
    
    var onClick = function () {
        //If we just clicked on the current source then ignore
        if(index == RageAgain.SourceList.indexOf(RageAgain.SourceList.current()))
            return;
        
        RageAgain.SourceList.seek(index);
        
        //update database to select this source automatically next time
        $.getJSON('/preferred_source/set', {
            "key": RageAgain.TrackList.current().artist.name + ' - '+ RageAgain.TrackList.current().name,
            "youtube_id": RageAgain.SourceList.current().data.videoId
        }, function(data) {
            if(data.success == 'true') {
                //do nothing
            } else {
                console.log("Failed to save preffered source.");
            }
        });
    }
    
    var destroy = function () {
        //$(el).children('img').attr('src', 'http://img.youtube.com/vi/default.jpg');
        //$(el).children('img').removeClass("error selected unavailable");
        //$(el).unbind();
    }
    
    //INIT
    paint();
    //$(el).click(onClick);
    
    return {
        data: data,
        el: el,
        
        paint: paint,
        repaint: repaint,
        destroy: destroy,
        onSelected: onSelected,
        onDeselected: onDeselected,
        onError: onError
    };
}