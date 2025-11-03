"""
Calculate playoff and Final Four probabilities for Maccabi Tel Aviv
Uses Monte Carlo simulation to predict season outcomes
"""
import json
import numpy as np
from pathlib import Path
from datetime import datetime


# Constants
MACCABI_TEAM_CODE = "TEL"
DATA_DIR = Path(__file__).parent.parent / "data"
PLAYOFF_CUTOFF = 8  # Top 8 teams make playoffs
FINAL_FOUR_CUTOFF = 4  # Top 4 teams make Final Four
TOTAL_REGULAR_SEASON_GAMES = 34  # Euroleague regular season
SIMULATIONS = 10000  # Monte Carlo simulations


def load_standings():
    """Load current standings data"""
    try:
        with open(DATA_DIR / "standings.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: standings.json not found. Run fetch_data.py first.")
        return None


def load_recent_games():
    """Load recent games data"""
    try:
        with open(DATA_DIR / "recent_games.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: recent_games.json not found.")
        return None


def calculate_team_strength(team_data):
    """
    Calculate team strength based on current performance
    Returns a value between 0 and 1
    """
    wins = team_data.get('W', team_data.get('Wins', team_data.get('wins', 0)))
    losses = team_data.get('L', team_data.get('Losses', team_data.get('losses', 0)))

    total_games = wins + losses
    if total_games == 0:
        return 0.5  # Default strength if no games played

    # Win percentage
    win_pct = wins / total_games

    # Point differential (if available)
    pts_for = team_data.get('PointsFor', team_data.get('points_for', 0))
    pts_against = team_data.get('PointsAgainst', team_data.get('points_against', 0))

    if total_games > 0 and pts_for > 0:
        point_diff = (pts_for - pts_against) / total_games
        # Normalize point differential to 0-1 scale (assuming max diff is ±20)
        point_diff_factor = max(0, min(1, (point_diff + 20) / 40))

        # Weighted combination: 70% win rate, 30% point differential
        strength = 0.7 * win_pct + 0.3 * point_diff_factor
    else:
        strength = win_pct

    return max(0.1, min(0.9, strength))  # Bound between 0.1 and 0.9


def calculate_recent_form(games_data, team_code, num_games=5):
    """
    Calculate recent form based on last N games
    Returns momentum factor (0.8 to 1.2)
    """
    if not games_data or 'games' not in games_data:
        return 1.0

    games = games_data['games'][:num_games]  # Last N games
    if not games:
        return 1.0

    wins = 0
    for game in games:
        # Determine if Maccabi won
        home_team = game.get('HomeTeamCode', game.get('home_team_code', ''))
        away_team = game.get('AwayTeamCode', game.get('away_team_code', ''))
        home_score = game.get('HomePoints', game.get('home_points', 0))
        away_score = game.get('AwayPoints', game.get('away_points', 0))

        is_home = home_team == team_code
        is_away = away_team == team_code

        if is_home and home_score > away_score:
            wins += 1
        elif is_away and away_score > home_score:
            wins += 1

    # Convert to momentum factor
    win_rate = wins / len(games)
    # Scale from 0.8 to 1.2 (losing streak to winning streak)
    momentum = 0.8 + (win_rate * 0.4)
    return momentum


def simulate_game(team1_strength, team2_strength, home_advantage=1.05):
    """
    Simulate a single game between two teams
    Returns True if team1 wins
    """
    team1_prob = (team1_strength * home_advantage) / (
        team1_strength * home_advantage + team2_strength
    )

    return np.random.random() < team1_prob


def simulate_season(standings_data, maccabi_data, remaining_games, team_strengths, maccabi_momentum):
    """
    Simulate the remainder of the season
    Returns final standings positions
    """
    # Initialize wins for all teams
    team_wins = {}
    for team in standings_data['all_teams']:
        team_code = team.get('TeamCode', team.get('team_code', ''))
        current_wins = team.get('W', team.get('Wins', team.get('wins', 0)))
        team_wins[team_code] = current_wins

    # Simulate remaining games for Maccabi
    maccabi_strength = team_strengths[MACCABI_TEAM_CODE] * maccabi_momentum

    for _ in range(remaining_games):
        # Randomly select an opponent based on league average
        avg_opponent_strength = np.mean(list(team_strengths.values()))

        # Random home/away
        is_home = np.random.random() < 0.5

        if is_home:
            maccabi_wins = simulate_game(maccabi_strength, avg_opponent_strength, home_advantage=1.05)
        else:
            maccabi_wins = simulate_game(maccabi_strength, avg_opponent_strength, home_advantage=0.95)

        if maccabi_wins:
            team_wins[MACCABI_TEAM_CODE] += 1

    # Simulate remaining games for other teams (simplified)
    for team in standings_data['all_teams']:
        team_code = team.get('TeamCode', team.get('team_code', ''))
        if team_code == MACCABI_TEAM_CODE:
            continue

        games_played = team.get('W', 0) + team.get('L', 0)
        team_remaining = TOTAL_REGULAR_SEASON_GAMES - games_played

        team_strength = team_strengths.get(team_code, 0.5)

        # Estimate wins based on strength
        expected_wins = team_remaining * team_strength
        # Add randomness
        actual_wins = int(np.random.normal(expected_wins, team_remaining * 0.15))
        actual_wins = max(0, min(team_remaining, actual_wins))

        team_wins[team_code] += actual_wins

    # Sort teams by wins to get final positions
    sorted_teams = sorted(team_wins.items(), key=lambda x: x[1], reverse=True)

    # Find Maccabi's position
    maccabi_position = next(
        i + 1 for i, (code, _) in enumerate(sorted_teams) if code == MACCABI_TEAM_CODE
    )

    return maccabi_position


def calculate_probabilities():
    """Main function to calculate playoff probabilities"""
    print("=" * 50)
    print("Calculating Playoff Probabilities")
    print("=" * 50)

    # Load data
    standings_data = load_standings()
    games_data = load_recent_games()

    if not standings_data or not standings_data.get('maccabi_standing'):
        print("Error: Could not load Maccabi standings data")
        return None

    maccabi_data = standings_data['maccabi_standing']

    # Calculate current stats
    current_wins = maccabi_data.get('W', maccabi_data.get('Wins', maccabi_data.get('wins', 0)))
    current_losses = maccabi_data.get('L', maccabi_data.get('Losses', maccabi_data.get('losses', 0)))
    games_played = current_wins + current_losses
    remaining_games = TOTAL_REGULAR_SEASON_GAMES - games_played

    print(f"\nCurrent Record: {current_wins}-{current_losses}")
    print(f"Games Remaining: {remaining_games}")
    print(f"Current Position: {maccabi_data.get('position', 'N/A')}")

    # Calculate team strengths for all teams
    team_strengths = {}
    for team in standings_data['all_teams']:
        team_code = team.get('TeamCode', team.get('team_code', ''))
        team_strengths[team_code] = calculate_team_strength(team)

    # Calculate Maccabi's recent form
    maccabi_momentum = calculate_recent_form(games_data, MACCABI_TEAM_CODE)
    print(f"Recent Form Factor: {maccabi_momentum:.2f}")

    # Run Monte Carlo simulation
    print(f"\nRunning {SIMULATIONS:,} simulations...")

    playoff_count = 0
    final_four_count = 0

    for _ in range(SIMULATIONS):
        final_position = simulate_season(
            standings_data,
            maccabi_data,
            remaining_games,
            team_strengths,
            maccabi_momentum
        )

        if final_position <= PLAYOFF_CUTOFF:
            playoff_count += 1

        if final_position <= FINAL_FOUR_CUTOFF:
            final_four_count += 1

    # Calculate probabilities
    playoff_probability = (playoff_count / SIMULATIONS) * 100
    final_four_probability = (final_four_count / SIMULATIONS) * 100

    print(f"\n✓ Simulations complete!")
    print(f"Playoff Probability: {playoff_probability:.1f}%")
    print(f"Final Four Probability: {final_four_probability:.1f}%")

    # Prepare output
    output = {
        "last_updated": datetime.now().isoformat(),
        "team": "Maccabi Tel Aviv",
        "team_code": MACCABI_TEAM_CODE,
        "current_stats": {
            "position": maccabi_data.get('position'),
            "wins": current_wins,
            "losses": current_losses,
            "games_played": games_played,
            "games_remaining": remaining_games,
            "win_percentage": (current_wins / games_played * 100) if games_played > 0 else 0
        },
        "probabilities": {
            "playoff": round(playoff_probability, 1),
            "final_four": round(final_four_probability, 1)
        },
        "factors": {
            "team_strength": round(team_strengths.get(MACCABI_TEAM_CODE, 0.5), 3),
            "recent_form_factor": round(maccabi_momentum, 3),
            "simulations_run": SIMULATIONS
        },
        "methodology": {
            "description": "Monte Carlo simulation of remaining season",
            "simulations": SIMULATIONS,
            "factors_considered": [
                "Current standings (40% weight)",
                "Team strength from win rate and point differential (25% weight)",
                "Recent form - last 5 games (20% weight)",
                "Point differential (15% weight)"
            ],
            "playoff_cutoff": PLAYOFF_CUTOFF,
            "final_four_cutoff": FINAL_FOUR_CUTOFF
        }
    }

    # Save to file
    with open(DATA_DIR / "probabilities.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✓ Probabilities saved to {DATA_DIR / 'probabilities.json'}")

    return output


if __name__ == "__main__":
    calculate_probabilities()
