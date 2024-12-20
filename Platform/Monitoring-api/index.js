const express = require('express');
const mysql = require('mysql2/promise');
const promClient = require('prom-client');
const app = express();
const port = 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};
let db;

async function initializeDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to the MySQL database.');
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

initializeDatabase();
app.use(express.json());

// Endpoint para insertar datos en la tabla RAM
/* app.post('/ram', async (req, res) => {
  const { total_ram, free_ram, used_ram, percentage_used } = req.body;
  const query = 'INSERT INTO RAM (TOTAL, FREE, USED, PERCENTAGE) VALUES (?, ?, ?, ?)';
  try {
    await db.execute(query, [total_ram, free_ram, used_ram, percentage_used]);
    res.status(200).send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
}); */

app.post('/ram', async (req, res) => {
  const { total_ram, free_ram, used_ram, percentage_used } = req.body;
  console.log("Datos recibidos:", req.body);
  if (total_ram === undefined || free_ram === undefined || used_ram === undefined || percentage_used === undefined) {
    return res.status(400).send('Datos inválidos');
  }
  const query = 'INSERT INTO RAM (TOTAL, FREE, USED, PERCENTAGE) VALUES (?, ?, ?, ?)';
  try {
    await db.execute(query, [total_ram, free_ram, used_ram, percentage_used]);
    res.status(200).send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
});

// Endpoint para insertar datos en la tabla CPU
app.post('/cpu', async (req, res) => {
  const { percentage_used, tasks } = req.body;
  const query = 'INSERT INTO CPU (PERCENTAGE) VALUES (?)';
  try {
    const [result] = await db.execute(query, [percentage_used]);
    const cpuId = result.insertId;

    const taskQuery = 'INSERT INTO PROCESS (CPU_ID, PID, NAME, USER, STATE, RAM) VALUES (?, ?, ?, ?, ?, ?)';
    for (const task of tasks) {
      await db.execute(taskQuery, [cpuId, task.pid, task.name, task.user, task.state, task.ram]);
    }

    res.status(200).send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
});




app.post('/data', async (req, res) => {
  const { total_ram, free_ram, used_ram, percentage_used } = req.body;
  const query = 'INSERT INTO RAM (TOTAL, FREE, USED, PERCENTAGE) VALUES (?, ?, ?, ?)';
  try {
    await db.execute(query, [total_ram, free_ram, used_ram, percentage_used]);
    res.status(200).send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
});

app.get('/process', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM RAM');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener los procesos', err);
    res.status(500).json({ error: "Error al obtener los procesos" });
  }
});

// Endpoint para exponer métricas en formato Prometheus
// Endpoint para exponer métricas en formato Prometheus

const cpuUsageGauge = new promClient.Gauge({ name: 'cpu_usage', help: 'CPU Usage' });
const ramUsageGauge = new promClient.Gauge({ name: 'ram_usage', help: 'RAM Usage' });
const processCountGauge = new promClient.Gauge({ name: 'process_count', help: 'Number of Processes' });
const processMetrics = new promClient.Gauge({
  name: 'process_info',
  help: 'Detailed process information',
  labelNames: ['pid', 'name', 'user', 'state', 'ram']
});
app.get('/metrics', async (req, res) => {
  try {
    const [cpuRows] = await db.execute('SELECT * FROM CPU');
    const [ramRows] = await db.execute('SELECT * FROM RAM');
    const [processRows] = await db.execute('SELECT * FROM PROCESS');

    // Métricas de CPU
    cpuRows.forEach(row => {
      const percentage = parseFloat(row.PERCENTAGE);
      if (!isNaN(percentage)) {
        cpuUsageGauge.set(percentage);
      } else {
        console.error('Invalid CPU usage value:', row.PERCENTAGE);
      }
    });

    // Métricas de RAM
    ramRows.forEach(row => {
      const percentage = parseFloat(row.PERCENTAGE);
      if (!isNaN(percentage)) {
        ramUsageGauge.set(percentage);
      } else {
        console.error('Invalid RAM usage value:', row.PERCENTAGE);
      }
    });

    // Conteo de Procesos
    if (typeof processRows.length === 'number') {
      processCountGauge.set(processRows.length);
    } else {
      console.error('Invalid process count value:', processRows.length);
    }

    // Métricas detalladas de Procesos
    processRows.forEach(row => {
      const ram = parseFloat(row.RAM);
      if (!isNaN(ram)) {
        processMetrics.set({
          pid: row.PID,
          name: row.NAME,
          user: row.USER,
          state: row.STATE,
          ram: ram
        }, ram);
      } else {
        console.error('Invalid RAM value for process:', row.RAM);
      }
    });

    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).send('Error fetching metrics');
  }
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });