use askama::Template;

mod filters {
    use chrono::prelude::*;

    pub fn number_format(i: &i32) -> askama::Result<String> {
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

    pub fn special_title_format(title: &str) -> askama::Result<String> {
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

pub struct Playlist<'a> {
    pub id: &'a u32,
    pub special: &'a str,
    pub year: &'a u16,
    pub date: &'a str,
}

pub struct PlaylistByYear<'a> {
    pub year: &'a u16,
    pub playlist: Vec<&'a Playlist<'a>>,
}

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate<'a> {
    pub playlist_count: &'a i32,
    pub track_count: &'a i32,
    pub est_play_time: &'a str,
    pub playlists: Vec<&'a PlaylistByYear<'a>>,
    pub specials: Vec<&'a Playlist<'a>>,
}
