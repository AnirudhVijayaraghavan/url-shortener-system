
// SUBMITURL CODE
router.post('/submiturl', async (req, res) => {
    //CODE TO CHECK IF ONLY BASIC AUTHENTICATION IS SELECTED
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic') === -1) {
        return res.status(403).json({
            message: 'Forbidden'
        })
    }

    //CODE TO CHECK ONLY AUTHENTICATION
    // Extract and decode Base64 credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    try {
        // Query user from the database
        const userResult = await pool3.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).send('Email not found');
        }

        const user = userResult.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Authentication failed');
        }

        // URL Shortening
        let longUrl = req.body.longUrl;
        const urlExists = await pool3.query('SELECT * FROM urls WHERE longurl=$1', [longUrl]);
        if (longUrl == null) {
            res.status(400).send('Give a json input in this format : {"longUrl":"<yoururl>"}');
        }
        else if (urlExists.rows.length > 0) {


            return res.status(400).send('URL already exists');

        }
        // Check if email already exists

        else {
            const placeholder12345 = "placeholder123456";
            // Save the URL mapping in the database
            const newUrl = await pool3.query(
                'INSERT INTO urls (longurl, shorturl) VALUES ($1, $2)',
                [longUrl, placeholder12345]
            );
            const baseUrl = 'http://shortenify.anirudhvijayaraghavan.me/';
            const shortUrl = await pool3.query(
                'UPDATE urls SET shorturl = $1 || (select SUBSTRING(id::TEXT FROM 1 FOR 10) from urls where longurl = $2) WHERE longurl = $2', [baseUrl, longUrl]);

            const fetchedresult = await pool3.query(
                'SELECT shorturl FROM urls WHERE longurl = $1',
                [longUrl]
            );
            console.log(fetchedresult.rows[0].shorturl)
            const fetchedresultuser = await pool3.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );
            console.log(fetchedresultuser.rows[0].id)
            const newuserurlentry = await pool3.query(
                'INSERT INTO user_urls (userid, userurl) VALUES ($1, $2)',
                [fetchedresultuser.rows[0].id, fetchedresult.rows[0].shorturl]
            );
            console.log(fetchedresult.rows[0].shorturl);

            const updatetiercountuser = await pool3.query(
                'update users set tier_count = tier_count - 1 WHERE email = $1', [email]
            );

            res.status(201).send(fetchedresult.rows[0].shorturl);
            // Replace with your actual base URL
            const fullShortUrl = baseUrl + shortUrl;
        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// // Passwords match, proceed with storing and retrieving urls.
                                // Urls.findOrCreate({
                                //     where: {
                                //         longurl: longUrl,
                                //     },
                                //     defaults: {
                                //         // other fields you want to set for the new record if it's created
                                //         shorturl: 'http://shortenify.anirudhvijayaraghavan.me/' + String(Math.floor(Math.random() * 100000000)), // Replace with actual logic to generate short URL
                                //         // Add other fields if necessary
                                //     }
                                // }).then(([urlfound, created]) => {
                                //     if (created) {
                                //         res.status(200).json(urlfound.shorturl);
                                //         console.log("New URL added:", urlfound.shorturl);
                                //         //Creating relation in acc_assignment table.
                                //         const newuser_url = {
                                //             userid: user.id,
                                //             userurl: urlfound.shorturl
                                //         };
                                //         User_Urls.create(newuser_url)
                                //             .then((createduserurl) => {
                                //                 console.log("New User_URL created")
                                //             })
                                //             .catch((error) => {
                                //                 console.error(error);
                                //             });
                                //     }


                                // }).catch(error => {
                                //     console.error('Error:', error);
                                //     res.status(500).send('Internal Server Error');
                                // });
                                // if (urlfound.longurl === longUrl) {
                                //     // Assignment with the specified ID found, respond with it
                                //     if (Object.keys(req.body).length > 0) {
                                //         console.log(req.body.points)
                                //         // Check for validation errors
                                //         const errors = validationResult(req);
                                //         if (!errors.isEmpty()) {
                                //             res.status(400).json({ error: 'Incomplete or bad parameters, check table specifications.' });
                                //             console.log(errors.array());
                                //         }
                                //         else {
                                //             // Passwords match, proceed with creating assignment.

                                //             const updatedAssignment = {
                                //                 name: req.body.name,
                                //                 points: req.body.points,
                                //                 num_of_attemps: req.body.num_of_attemps,
                                //                 deadline: req.body.deadline,
                                //             };

                                //             Assignment.update(
                                //                 updatedAssignment,
                                //                 {
                                //                     where: {
                                //                         id: req.params.id,
                                //                     },
                                //                 }
                                //             )
                                //                 .then((rowsUpdated) => {
                                //                     if (rowsUpdated > 0) {
                                //                         // Records updated successfully
                                //                         res.status(204).json({ error: 'Record updated.' }); // No content response
                                //                     } else {
                                //                         // No changes made.
                                //                         res.status(404).json({ error: 'No Changes made.' });
                                //                     }
                                //                 })
                                //                 .catch((error) => {
                                //                     console.error(error);
                                //                 });
                                //         }
                                //     }
                                //     else {
                                //         res.status(400).json({ error: 'Incomplete or bad parameters, check table specifications.' });
                                //     }
                                // } else {
                                //     res.status(401).json({ error: 'Unauthorized' });
                                // }

                                // .catch((error) => {
                                //     res.status(404).json({ error: 'Error in ' });
                                //     console.error(error);
                                // });



// REDIRECTION CODE  :
router.get('/:shortId', async (req, res) => {
    try {
        let fullUrl = "http://shortenify.anirudhvijayaraghavan.me/" + req.params.shortId
        console.log(fullUrl)
        const result = await pool4.query(
            'SELECT longurl FROM Urls WHERE shorturl = $1',
            [fullUrl]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('URL not found');
        }
        const originalUrl = result.rows[0].longurl;
        console.log(originalUrl)
        res.redirect("https://" + originalUrl);
        // res.status(203).send('found');
        //res.redirect(rows[0].longurl);


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// GETALLURLS CODE : 
router.get('/user/getallurls', async (req, res) => {
    //CODE TO CHECK IF ONLY BASIC AUTHENTICATION IS SELECTED
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic') === -1) {
        return res.status(403).json({
            message: 'Forbidden'
        })
    }
    //CODE TO CHECK ONLY AUTHENTICATION
    // Extract and decode Base64 credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    try {
        // Query user from the database
        const userResult = await pool5.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).send('Email not found');
        }

        const user = userResult.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Authentication failed');
        }

        // Fetching data
        console.log(userResult.rows[0].id)
        const fetchingdatafull = await pool5.query('SELECT * FROM user_urls WHERE userid=$1', [userResult.rows[0].id]);
        if (fetchingdatafull == null) {
            res.status(404).send('No urls found with the authenticated user');
        }

        else {

            console.log(fetchingdatafull.rows);
            res.status(200).send(fetchingdatafull.rows);

        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
