"""
Fetch Euroleague data for Maccabi Tel Aviv using euroleague_api
"""
import json
import os
from datetime import datetime
from pathlib import Path

try:
    from euroleague_api.standings import Standings
    from euroleague_api.game_stats import GameStats
    from euroleague_api.team_stats import TeamStats
except ImportError:
    print("Error: euroleague_api not installed. Run: pip install euroleague-api")
    exit(1)


# Constants
MACCABI_TEAM_CODE = "TEL"  # Maccabi Tel Aviv team code
COMPETITION = "E"  # E for Euroleague
CURRENT_SEASON = 2024  # Update this each season
DATA_DIR = Path(__file__).parent.parent / "data"


def ensure_data_dir():
    """Create data directory if it doesn't exist"""
    DATA_DIR.mkdir(exist_ok=True)


def fetch_standings():
    """Fetch current Euroleague standings"""
    print("Fetching standings...")
    try:
        standings_api = Standings(COMPETITION)
        standings_df = standings_api.get_standings(CURRENT_SEASON)

        # Convert to list of dicts for JSON serialization
        standings_data = standings_df.to_dict('records')

        # Find Maccabi's position
        maccabi_data = None
        for idx, team in enumerate(standings_data):
            if team.get('TeamCode') == MACCABI_TEAM_CODE or team.get('team_code') == MACCABI_TEAM_CODE:
                team['position'] = idx + 1
                maccabi_data = team
                break

        output = {
            "last_updated": datetime.now().isoformat(),
            "season": CURRENT_SEASON,
            "competition": "Euroleague",
            "all_teams": standings_data,
            "maccabi_standing": maccabi_data,
            "total_teams": len(standings_data)
        }

        with open(DATA_DIR / "standings.json", "w") as f:
            json.dump(output, f, indent=2, default=str)

        print(f"✓ Standings saved ({len(standings_data)} teams)")
        return output

    except Exception as e:
        print(f"Error fetching standings: {e}")
        return None


def fetch_team_stats():
    """Fetch Maccabi Tel Aviv team statistics"""
    print("Fetching team stats...")
    try:
        team_stats_api = TeamStats(COMPETITION)
        team_stats_df = team_stats_api.get_team_stats(CURRENT_SEASON)

        # Filter for Maccabi
        maccabi_stats = team_stats_df[
            (team_stats_df['Team'] == 'Maccabi Playtika Tel Aviv') |
            (team_stats_df['team'] == 'Maccabi Playtika Tel Aviv') |
            (team_stats_df['TeamCode'] == MACCABI_TEAM_CODE) |
            (team_stats_df['team_code'] == MACCABI_TEAM_CODE)
        ]

        if not maccabi_stats.empty:
            stats_dict = maccabi_stats.to_dict('records')[0]
        else:
            stats_dict = {}

        output = {
            "last_updated": datetime.now().isoformat(),
            "season": CURRENT_SEASON,
            "team": "Maccabi Tel Aviv",
            "team_code": MACCABI_TEAM_CODE,
            "stats": stats_dict
        }

        with open(DATA_DIR / "team_stats.json", "w") as f:
            json.dump(output, f, indent=2, default=str)

        print("✓ Team stats saved")
        return output

    except Exception as e:
        print(f"Error fetching team stats: {e}")
        return None


def fetch_recent_games(num_games=10):
    """Fetch recent Maccabi games"""
    print(f"Fetching recent {num_games} games...")
    try:
        game_stats_api = GameStats(COMPETITION)

        # Get all games for the season
        all_games_df = game_stats_api.get_game_stats(CURRENT_SEASON)

        # Filter for Maccabi games (home or away)
        maccabi_games = all_games_df[
            (all_games_df['Home'] == 'Maccabi Playtika Tel Aviv') |
            (all_games_df['Away'] == 'Maccabi Playtika Tel Aviv') |
            (all_games_df['home'] == 'Maccabi Playtika Tel Aviv') |
            (all_games_df['away'] == 'Maccabi Playtika Tel Aviv') |
            (all_games_df['HomeTeamCode'] == MACCABI_TEAM_CODE) |
            (all_games_df['AwayTeamCode'] == MACCABI_TEAM_CODE) |
            (all_games_df['home_team_code'] == MACCABI_TEAM_CODE) |
            (all_games_df['away_team_code'] == MACCABI_TEAM_CODE)
        ]

        # Sort by date/round (most recent first)
        if 'Round' in maccabi_games.columns:
            maccabi_games = maccabi_games.sort_values('Round', ascending=False)
        elif 'round' in maccabi_games.columns:
            maccabi_games = maccabi_games.sort_values('round', ascending=False)

        # Take most recent games
        recent_games = maccabi_games.head(num_games)

        games_list = recent_games.to_dict('records')

        output = {
            "last_updated": datetime.now().isoformat(),
            "season": CURRENT_SEASON,
            "team": "Maccabi Tel Aviv",
            "games_count": len(games_list),
            "games": games_list
        }

        with open(DATA_DIR / "recent_games.json", "w") as f:
            json.dump(output, f, indent=2, default=str)

        print(f"✓ Recent games saved ({len(games_list)} games)")
        return output

    except Exception as e:
        print(f"Error fetching recent games: {e}")
        return None


def main():
    """Main execution function"""
    print("=" * 50)
    print("Maccabi Tel Aviv Euroleague Data Fetcher")
    print("=" * 50)

    ensure_data_dir()

    # Fetch all data
    standings = fetch_standings()
    team_stats = fetch_team_stats()
    recent_games = fetch_recent_games()

    print("\n" + "=" * 50)
    print("Data fetch complete!")
    print("=" * 50)

    # Summary
    if standings and standings.get('maccabi_standing'):
        maccabi = standings['maccabi_standing']
        print(f"\nMaccabi Position: {maccabi.get('position', 'N/A')}")
        print(f"Record: {maccabi.get('W', 'N/A')}-{maccabi.get('L', 'N/A')}")

    if recent_games:
        print(f"Recent Games: {recent_games['games_count']} loaded")


if __name__ == "__main__":
    main()
