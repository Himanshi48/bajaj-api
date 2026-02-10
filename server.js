const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EMAIL = process.env.EMAIL;


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});



function fibonacci(n) {
  if (n <= 0) return [];
  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++)
    if (num % i === 0) return false;
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(arr) {
  const lcm2 = (a, b) => (a * b) / gcd(a, b);
  return arr.reduce((a, b) => lcm2(a, b));
}

async function askAI(question){
  try{
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents:[{parts:[{text:question}]}]
      },
      {
        params:{ key: process.env.GEMINI_KEY }
      }
    );

    let text = res.data.candidates[0].content.parts[0].text;

    let words = text.replace(/[^a-zA-Z ]/g, "").split(" ");
    let lastWord = words[words.length - 1];

    return lastWord;

  }catch(err){
    console.log(err.response?.data || err.message);
    return "Error";
  }
}


app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Only one key allowed"
      });
    }

    const key = keys[0];
    let result;

    switch (key) {
      case "fibonacci":
        if (typeof body.fibonacci !== "number")
          throw "Invalid fibonacci input";
        result = fibonacci(body.fibonacci);
        break;

      case "prime":
        if (!Array.isArray(body.prime))
          throw "Invalid prime input";
        result = body.prime.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body.lcm))
          throw "Invalid lcm input";
        result = lcm(body.lcm);
        break;

      case "hcf":
        if (!Array.isArray(body.hcf))
          throw "Invalid hcf input";
        result = hcf(body.hcf);
        break;

      case "AI":
        if (typeof body.AI !== "string")
          throw "Invalid AI input";
        result = await askAI(body.AI);
        break;

      default:
        return res.status(400).json({
          is_success: false,
          message: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });

  } catch (err) {
    res.status(500).json({
      is_success: false,
      message: err.toString()
    });
  }
});

app.listen(PORT, () => console.log("Server running on", PORT));