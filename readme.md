# RageAgain

Since 1998 rage has posted all their episode playlists online. RageAgain combines these playlists with YouTube allowing you to travel back through time and re-experience Rage's recent history.

This project is broken down into multiple applications.

## Directories:

- **/data** - Latest data scraped from ABC website.
- **/scraper** - Source code of scraper. Runs using Github workflows on a scheduled timer.
- **/api** - Cloudflare worker that searches Youtube for music videos.
- **/web** - Source code of static website that is deployed to rageagain.com.
- **/scripts** - Miscellaneous helper scripts.
