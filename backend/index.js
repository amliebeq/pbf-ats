const express = require("express");
const cors = require("cors");

const app = express();

app.use(
    cors({
        origin: "http://localhost:3000",
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./routes/users'));
app.use('/api/applicants', require('./routes/applicants'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/lists', require('./routes/lists'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT}`));