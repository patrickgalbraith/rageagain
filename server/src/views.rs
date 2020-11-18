use crate::controller::home::Playlist;
use askama::Template;

mod filters {
    use chrono::prelude::*;

    pub fn number_format(i: &usize) -> askama::Result<String> {
        let mut s = String::new();
        let i_str = i.to_string();
        let a = i_str.chars().rev().enumerate();

        for (idx, val) in a {
            if idx != 0 && idx % 3 == 0 {
                s.insert(0, ',');
            }

            s.insert(0, val);
        }

        Ok(s)
    }

    pub fn date_format(d: &str, fmt: &str) -> askama::Result<String> {
        let d = DateTime::parse_from_rfc3339(&d);

        match d {
            Ok(d) => Ok(d.format(fmt).to_string()),
            Err(_) => Ok("Invalid date".to_string()),
        }
    }

    pub fn special_title_format(title: &String) -> askama::Result<String> {
        let s = title
            .replace("guest programs rage", "")
            .replace("guest program rage", "")
            .replace("guest programs", "")
            .replace("guest program", "")
            .replace("Guest Programs", "")
            .replace("Grust Program", "");

        Ok(s)
    }
}

pub struct PlaylistByYear {
    pub year: usize,
    pub playlist: Vec<Playlist>,
}

//Example - https://git.jebrosen.com/jeb/sirus/src/commit/f82682da099f0cafa514b699c7841b9ba45f6194/src/templates.rs

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    pub playlist_count: usize,
    pub track_count: usize,
    pub est_play_time: String,
    pub playlists: Vec<PlaylistByYear>,
    pub specials: Vec<Playlist>,
}
