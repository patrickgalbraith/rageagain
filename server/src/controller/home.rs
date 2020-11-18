use crate::views;
use mysql_async::prelude::*;

#[derive(Debug)]
struct MysqlReject(mysql_async::Error);

impl warp::reject::Reject for MysqlReject {}

pub(crate) fn mysql_reject(error: impl Into<mysql_async::Error>) -> warp::Rejection {
    warp::reject::custom(MysqlReject(error.into()))
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct Playlist {
    pub id: i32,
    pub title: String,
    pub special: Option<String>,
    pub timeslot: String,
    pub date: String,
}

pub async fn get_home(mut db: mysql_async::Conn) -> Result<views::IndexTemplate, warp::Rejection> {
    let playlists = match db
        .exec_map(
            "SELECT id, title, special, timeslot, date
             FROM playlists
             ORDER BY date DESC, timeslot ASC",
            (),
            |(id, title, special, timeslot, date)| Playlist {
                id,
                title,
                special,
                timeslot,
                date,
            },
        )
        .await
    {
        Ok(res) => res,
        Err(err) => return Err(mysql_reject(err)),
    };

    let playlist_count = playlists.len();
    let track_count = 0;

    let mut specials: Vec<Playlist> = playlists
        .into_iter()
        .filter(|p| p.special.is_some())
        .collect();

    specials.sort_by(|p1, p2| p1.special.cmp(&p2.special));

    let est_play_time = seconds_to_dhms(track_count * 231);

    let view = views::IndexTemplate {
        est_play_time,
        playlist_count,
        track_count,
        playlists: Vec::new(),
        specials,
    };

    Ok(view)
}

fn seconds_to_dhms(duration: usize) -> String {
    let mins = (duration / 60) % 60;
    let hours = (duration / 60 / 60) % 24;
    let days = (duration / 60 / 60 / 24) % 365;
    let years = duration / 60 / 60 / 24 / 365;

    let mut res = String::from("");

    if years > 0 {
        res = format!("{}{}{}", res, years, " year");

        if years > 1 {
            res = format!("{}{}", res, "s");
        }
    }

    if days > 0 {
        res = format!("{}{}{}", res, days, " day");

        if days > 1 {
            res = format!("{}{}", res, "s");
        }
    }

    if hours > 0 {
        res = format!("{}{}{}", res, hours, " hour");

        if hours > 1 {
            res = format!("{}{}", res, "s");
        }
    }

    if mins > 0 {
        res = format!("{}{}{}", res, mins, " min");

        if mins > 1 {
            res = format!("{}{}", res, "s");
        }
    }

    res
}
