const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');

let db;
function openDatabase() {
  const dir = app.getPath('userData');
  fs.mkdirSync(dir, { recursive: true });
  db = new Database(path.join(dir, 'lestari-shop.sqlite'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS repairs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL, problem TEXT NOT NULL, cost REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', date TEXT NOT NULL, updated TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stock (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      qty INTEGER NOT NULL DEFAULT 0, cost REAL NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0, min INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS cash (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, date TEXT NOT NULL,
      amount REAL NOT NULL, category TEXT NOT NULL, note TEXT NOT NULL DEFAULT ''
    );
  `);
}

ipcMain.handle('lestari-db:load', () => {
  const repairs = db.prepare('SELECT * FROM repairs ORDER BY rowid DESC').all();
  const stock = db.prepare('SELECT * FROM stock ORDER BY rowid DESC').all();
  const cash = db.prepare('SELECT * FROM cash ORDER BY rowid DESC').all();
  return { repairs, stock, cash, empty: repairs.length === 0 && stock.length === 0 && cash.length === 0 };
});

ipcMain.handle('lestari-db:save', (_event, state) => {
  if (!state || !Array.isArray(state.repairs) || !Array.isArray(state.stock) || !Array.isArray(state.cash)) {
    throw new Error('Format data aplikasi tidak valid.');
  }
  const replaceAll = db.transaction((data) => {
    db.prepare('DELETE FROM repairs').run();
    db.prepare('DELETE FROM stock').run();
    db.prepare('DELETE FROM cash').run();
    const repair = db.prepare(`INSERT INTO repairs (id,name,phone,model,problem,cost,status,note,date,updated) VALUES (@id,@name,@phone,@model,@problem,@cost,@status,@note,@date,@updated)`);
    const stock = db.prepare(`INSERT INTO stock (id,name,category,qty,cost,price,min) VALUES (@id,@name,@category,@qty,@cost,@price,@min)`);
    const cash = db.prepare(`INSERT INTO cash (id,type,date,amount,category,note) VALUES (@id,@type,@date,@amount,@category,@note)`);
    for (const x of data.repairs) repair.run({ phone:'', note:'', cost:0, ...x });
    for (const x of data.stock) stock.run({ category:'Lainnya', qty:0, cost:0, price:0, min:0, ...x });
    for (const x of data.cash) cash.run({ note:'', ...x });
  });
  replaceAll(state);
  return { ok: true };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1180, height: 820, minWidth: 760, minHeight: 600,
    title: 'Lestari Shop Offline', backgroundColor: '#f2f5f4', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'lestari_shop_offline.html'));
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://wa.me/') || url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      if (url.startsWith('https://wa.me/') || url.startsWith('https://')) shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId('id.lestarishop.offline');
  openDatabase();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('before-quit', () => { if (db) db.close(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
