# 🏀 Maccabi Tel Aviv Euroleague Tracker

A real-time tracker for Maccabi Tel Aviv Basketball team's performance in the Euroleague, featuring live standings, recent game results, and advanced playoff probability predictions using Monte Carlo simulation.

![Euroleague](https://img.shields.io/badge/League-Euroleague-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **📊 Live Standings**: Real-time Euroleague standings and Maccabi's current position
- **🎯 Playoff Probabilities**: Advanced Monte Carlo simulation calculating:
  - Playoff qualification probability (Top 8)
  - Final Four probability (Top 4)
- **🏆 Recent Games**: Last 10 Maccabi games with scores and results
- **📈 Team Statistics**: Win percentage, point differential, and form metrics
- **ℹ️ Interactive Tooltip**: Detailed explanation of probability calculation methodology
- **🔄 Auto-Updates**: GitHub Actions automatically updates data daily

## 🎲 Playoff Probability Algorithm

The app uses a sophisticated **Monte Carlo simulation** with 10,000 iterations to predict playoff chances. The algorithm considers:

| Factor | Weight | Description |
|--------|--------|-------------|
| Current Standings | 40% | Position and wins accumulated |
| Team Strength | 25% | Win rate and point differential |
| Recent Form | 20% | Performance in last 5 games |
| Point Differential | 15% | Average margin of victory/defeat |

### How It Works

1. Simulates the remainder of the season 10,000 times
2. Each game outcome is determined by team strength, momentum, and home advantage
3. Counts how many simulations result in Top 8 (playoffs) or Top 4 (Final Four)
4. The percentage becomes the probability

## 🏗️ Architecture

```
Frontend (Static Web App)
    ↓
Data Files (JSON)
    ↓
GitHub Actions (Daily)
    ↓
Python Scripts
    ↓
Euroleague API
```

### Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python 3.11+ with GitHub Actions
- **Data Source**: [euroleague_api](https://github.com/giasemidis/euroleague_api)
- **Hosting**: GitHub Pages

## 📁 Project Structure

```
/
├── index.html              # Main dashboard
├── css/
│   └── styles.css         # Maccabi-themed styling
├── js/
│   └── app.js             # Frontend logic & tooltip
├── data/                  # Auto-generated JSON files
│   ├── standings.json
│   ├── recent_games.json
│   ├── team_stats.json
│   └── probabilities.json
├── scripts/               # Python backend
│   ├── fetch_data.py      # Fetch from Euroleague API
│   ├── calculate_probability.py  # Monte Carlo simulation
│   └── requirements.txt
└── .github/
    └── workflows/
        └── update_data.yml # Automated daily updates
```

## 🚀 Setup & Deployment

### Prerequisites

- Python 3.11+
- GitHub account for hosting

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MaccabiEuroleageTracker.github.io.git
   cd MaccabiEuroleageTracker.github.io
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r scripts/requirements.txt
   ```

3. **Fetch data**
   ```bash
   python scripts/fetch_data.py
   python scripts/calculate_probability.py
   ```

4. **Open locally**
   ```bash
   # Use any local server, e.g.:
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

### GitHub Pages Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save

3. **Enable GitHub Actions**
   - The workflow will automatically run daily at 6:00 AM UTC
   - Manual trigger: Actions → Update Euroleague Data → Run workflow

4. **Your site will be live at**
   ```
   https://yourusername.github.io/MaccabiEuroleageTracker.github.io/
   ```

## 🔧 Configuration

### Update Schedule

Edit `.github/workflows/update_data.yml` to change the update frequency:

```yaml
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6:00 AM UTC
```

### Season Configuration

Update the season in `scripts/fetch_data.py`:

```python
CURRENT_SEASON = 2024  # Update for new season
```

### Team Configuration

To track a different team, change the team code in `scripts/fetch_data.py` and `scripts/calculate_probability.py`:

```python
MACCABI_TEAM_CODE = "TEL"  # Maccabi Tel Aviv
```

## 📊 Data Sources

- **Euroleague API**: [github.com/giasemidis/euroleague_api](https://github.com/giasemidis/euroleague_api)
- **Data includes**: Standings, game stats, team statistics, player data

## 🎨 Design

The app features Maccabi Tel Aviv's official colors:
- **Primary**: Maccabi Blue (#0047BA)
- **Secondary**: Maccabi Yellow (#FFD700)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [euroleague_api](https://github.com/giasemidis/euroleague_api) by giasemidis for providing the data API
- Euroleague Basketball for the official data
- Maccabi Tel Aviv Basketball fans worldwide

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the interactive tooltip in the app for probability methodology

---

**Go Maccabi!** 💙💛
