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

// SAVE (GLOBAL)
app.post("/save", (req, res) => {
    const { password, hours, minutes, nextDay } = req.body;

    const now = Date.now();
    let unlockTime;

    if (nextDay) {
        let d = new Date(now);
        d.setDate(d.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        unlockTime = d.getTime();
    } else {
        unlockTime =
            now +
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000);
    }

    const data = {
        password,
        unlockTime
    };

    saveData(data);

    res.send({
        success: true,
        unlockTime
    });
});

// GET PASSWORD
app.get("/get", (req, res) => {
    const data = loadData();

    if (!data.password) {
        return res.send({ error: "No password set" });
    }

    const now = Date.now();

    if (now < data.unlockTime) {
        return res.send({
            locked: true,
            remaining: data.unlockTime - now,
            unlockTime: data.unlockTime
        });
    }

    res.send({
        locked: false,
        password: data.password
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
