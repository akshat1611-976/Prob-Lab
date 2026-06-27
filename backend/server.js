import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import http from 'http'; // NEW: Required for WebSockets
import { Server } from 'socket.io'; // NEW: The WebSocket Engine

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// NEW: Wrap Express inside an HTTP server
const server = http.createServer(app);

// NEW: Initialize Socket.io and allow your frontend to connect
const io = new Server(server, {
  cors: {
    origin: "*", // In production, change this to your Vercel URL
    methods: ["GET", "POST"]
  }
});

// NEW: Inject the WebSocket engine into every API request so your routes can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});
// Middleware
app.use(cors());
app.use(express.json());
// Database Connection Setup (Hybrid: Local + Cloud)
let pool;

if (process.env.DATABASE_URL) {
  // CLOUD SETUP: Uses the connection string and SSL (For Render/Supabase)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // LOCAL SETUP: Uses your local variables and no SSL (For your laptop)
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL Database successfully!'))
  .catch(err => console.error('❌ PostgreSQL Connection Error:', err.message));
// ==========================================
// AUTHENTICATION API ROUTES
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(401).json({ error: 'User already exists' });

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, bcryptPassword]
    );

    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(401).json({ error: 'Invalid Email or Password' });

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid Email or Password' });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};

// ==========================================
// SIMULATION ENGINE API ROUTES
// ==========================================

// 2. Roulette Simulator
app.post('/api/simulations/roulette', verifyToken, async (req, res) => {
  try {
    const { starting_bankroll, bet_amount, bet_type, total_trials } = req.body;
    
    let current_bankroll = Number(starting_bankroll);
    const bet = Number(bet_amount);
    const trials = Number(total_trials);

    let wins = 0, losses = 0;
    let history = [{ round: 0, bankroll: current_bankroll }];

    let winChance = 0;
    let payoutMultiplier = 0;

    // Advanced Casino Betting Logic
    if (bet_type === 'Color' || bet_type === 'Even/Odd' || bet_type === 'High/Low') {
      winChance = 18 / 38; 
      payoutMultiplier = 1; 
    } else if (bet_type === 'Dozen' || bet_type === 'Column') {
      winChance = 12 / 38;
      payoutMultiplier = 2; 
    } else if (bet_type === 'Corner') {
      winChance = 4 / 38;
      payoutMultiplier = 8; 
    } else if (bet_type === 'Split') {
      winChance = 2 / 38;
      payoutMultiplier = 17; 
    } else if (bet_type === 'Single Number') {
      winChance = 1 / 38;
      payoutMultiplier = 35; 
    } else {
      return res.status(400).json({ error: 'Invalid bet type' });
    }

    for (let i = 1; i <= trials; i++) {
      if (current_bankroll < bet) {
        history.push({ round: i, bankroll: current_bankroll, event: 'BANKRUPT' });
        break;
      }

      current_bankroll -= bet;

      if (Math.random() < winChance) {
        current_bankroll += bet + (bet * payoutMultiplier);
        wins++;
      } else {
        losses++;
      }

      if (trials <= 100 || i % Math.ceil(trials / 100) === 0 || i === trials || current_bankroll < bet) {
        history.push({ round: i, bankroll: parseFloat(current_bankroll.toFixed(2)) });
      }
    }

    const expected_value_per_bet = (winChance * (bet * payoutMultiplier)) - ((1 - winChance) * bet);

    const result_summary = { 
      wins, 
      losses, 
      final_bankroll: current_bankroll, 
      bankrupt: current_bankroll < bet,
      history 
    };

    const newSim = await pool.query(
      `INSERT INTO simulations (user_id, simulation_type, parameters_json, total_trials, expected_value, result_summary) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, 'Roulette', JSON.stringify({ starting_bankroll, bet_amount, bet_type }), trials, expected_value_per_bet, JSON.stringify(result_summary)]
    );
    const pnl = current_bankroll - starting_bankroll;
    req.io.emit('live_feed', { 
      environment: "Roulette", 
      user: req.user.name || 'Global Analyst',
      message: `completed ${trials} spins. Net PnL: ${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toLocaleString()}`
    });
    res.json(newSim.rows[0]);
  } catch (err) {
    console.error('Roulette Error:', err.message);
    res.status(500).json({ error: 'Server error during simulation' });
  }
});

// 3. Custom Sandbox Monte Carlo Engine
app.post('/api/simulations/custom', verifyToken, async (req, res) => {
  try {
    const { 
      experiment_name, 
      starting_bankroll, 
      win_probability, 
      reward_amount, 
      loss_amount, 
      total_trials 
    } = req.body;

    const name = experiment_name || 'Unnamed Sandbox';
    let current_bankroll = Number(starting_bankroll);
    const pWin = Number(win_probability); // e.g., 0.35 for 35%
    const reward = Number(reward_amount);
    const loss = Number(loss_amount); // Positive value representing the cost of losing
    const trials = Number(total_trials);

    if (pWin < 0 || pWin > 1) {
      return res.status(400).json({ error: 'Probability must be between 0 and 1' });
    }

    let wins = 0;
    let losses = 0;
    let history = [{ round: 0, bankroll: current_bankroll }];

    for (let i = 1; i <= trials; i++) {
      // Bankruptcy Check: If remaining money can't cover a potential loss, stop
      if (current_bankroll < loss) {
        history.push({ round: i, bankroll: current_bankroll, event: 'BANKRUPT' });
        break;
      }

      // Execute the probability trial
      if (Math.random() < pWin) {
        current_bankroll += reward;
        wins++;
      } else {
        current_bankroll -= loss;
        losses++;
      }

      // Optimize data points for Recharts visualization (Max 100 snapshots)
      if (trials <= 100 || i % Math.ceil(trials / 100) === 0 || i === trials || current_bankroll < loss) {
        history.push({ round: i, bankroll: parseFloat(current_bankroll.toFixed(2)) });
      }
    }

    // Mathematical Expected Value Formula: (P(Win) * Reward) - (P(Loss) * Loss)
    const expected_value_per_trial = (pWin * reward) - ((1 - pWin) * loss);
    
    // Total portfolio expected value across all intended trials
    const net_expected_value = expected_value_per_trial * trials;

    const result_summary = {
      wins,
      losses,
      final_bankroll: current_bankroll,
      bankrupt: current_bankroll < loss,
      history
    };

    // Save configuration parameters and results into the flexible PG database
    const newSim = await pool.query(
      `INSERT INTO simulations (user_id, simulation_type, parameters_json, total_trials, expected_value, result_summary) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.user.id, 
        `Sandbox: ${name}`, 
        JSON.stringify({ experiment_name: name, starting_bankroll, win_probability: pWin, reward_amount: reward, loss_amount: loss }), 
        trials, 
        net_expected_value, 
        JSON.stringify(result_summary)
      ]
    );

    res.json(newSim.rows[0]);
  } catch (err) {
    console.error('Custom Sandbox Error:', err.message);
    res.status(500).json({ error: 'Server error during custom simulation' });
  }
});


// 5. Plinko Simulator (Binomial Distribution / Galton Board)
app.post('/api/simulations/plinko', verifyToken, async (req, res) => {
  try {
    const { starting_bankroll, bet_amount, total_balls } = req.body;
    
    let current_bankroll = Number(starting_bankroll);
    const bet = Number(bet_amount);
    const balls = Number(total_balls);
    const rows = 8; // Standard 8-row pegboard

    // Payout multipliers for the 9 possible landing bins (0 through 8)
    // The edges are extremely rare (29x), the middle is common but loses money (0.1x)
    const multipliers = [29, 4, 1.5, 0.3, 0.1, 0.3, 1.5, 4, 29];
    
    let bins = new Array(9).fill(0); // Tracks how many balls land in each slot
    let history = [{ round: 0, bankroll: current_bankroll }];
    let wins = 0; // A win is landing in a bin > 1x multiplier
    let losses = 0;

    for (let i = 1; i <= balls; i++) {
      if (current_bankroll < bet) {
        history.push({ round: i, bankroll: current_bankroll, event: 'BANKRUPT' });
        break;
      }

      current_bankroll -= bet; // Drop the ball

      // The Physics Simulation: 8 rows means 8 left/right decisions
      let position = 0;
      for (let r = 0; r < rows; r++) {
        if (Math.random() < 0.5) {
          position++; // Ball bounced right
        }
        // If it bounces left, position stays the same
      }

      // Record the landing spot
      bins[position]++;
      
      // Calculate payout
      const payout = bet * multipliers[position];
      current_bankroll += payout;

      if (multipliers[position] > 1) wins++;
      else losses++;

      // Snapshot optimization for the line chart
      if (balls <= 100 || i % Math.ceil(balls / 100) === 0 || i === balls || current_bankroll < bet) {
        history.push({ round: i, bankroll: parseFloat(current_bankroll.toFixed(2)) });
      }
    }

    // Mathematical Expected Value (EV) calculation using Binomial Coefficients
    const binomCoeffs = [1, 8, 28, 56, 70, 56, 28, 8, 1]; // Total paths = 256
    let evMultiplier = 0;
    for(let i = 0; i < 9; i++) {
      evMultiplier += (binomCoeffs[i] / 256) * multipliers[i];
    }
    // Theoretical EV for the entire session
    const expected_value = (evMultiplier * bet - bet) * balls;

    const result_summary = { 
      wins, losses, final_bankroll: current_bankroll, 
      bins, bankrupt: current_bankroll < bet, history 
    };

    const newSim = await pool.query(
      `INSERT INTO simulations (user_id, simulation_type, parameters_json, total_trials, expected_value, result_summary) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, 'Plinko', JSON.stringify({ starting_bankroll, bet_amount, rows }), balls, expected_value, JSON.stringify(result_summary)]
    );
    const pnl = current_bankroll - starting_bankroll;
    req.io.emit('live_feed', { 
      environment: 'Plinko', 
      user: req.user?.name || 'Global Analyst',
      message: `dropped ${balls} balls. Net PnL: ${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toLocaleString(undefined, {maximumFractionDigits: 2})}`
    });
    res.json(newSim.rows[0]);
  } catch (err) {
    console.error('Plinko Error:', err.message);
    res.status(500).json({ error: 'Server error during simulation' });
  }
});

// 6. Mines Matrix Simulator (Hypergeometric Distribution)
app.post('/api/simulations/mines', verifyToken, async (req, res) => {
  try {
    const { starting_bankroll, bet_amount, mine_count, target_picks, total_rounds } = req.body;
    
    let current_bankroll = Number(starting_bankroll);
    const bet = Number(bet_amount);
    const mines = Number(mine_count);
    const picks = Number(target_picks);
    const rounds = Number(total_rounds);
    const totalTiles = 25;

    // Validation
    if (mines < 1 || mines > 24) return res.status(400).json({ error: 'Mines must be between 1 and 24' });
    if (picks < 1 || picks > (totalTiles - mines)) return res.status(400).json({ error: 'Invalid number of target picks' });

    // Mathematical Probability of picking 'picks' safe tiles in a row (Without Replacement)
    let winProbability = 1;
    for (let i = 0; i < picks; i++) {
      winProbability *= (totalTiles - mines - i) / (totalTiles - i);
    }

    // Standard Casino Multiplier Calculation (Fair Math * ~99% RTP to give the house a 1% edge)
    const fairMultiplier = 1 / winProbability;
    const casinoMultiplier = fairMultiplier * 0.99; 

    let wins = 0;
    let losses = 0;
    let history = [{ round: 0, bankroll: current_bankroll }];

    // Monte Carlo Simulation Loop
    for (let i = 1; i <= rounds; i++) {
      if (current_bankroll < bet) {
        history.push({ round: i, bankroll: current_bankroll, event: 'BANKRUPT' });
        break;
      }

      current_bankroll -= bet;

      // Execute the probability trial
      if (Math.random() < winProbability) {
        current_bankroll += bet * casinoMultiplier;
        wins++;
      } else {
        losses++; // Hit a mine
      }

      // Snapshot optimization for Recharts
      if (rounds <= 100 || i % Math.ceil(rounds / 100) === 0 || i === rounds || current_bankroll < bet) {
        history.push({ round: i, bankroll: parseFloat(current_bankroll.toFixed(2)) });
      }
    }

    // Generate one mock 5x5 grid for the frontend visualizer (just for visual flair)
    let sampleGrid = Array(25).fill('safe');
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      let randIndex = Math.floor(Math.random() * 25);
      if (sampleGrid[randIndex] === 'safe') {
        sampleGrid[randIndex] = 'mine';
        minesPlaced++;
      }
    }

    const expected_value_per_bet = (winProbability * (bet * casinoMultiplier)) - ((1 - winProbability) * bet);

    const result_summary = { 
      wins, 
      losses, 
      final_bankroll: current_bankroll, 
      win_probability: winProbability,
      multiplier: casinoMultiplier,
      sample_grid: sampleGrid,
      bankrupt: current_bankroll < bet,
      history 
    };

    const newSim = await pool.query(
      `INSERT INTO simulations (user_id, simulation_type, parameters_json, total_trials, expected_value, result_summary) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, 'Mines', JSON.stringify({ starting_bankroll, bet_amount, mine_count, target_picks }), rounds, expected_value_per_bet, JSON.stringify(result_summary)]
    );
    const pnl = current_bankroll - starting_bankroll;
    req.io.emit('live_feed', { 
      environment: 'Mines Matrix', 
      user: req.user?.name || 'Global Analyst',
      message: `Mapsd a ${mines}-mine grid for ${rounds} rounds. Net PnL: ${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toLocaleString(undefined, {maximumFractionDigits: 2})}`
    });
    res.json(newSim.rows[0]);
  } catch (err) {
    console.error('Mines Error:', err.message);
    res.status(500).json({ error: 'Server error during Mines simulation' });
  }
});

// 8. Quantitative Investment Portfolio Simulator (Monte Carlo Engine)
app.post('/api/simulations/portfolio', verifyToken, async (req, res) => {
  try {
    const { 
      initial_investment, 
      monthly_contribution, 
      years, 
      expected_return, 
      volatility, 
      simulations, 
      target_wealth 
    } = req.body;

    const p_init = Number(initial_investment);
    const p_sip = Number(monthly_contribution);
    const p_years = Number(years);
    const p_sims = Number(simulations);
    const p_target = Number(target_wealth);

    // Convert annual nominal percentages to monthly decimals
    const annualReturnDec = Number(expected_return) / 100;
    const annualVolDec = Number(volatility) / 100;
    
    const totalMonths = p_years * 12;
    const monthlyReturn = annualReturnDec / 12;
    const monthlyVol = annualVolDec / Math.sqrt(12);

    let finalValues = [];
    // We select 3 full sample paths (Best, Median, Worst) to chart as raw timelines
    let samplePaths = []; 

    // Helper: Box-Muller Transform to generate Standard Normal Distributions (Mean=0, SD=1)
    const randomNormal = () => {
      let u = 0, v = 0;
      while(u === 0) u = Math.random(); 
      while(v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    // Execute Monte Carlo Core Processing Loop
    for (let sim = 0; sim < p_sims; sim++) {
      let currentBalance = p_init;
      let pathTimeline = [currentBalance];

      for (let month = 1; month <= totalMonths; month++) {
        // Geometric Brownian Motion step
        const shock = randomNormal() * monthlyVol;
        const growthFactor = Math.exp(monthlyReturn - 0.5 * Math.pow(monthlyVol, 2) + shock);
        
        currentBalance = (currentBalance * growthFactor) + p_sip;
        
        // Save raw path sequence for the first few iterations as candidates
        if (sim < 15) {
          pathTimeline.push(parseFloat(currentBalance.toFixed(2)));
        }
      }
      
      finalValues.push({ simIndex: sim, value: currentBalance });
      if (sim < 15) {
        samplePaths.push({ simIndex: sim, timeline: pathTimeline });
      }
    }

    // Sort the outcomes ascending to extract precise percentiles
    finalValues.sort((a, b) => a.value - b.value);

    const valuesOnly = finalValues.map(v => v.value);
    const sum = valuesOnly.reduce((acc, curr) => acc + curr, 0);
    
    const meanValue = sum / p_sims;
    const minOutcome = valuesOnly[0];
    const maxOutcome = valuesOnly[p_sims - 1];
    
    // Percentile Extraction
    const getPercentile = (p) => valuesOnly[Math.floor((p / 100) * (p_sims - 1))];
    const p10 = getPercentile(10);
    const p50 = getPercentile(50); // Median
    const p90 = getPercentile(90);

    // Probability of hitting target wealth calculation
    const successCount = valuesOnly.filter(v => v >= p_target).length;
    const targetProbability = (successCount / p_sims) * 100;

    // Isolate exact target paths matching Best, Median, and Worst for presentation
    const worstPath = samplePaths.reduce((prev, curr) => curr.timeline[totalMonths] < prev.timeline[totalMonths] ? curr : prev);
    const bestPath = samplePaths.reduce((prev, curr) => curr.timeline[totalMonths] > prev.timeline[totalMonths] ? curr : prev);
    
    // Pick a path closest to the median outcome
    const medianPath = samplePaths.reduce((prev, curr) => 
      Math.abs(curr.timeline[totalMonths] - p50) < Math.abs(prev.timeline[totalMonths] - p50) ? curr : prev
    );

    // Map the selected paths into a standard chart coordinate array format
    let timelineChartData = [];
    for (let m = 0; m <= totalMonths; m += Math.max(1, Math.ceil(totalMonths / 50))) {
      const yearMark = parseFloat((m / 12).toFixed(1));
      timelineChartData.push({
        month: m,
        year: `Yr ${yearMark}`,
        Worst: worstPath.timeline[m],
        Median: medianPath.timeline[m],
        Best: bestPath.timeline[m]
      });
    }

    // Generate dynamic histogram metrics bins (10 equal-width brackets)
    const binCount = 10;
    const range = maxOutcome - minOutcome;
    const binWidth = range / binCount;
    let histogramBins = Array(binCount).fill(0).map((_, i) => ({
      rangeLabel: `$${((minOutcome + (i * binWidth)) / 1000).toFixed(0)}k - $${((minOutcome + ((i + 1) * binWidth)) / 1000).toFixed(0)}k`,
      frequency: 0
    }));

    valuesOnly.forEach(val => {
      let binIdx = Math.floor((val - minOutcome) / binWidth);
      if (binIdx >= binCount) binIdx = binCount - 1;
      if (binIdx < 0) binIdx = 0;
      histogramBins[binIdx].frequency++;
    });

    const result_summary = {
      metrics: {
        mean: parseFloat(meanValue.toFixed(2)),
        median: parseFloat(p50.toFixed(2)),
        best: parseFloat(maxOutcome.toFixed(2)),
        worst: parseFloat(minOutcome.toFixed(2)),
        p10: parseFloat(p10.toFixed(2)),
        p90: parseFloat(p90.toFixed(2)),
        target_probability: parseFloat(targetProbability.toFixed(2))
      },
      charts: {
        timeline: timelineChartData,
        histogram: histogramBins
      }
    };

    // Persist configuration vectors and results into structural PG ledger
    const newSim = await pool.query(
      `INSERT INTO portfolio_simulations 
       (user_id, initial_investment, monthly_contribution, years, expected_return, volatility, simulations, target_wealth, summary_json) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        req.user.id, p_init, p_sip, p_years, expected_return, volatility, p_sims, p_target, JSON.stringify(result_summary)
      ]
    );
    req.io.emit('live_feed', { 
      environment: 'Portfolio Variance', 
      user: req.user.name || 'Global Analyst', // Uses the logged-in user's name if available!
      message: `executed a ${p_years}-year model. Delta: ${result_summary.metrics.median > p_init ? '+' : '-'}$${Math.abs(result_summary.metrics.median - p_init).toLocaleString()}`
    });
    res.json(newSim.rows[0]);
  } 
  catch (err) {
    console.error('Portfolio Simulation Core Error:', err.message);
    res.status(500).json({ error: 'Server error during structural risk evaluation' });
  }
});

// 9. Gambler's Ruin Simulator (Absorbing Markov Chains)
app.post('/api/simulations/gamblers-ruin', verifyToken, async (req, res) => {
  try {
    const { starting_bankroll, target_wealth, win_probability, bet_size, total_simulations } = req.body;
    
    const start = Number(starting_bankroll);
    const target = Number(target_wealth);
    const pWin = Number(win_probability) / 100; // Convert 47.3% to 0.473
    const bet = Number(bet_size);
    const sims = Number(total_simulations);

    if (start <= 0 || target <= start || bet <= 0) {
      return res.status(400).json({ error: 'Invalid barrier parameters' });
    }

    let successes = 0;
    let ruins = 0;
    let totalSteps = 0;
    let samplePaths = []; // Store a few walks to draw the chaotic line chart

    for (let i = 0; i < sims; i++) {
      let current = start;
      let steps = 0;
      let path = [{ step: 0, bankroll: current }];

      // Random walk loop: continue until absorbing barrier is hit (0 or target)
      while (current > 0 && current < target) {
        if (Math.random() < pWin) {
          current += bet;
        } else {
          current -= bet;
        }
        steps++;
        
        // Save the first 10 paths to visualize the "walk"
        if (i < 10) path.push({ step: steps, bankroll: current });

        // Safety break for mathematically infinite near-50/50 loops
        if (steps > 50000) break; 
      }

      totalSteps += steps;

      if (current >= target) {
        successes++;
        if (i < 10) path.push({ step: steps, bankroll: target, status: 'SUCCESS' });
      } else {
        ruins++;
        if (i < 10) path.push({ step: steps, bankroll: 0, status: 'RUIN' });
      }

      if (i < 10) samplePaths.push({ id: `Sim ${i+1}`, timeline: path });
    }

    // Theoretical Probability Formula for Gambler's Ruin
    const n = start / bet; // Units of starting bankroll
    const N = target / bet; // Units of target bankroll
    const q = 1 - pWin;
    let theoreticalSuccess = 0;

    if (pWin === 0.5) {
      theoreticalSuccess = n / N;
    } else {
      // (1 - (q/p)^n) / (1 - (q/p)^N)
      const ratio = q / pWin;
      theoreticalSuccess = (1 - Math.pow(ratio, n)) / (1 - Math.pow(ratio, N));
    }

    // Convert to percentages
    const theoreticalSuccessPct = Math.max(0, Math.min(100, theoreticalSuccess * 100));
    const empiricalSuccessPct = (successes / sims) * 100;
    const empiricalRuinPct = (ruins / sims) * 100;

    // Normalize timeline data for Recharts (merge multiple paths into one dataset)
    let maxSteps = Math.max(...samplePaths.map(p => p.timeline.length));
    maxSteps = Math.min(maxSteps, 1000); // Cap chart at 1000 steps for performance
    
    let chartData = [];
    for (let step = 0; step < maxSteps; step++) {
      let dataPoint = { step };
      samplePaths.forEach(path => {
        // If a path finished early, keep drawing its final state (0 or target) as a flat line
        if (step < path.timeline.length) {
          dataPoint[path.id] = path.timeline[step].bankroll;
        } else {
          dataPoint[path.id] = path.timeline[path.timeline.length - 1].bankroll;
        }
      });
      chartData.push(dataPoint);
    }

    const result_summary = { 
      successes, 
      ruins, 
      empirical_success: empiricalSuccessPct,
      empirical_ruin: empiricalRuinPct,
      theoretical_success: theoreticalSuccessPct,
      avg_steps: Math.round(totalSteps / sims),
      chart_data: chartData,
      paths: samplePaths.map(p => p.id) // Pass path names for dynamic Line generation
    };

    // Use standard simulations table
    const newSim = await pool.query(
      `INSERT INTO simulations (user_id, simulation_type, parameters_json, total_trials, expected_value, result_summary) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, "Gambler's Ruin", JSON.stringify({ starting_bankroll, target_wealth, win_probability, bet_size }), sims, 0, JSON.stringify(result_summary)]
    );
    req.io.emit('live_feed', { 
      environment: "Gambler's Ruin", 
      user: req.user.name || 'Global Analyst',
      message: `ran ${sims} Markov chains. Empirical Ruin Rate: ${empiricalRuinPct.toFixed(1)}%`
    });
    res.json(newSim.rows[0]);
  } catch (err) {
    console.error("Gambler's Ruin Error:", err.message);
    res.status(500).json({ error: 'Server error during absorbing barrier simulation' });
  }
});
// ==========================================
// DASHBOARD ANALYTICS ROUTE
// ==========================================

// Bulletproof Dashboard Analytics Aggregator
app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Total Simulations (Safely counting across both tables)
    const totalSimsQuery = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM simulations WHERE user_id = $1) + 
        (SELECT COUNT(*) FROM portfolio_simulations WHERE user_id = $1) as total
    `, [userId]);

    // 2. Most Tested Environment
    const focusQuery = await pool.query(`
      SELECT simulation_type, COUNT(*) as play_count 
      FROM (
        SELECT simulation_type FROM simulations WHERE user_id = $1
        UNION ALL
        SELECT 'Portfolio Variance' as simulation_type FROM portfolio_simulations WHERE user_id = $1
      ) as combined
      GROUP BY simulation_type ORDER BY play_count DESC LIMIT 1
    `, [userId]);

    // 3. Smart Execution Audit Ledger (Using COALESCE to protect against missing columns)
    const recentRunsQuery = await pool.query(`
      SELECT 
        simulation_type, 
        created_at, 
        COALESCE(parameters_json, '{}'::jsonb) as parameters_json, 
        COALESCE(result_summary, '{}'::jsonb) as summary 
      FROM simulations WHERE user_id = $1
      UNION ALL
      SELECT 
        'Portfolio Variance' as simulation_type, 
        created_at, 
        COALESCE(parameters_json, '{}'::jsonb) as parameters_json, 
        COALESCE(summary_json, '{}'::jsonb) as summary 
      FROM portfolio_simulations WHERE user_id = $1
      ORDER BY created_at DESC LIMIT 5
    `, [userId]);

    // Dynamically format the ledger records
    const formattedRuns = recentRunsQuery.rows.map(run => {
      let bankrupt = false;
      let primaryMetric = '---';
      let deltaStr = 'Macro Eval';
      let isPositive = false;

      // Safely parse JSON blocks
      const params = typeof run.parameters_json === 'string' ? JSON.parse(run.parameters_json) : (run.parameters_json || {});
      const summary = typeof run.summary === 'string' ? JSON.parse(run.summary) : (run.summary || {});

      if (!summary || Object.keys(summary).length === 0) {
        return {
          type: run.simulation_type,
          date: run.created_at,
          bankrupt: false,
          primaryMetric: 'No Data',
          deltaStr: '---',
          isPositive: false
        };
      }

      if (run.simulation_type === "Gambler's Ruin") {
         primaryMetric = `${Number(summary.empirical_ruin || 0).toFixed(1)}% Ruin Rate`;
      } 
      else if (run.simulation_type === 'Portfolio Variance') {
         if (summary.metrics) {
           primaryMetric = `$${Number(summary.metrics.median || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`;
           const initial = Number(params.initial_investment || 0);
           const sip = Number(params.monthly_contribution || 0);
           const duration = Number(params.years || 0);
           
           const totalInvested = initial + (sip * duration * 12);
           const pnl = Number(summary.metrics.median || 0) - totalInvested;
           isPositive = pnl >= 0;
           deltaStr = isPositive ? `+$${pnl.toLocaleString(undefined, {maximumFractionDigits: 0})}` : `-$${Math.abs(pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}`;
         }
      } 
      else {
         bankrupt = summary.bankrupt === true || summary.bankrupt === 'true';
         primaryMetric = `$${Number(summary.final_bankroll || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}`;
         
         const startCap = Number(params.starting_bankroll || 0);
         const pnl = Number(summary.final_bankroll || 0) - startCap;
         isPositive = pnl >= 0;
         deltaStr = isPositive ? `+$${pnl.toLocaleString(undefined, {maximumFractionDigits: 2})}` : `-$${Math.abs(pnl).toLocaleString(undefined, {maximumFractionDigits: 2})}`;
      }

      return {
        type: run.simulation_type,
        date: run.created_at,
        bankrupt,
        primaryMetric,
        deltaStr,
        isPositive
      };
    });

    res.json({
      total_simulations: parseInt(totalSimsQuery.rows[0].total) || 0,
      primary_focus: focusQuery.rows.length > 0 ? focusQuery.rows[0].simulation_type : 'No Data Yet',
      recent_runs: formattedRuns
    });
  } catch (err) {
    console.error('Analytics Route Execution Error:', err.message);
    res.status(500).json({ error: 'Failed to aggregate portfolio metadata metrics' });
  }
});
server.listen(PORT, () => {
  console.log(`🚀 Server and WebSocket Engine running on http://localhost:${PORT}`);
});