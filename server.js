const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const FILE = "data.json";

function loadData() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE));
}

function saveData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.post("/login", (req, res) => {
    const { email } = req.body;
    const data = loadData();

    if (!data[email]) {
        data[email] = {};
        saveData(data);
    }

    res.send({ success: true });
});

app.post("/save", (req, res) => {
    const { email, password, hours, nextDay } = req.body;
    const data = loadData();

    const now = Date.now();
    let unlockTime;

    if (nextDay) {
        let d = new Date(now);
        d.setDate(d.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        unlockTime = d.getTime();
    } else {
        unlockTime = now + hours * 3600000;
    }

    data[email] = { password, unlockTime };
    saveData(data);

    res.send({ success: true });
});

app.post("/get", (req, res) => {
    const { email } = req.body;
    const data = loadData();

    if (!data[email]) {
        return res.send({ error: "No data" });
    }

    const now = Date.now();

    if (now < data[email].unlockTime) {
        return res.send({
            locked: true,
            remaining: data[email].unlockTime - now
        });
    }

    res.send({
        locked: false,
        password: data[email].password
    });
});

app.listen(3000, () => console.log("Server running"));
