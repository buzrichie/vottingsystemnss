require('dotenv').config();
const XLSX = require('xlsx');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const voteRoutes = require('./routes/vote');
const bcrypt = require('bcryptjs');
const adminRoutes = require('./routes/admin');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Admin = require('./models/Admin');
const setDeviceIdCookie = require('./utils/setDeviceIdCookie ');

const app = express();
app.set('trust proxy', true);

const baseURL = process.env.NODE_ENV==="production" ? process.env.BASE_URL : process.env.LOCAL_BASE_URL;
const corsOptions = {origin: baseURL,  credentials: true,  
  optionsSuccessStatus: 200  }
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());



mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected');

        const existingAdmin = await Admin.findOne({ role: 'admin' });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);

            const newAdmin = new Admin({
                username: 'admin',
                password: hashedPassword,
                role: 'admin'
            });

            await newAdmin.save();
            console.log('Default admin user created');
        } else {
            console.log('Admin user already exists');
        }

        // --- Read and Add Users from processed_data.xlsx ---
        const filePath = 'processed_data.xlsx'; 
        
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const votersDataFromExcel = XLSX.utils.sheet_to_json(worksheet);
        
            const bulkOps = [];
        
            for (const voterData of votersDataFromExcel) {
                // Prepare insert operation for each voter
                bulkOps.push({
                    insertOne: {
                        document: {
                            nssNumber: voterData['NSS NUMBER'],
                            // ghanaPay: voterData['GHANA PAY'],
                            // surname: voterData['SURNAME'],
                            // firstName: voterData['FIRST NAME'],
                            // placeOfPosting: voterData['PLACE OF POSTING'],
                            // institutionAttended: voterData['INSTITUTION ATTENDED'],
                            // qualification: voterData['QUALIFICATION'],
                            // district: voterData['DISTRICT'],
                            // region: voterData['REGION'],
                            hasVoted: false
                        }
                    }
                });
            }
        
            // Execute the bulk write operation
            Voter.bulkWrite(bulkOps, { ordered: false })
                .then(result => {
                    console.log(`${result.insertedCount} voters added to the database from ${filePath}`);
                })
                .catch(error => {
                    if (error.code === 11000) {
                        console.warn('Duplicate key error detected during bulk insert. Some voters may already exist.');
                    }
                    console.error('Error performing bulk insert:', error);
                });
        
        } catch (error) {
            console.error('Error reading or processing the Excel file:', error);
        }
        

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log(err));

app.use(setDeviceIdCookie);
app.use((req, res, next)=>{
  console.log('Requested path:', req.method);
  console.log('Requested path:', req.url);
  if( process.env.NODE_ENV!=="production" ){
  console.log('Requested body:', req.body);
  }
  next()
})

app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/server-time', (req, res) => {
    res.status(201).json({
        serverTime: new Date().toISOString()
    });
  });
app.get('/', (req, res) => {
    res.status(201).json({
    message: 'Welcome',
    path: req.originalUrl,
    });
  });
  