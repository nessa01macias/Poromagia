const express = require('express')
const app = express()
const port = 3000

const { spawn } = require('child_process');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/cardid', (req, res) => {

  let cardID = req.query.filepath;
  // let option = req.query.option;
  // if (req.query.parameter1 && req.query.parameter2) {
  //   let parameter1 = req.query.parameter1
  //   let parameter2 = req.query.parameter2
  // }

  let childPython = spawn('python', ['get_match_and_sort.py', cardID, 0, 1, 2])

  childPython.stdout.on('data', (data) => {
    console.log(data.toString());
    res.send(data)
  });

  childPython.stderr.on('data', (data) => {
    console.log('stderr:', data.toString());
  });

  childPython.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  })
})

app.listen(port, () => {
  console.log(`Express app listening at ${port}`)
})

