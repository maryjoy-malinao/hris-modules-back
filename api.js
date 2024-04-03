const express = require('express');
const app = express();
const Joi = require('joi');
const cors = require('cors')
const MySQL = require("mysql")
const { Port, WebServiceKey, MySQLConfig, MySQLDB } = require('./config');

app.use(express.json(), cors());

const JoiErrorMsg = { error: true, message: 'An Authorized Person' }
const WsKey = WebServiceKey();
const mysql = MySQLConfig(MySQL)

app.post('/signup', (req, res) => {
    const { error } = ValidateSignup(req.body);

    if (req.body.key === WsKey) {
        const { email, uname, pass } = req.body;
        if (req.body) {
            console.log('emp');
        }
        console.log(email, uname, pass);

        // const qry = `INSERT INTO ${MySQLDB()}.users (email, username, password) VALUES ("${email}", "${uname}", "${pass}")`

        // mysql.query(qry, (err) => {
        //     if(err){
        //         console.log(err);
        //         res.send({error: true})
        //     }
        //     res.send({error: false, message: 'Successfully Insert'})
        // })
    } else {
        res.status(401).send(JoiErrorMsg);
    }


});


app.post('/get-user', (req, res) => {
    const { error } = ValidateKey(req);

    if (req.body.key === WsKey) {
        const { email, pass } = req.body;
        const qry = `SELECT count(*) as count FROM ${MySQLDB()}.users WHERE email="${email}" AND password="${pass}"`

        mysql.query(qry, (err, recset) => {
            if (err) {
                console.log(err);
                res.send({ error: true })
            }

            if (recset[0].count) {

                res.send({ error: false, errMsg: '', message: 'Account Exist' });
            }
            else res.send({ error: false, errMsg: "Account Doesn't Exist", message: "" })

        })
    } else {
        res.status(401).send(JoiErrorMsg);
    }


});


app.post('/update-user/:id', (req, res) => {
    const { error } = ValidateSignup(req.body);

    if (!error) {
        if (req.body.key === WsKey) {
            const { email, uname, pass } = req.body;

            const qry = `UPDATE  ${MySQLDB()}.users SET email='${email}', username='${uname}',
            password='${pass}' WHERE id=${req.params.id}`

            mysql.query(qry, (err, recset) => {
                if (err) {
                    console.log(err);
                    res.send({ error: true })
                }

                if (recset.changedRows) res.send({ error: false, message: "Successfully Update" });
                else res.send({ error: false, message: "This account doesn't exists" });
            })
        } else {
            res.status(401)
        }

    } else res.status(401).send(JoiErrorMsg);
});

app.post('/delete-user/:id', (req, res) => {
    const { error } = ValidateKey(req.body);

    if (!error) {
        if (req.body.key === WsKey) {
            const qry = `DELETE FROM ${MySQLDB()}.users WHERE id=${req.params.id}`

            mysql.query(qry, (err, recset) => {
                if (err) {
                    console.log(err);
                    res.send({ error: true })
                }

                if (recset.affectedRows) res.send({ error: false, message: "Successfully Delete" });
                else res.send({ error: false, message: "This account doesn't exists" });
            })
        } else {
            res.status(401)
        }

    } else res.status(401).send(JoiErrorMsg);
});


/***********************JOBS***************************** */

//INSERT
app.post('/insert-job', (req, res) => {
    if (req.body.key === WsKey) {
        const { job_title, job_location, job_desc, job_type, job_specialization, job_career } = req.body;

        if (!job_title || !job_location || !job_desc || !job_type || !job_specialization || !job_career) {
            return res.send({ error: true, message: 'Please make sure all required fields are filled out properly.' })
        }
        const qry = `INSERT INTO ${MySQLDB()}.jobs 
        (job_title, job_specialization, job_location, job_desc, job_type, job_career) VALUES 
        ("${job_title}", "${job_specialization}", "${job_location}", '${job_desc}', "${job_type}", "${job_career}")`

        mysql.query(qry, (err) => {
            if (err) {
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                res.send({ error: false, message: 'Successfully Insert' })
            }

        })
    } else {
        res.status(401).send(JoiErrorMsg);
    }
});


//READ
app.post('/get-jobs', (req, res) => {
    if (req.body.key === WsKey) {
        const sort = req.body.sortby;

        let qry, table;
        let searchValue = 'WHERE job_delete = "N" ';
        if (sort) {
            if (sort.includes('specialization')) {
                table = 'job_specialization';
            } else if (sort.includes('title')) {
                table = 'job_title'
            }
            table += sort.includes('desc') ? ' DESC' : ' ASC';

            let regex = /search=([^&]*)/;

            // Execute the regular expression and get the search value
            let match = sort.match(regex);
            searchValue += match ? ` AND job_title LIKE '%${match[1]}%' OR job_specialization LIKE '%${match[1]}%'` : ' ';


        } else {
            table = `job_id DESC`
        }

        qry = `SELECT * FROM ${MySQLDB()}.jobs ${searchValue} ORDER BY ${table}`
        mysql.query(qry, (err, recset) => {
            if (err) {
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                res.send({ error: false, message: recset })
            }
        })

    } else {
        res.status(401).send(JoiErrorMsg);
    }
});


//READ
app.post('/get-jobs-by-status', (req, res) => {
    if (req.body.key === WsKey) {

        let qry = `SELECT * FROM ${MySQLDB()}.jobs WHERE job_delete = 'N' AND job_status = 'Active' ORDER BY job_id desc`
        mysql.query(qry, (err, recset) => {
            if (err) {
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                res.send({ error: false, message: recset })
            }
        })

    } else {
        res.status(401).send(JoiErrorMsg);
    }
});



//READ BY ID
app.post('/get-jobbyid', (req, res) => {
    if (req.body.key === WsKey) {
        const qry = `SELECT job_title FROM ${MySQLDB()}.jobs WHERE job_delete = 'N' AND job_id=${req.body.jobid}`

        mysql.query(qry, (err, recset) => {
            if (err) {
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                res.send({ error: false, message: recset })
            }

        })
    } else {
        res.status(401).send(JoiErrorMsg);
    }


});


//UPDATE BY STATUS
app.post('/update-status', (req, res) => {
    if (req.body.key === WsKey) {

        const status = req.body.status === 'Active' ? 'Inactive' : 'Active';
        const qry = `UPDATE ${MySQLDB()}.jobs SET job_status='${status}' WHERE job_id='${req.body.jobid}'`

        mysql.query(qry, (err, recset) => {
            if (err) {
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                if (recset.changedRows) res.send({ error: false, message: "Successfully Update" });
                else {
                    res.send({ error: true, message: "Cannot update this job post" });
                }
            }
        })
    } else {
        res.status(401)
    }


});


//DELETE
app.post('/delete-job', (req, res) => {
    if (req.body.key === WsKey) {
        const qry = `UPDATE ${MySQLDB()}.jobs SET job_delete = 'Y' WHERE job_id=${req.body.jobid}`

        mysql.query(qry, (err, recset) => {
            if (err) {
                console.log(err);
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                if (recset.affectedRows) res.send({ error: false, message: "Successfully Delete" });
                else res.send({ error: false, message: "Cannot find this job post" });
            }


        })
    } else {
        res.status(401)
    }
});




//update
app.post('/update-job', (req, res) => {

    if (req.body.key === WsKey) {
        const { job_id, job_title, job_location, job_desc, job_type, job_specialization, job_career } = req.body;
        const replaceQuote = job_desc.replace(/"/g, "'");

        if (!job_title || !job_location || !job_desc || !job_type || !job_specialization || !job_career) {
            console.log('error');
            return res.send({ error: true, message: 'Please make sure all required fields are filled out properly.' })
        }

        const qry = `UPDATE ${MySQLDB()}.jobs SET 
        job_title="${job_title}",
        job_specialization="${job_specialization}",
        job_location="${job_location}",
        job_type="${job_type}",
        job_desc="${replaceQuote}",
        job_career="${job_career}"
        WHERE job_id='${job_id}'`

        mysql.query(qry, (err, recset) => {
            if (err) {
                console.log(err);
                res.send({ error: true })
            } else {
                if (recset.changedRows) res.send({ error: false, message: "Successfully Update" });
                else res.send({ error: true, message: "Cannot update this job post" });
            }
        })
    } else {
        res.status(401)
    }


});



//sort
app.post('/sort-jobs/:id', (req, res) => {

    if (req.body.key === WsKey) {
        // const val =  req.body.value;
        // const SELECT = `SELECT * FROM ${MySQLDB()}.jobs WHERE job_delete = 'N' ORDER BY`;

        // let qry = `${SELECT} job_Name desc`

        // switch(val){
        //     case 'job_title_asc':
        //         qry = `${SELECT} job_Name`
        //     break;
        //     case 'specia_asc':
        //         qry = `${SELECT} Specialization`
        //     break;
        //     case 'specia_desc':
        //         qry = `${SELECT} Specialization desc`    
        //     break;          
        // }

        // mysql.query(qry, (err, recset) => {
        //     if(err){
        //         console.log(err);
        //         res.send({error: true})
        //     }

        //     res.send({error: false, errMsg: "", message: recset})
        // })
    } else {
        res.status(401)
    }
});



/***********************END JOBS***************************** */




/***********************Apply***************************** */


// app.post('/insert-applicant', (req, res) => {
//     const { personalInfo, educationInfo, employmentInfo, trainingInfo, referencesInfo, referralInfo } = req.body;
//     const { job_id, applicant_last, applicant_first, applicant_middle, applicant_gender, applicant_city, applicant_provincial, applicant_mobile, applicant_email, applicant_salary } = personalInfo;
//     const { applicant_elemName, applicant_elemAddress, applicant_elemYear, applicant_highName, applicant_highAddress, applicant_highYear, applicant_colName, applicant_colAddress, applicant_colYear } = educationInfo;
//     const { applicant_name1, applicant_relationship1, applicant_contact1, applicant_name2, applicant_relationship2, applicant_contact2,
//         applicant_name3, applicant_relationship3, applicant_contact3
//     } = referencesInfo;


//     const insertApplicantQuery = `
//     INSERT INTO ${MySQLDB()}.applicants 
//     (first_name, last_name, email, mobile_number, city, expected_salary, job_post_id, gender, provincial)
//     VALUES 
//     (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

//     const insertEducationQuery = `
//     INSERT INTO ${MySQLDB()}.education
//     (applicant_id, elementary_name, elementary_address, elementary_year,
//     highschool_name, highschool_address, highschool_year, college_name, 
//     college_address, college_year)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

//     const insertReferenceQuery = `
//     INSERT INTO ${MySQLDB()}.reference
//     (applicant_id, reference_name, reference_phone_number, relationship)
//     VALUES (?, ?, ?, ?);`;

//     const insertTrainingQuery = `
//     INSERT INTO ${MySQLDB()}.training_history
//     (applicant_id, training_name, completion_date, location)
//     VALUES (?, ?, ?, ?); `;

//     const insertEmploymentQuery = `
//     INSERT INTO ${MySQLDB()}.employment_history
//     (applicant_id, company_name, job_title, salary, reason, start_date, end_date)
//     VALUES (?, ?, ?, ?, ?, ?, ?);`;

//     const insertReferralQuery = `
//     INSERT INTO ${MySQLDB()}.referral
//     (applicant_id, referral_name, referral_phone_number, relationship)
//     VALUES (?, ?, ?, ?);`;

//     // Insert applicant data
//     mysql.query(insertApplicantQuery, [applicant_first, applicant_last, applicant_email, applicant_mobile, applicant_city, applicant_salary, job_id, applicant_gender, applicant_provincial], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.send({ error: true, message: 'Something went wrong' });
//             return;
//         }

//         applicantId = result.insertId;

//         // Insert education data
//         mysql.query(insertEducationQuery, [applicantId, applicant_elemName, applicant_elemAddress, applicant_elemYear, applicant_highName, applicant_highAddress, applicant_highYear, applicant_colName, applicant_colAddress, applicant_colYear], (err) => {
//             if (err) {
//                 console.log(err);
//                 res.send({ error: true, message: 'Something went wrong' });
//                 return;
//             }

//             // Insert reference data
//             const referenceValues = referralInfo.map(referral => [applicantId, referral.applicant_refName, referral.applicant_refContact, referral.applicant_refPosition]);
//             mysql.query(insertReferenceQuery, referenceValues, (err) => {
//                 if (err) {
//                     console.log(err);
//                     res.send({ error: true, message: 'Something went wrong' });
//                     return;
//                 }

//                 // Insert training data
//                 const trainingValues = trainingInfo.map(training => [applicantId, training.applicant_trainingTitle, training.applicant_trainingDate, training.applicant_trainingLocation]);
//                 mysql.query(insertTrainingQuery, trainingValues, (err) => {
//                     if (err) {
//                         console.log(err);
//                         res.send({ error: true, message: 'Something went wrong' });
//                         return;
//                     }

//                     // Insert employment data
//                     const employmentValues = employmentInfo.map(employment => [applicantId, employment.applicant_company, employment.applicant_position, employment.applicant_salary, employment.applicant_reason, employment.applicant_from, employment.applicant_to]);
//                     mysql.query(insertEmploymentQuery, employmentValues, (err) => {
//                         if (err) {
//                             console.log(err);
//                             res.send({ error: true, message: 'Something went wrong' });
//                             return;
//                         }

//                         // Insert referral data
//                         const referralValues = referralInfo.map(referral => [applicantId, referral.applicant_refName, referral.applicant_refContact, referral.applicant_refPosition]);
//                         mysql.query(insertReferralQuery, referralValues, (err) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.send({ error: true, message: 'Something went wrong' });
//                                 return;
//                             }

//                             res.send({ error: false, message: 'Successfully Insert' });
//                         });
//                     });
//                 });
//             });
//         });
//     });


// });
















app.post('/insert-applicant', (req, res) => {
    if (req.body.key === WsKey) {
        const { personalInfo, educationInfo, employmentInfo, trainingInfo, referencesInfo, referralInfo } = req.body;
        const { job_id, applicant_last, applicant_first, applicant_middle, applicant_gender, applicant_city, applicant_provincial, applicant_mobile, applicant_email, applicant_salary } = personalInfo;
        const { applicant_elemName, applicant_elemAddress, applicant_elemYear, applicant_highName, applicant_highAddress, applicant_highYear, applicant_colName, applicant_colAddress, applicant_colYear, college_course } = educationInfo;
        const { applicant_name1, applicant_relationship1, applicant_contact1, applicant_name2, applicant_relationship2, applicant_contact2,
            applicant_name3, applicant_relationship3, applicant_contact3
        } = referencesInfo;




        let qry1 = `INSERT INTO ${MySQLDB()}.applicants 
                    (first_name, last_name, email, mobile_number, city, expected_salary, job_post_id, gender, provincial, middle_name)
                    VALUES 
                    ("${applicant_first}", "${applicant_last}", "${applicant_email}", '${applicant_mobile}', "${applicant_city}", "${applicant_salary}",
                    ${job_id}, "${applicant_gender}", "${applicant_provincial}", "${applicant_middle}"
                    );

                    SET @id = LAST_INSERT_ID();

                    INSERT INTO ${MySQLDB()}.education
                    (applicant_id, elementary_name, elementary_address, elementary_year,
                    highschool_name, highschool_address, highschool_year, college_name, 
                    college_address, college_year, college_course)
                    VALUES 
                    (@id, "${applicant_elemName}", "${applicant_elemAddress}", "${applicant_elemYear}", 
                    "${applicant_highName}","${applicant_highAddress}","${applicant_highYear}", 
                    "${applicant_colName}", "${applicant_colAddress}", "${applicant_colYear}", "${college_course}");

                    INSERT INTO ${MySQLDB()}.reference
                    (applicant_id, reference_name, reference_phone_number, relationship)
                    VALUES 
                    (@id,  "${applicant_name1}", "${applicant_contact1}", "${applicant_relationship1}"),
                    (@id,  "${applicant_name2}", "${applicant_contact2}", "${applicant_relationship2}"), 
                    (@id,  "${applicant_name3}", "${applicant_contact3}", "${applicant_relationship3}");\n`;



        let qry2 = '';
        if (employmentInfo.length !== 0) {
            qry2 = `INSERT INTO ${MySQLDB()}.employment_history  (applicant_id, company_name, job_title, salary, reason, start_date, end_date) VALUES `;
            for (let i = 0; i < employmentInfo.length; i++) {
                const dateFrom = new Date(employmentInfo[i].applicant_from);
                const dateTo = new Date(employmentInfo[i].applicant_to);
                qry2 += `(@id, "${employmentInfo[i].applicant_company}", '${employmentInfo[i].applicant_position}', '${employmentInfo[i].applicant_salary}', '${employmentInfo[i].applicant_reason}', '${dateFrom.toISOString().split('T')[0]}', '${dateTo.toISOString().split('T')[0]}')`;
                if (i < employmentInfo.length - 1) {
                    qry2 += ', ';
                }
            }
        }

        let qry3 = '';
        if (trainingInfo.length !== 0) {
            qry3 = `INSERT INTO ${MySQLDB()}.training_history  (applicant_id, training_name, completion_date, location) VALUES `;
            for (let i = 0; i < trainingInfo.length; i++) {
                const date = new Date(trainingInfo[i].applicant_trainingDate);
                qry3 += `(@id, '${trainingInfo[i].applicant_trainingTitle}', '${date.toISOString().split('T')[0]}', '${trainingInfo[i].applicant_trainingLocation}')`;
                if (i < trainingInfo.length - 1) {
                    qry3 += ', ';
                }
            }
        }


        let qry4 = '';
        if (referralInfo.length !== 0) {
            qry4 = `INSERT INTO ${MySQLDB()}.referral  (applicant_id, referral_name, referral_position, referral_phone_number) VALUES `;
            for (let i = 0; i < referralInfo.length; i++) {
                qry4 += `(@id, '${referralInfo[i].applicant_refName}', '${referralInfo[i].applicant_refPosition}', '${referralInfo[i].applicant_refContact}')`;
                if (i < referralInfo.length - 1) {
                    qry4 += ', ';
                }
            }
        }


        const queries = qry1 + qry2 + ';' + qry3 + ';' + qry4;


        mysql.query(queries, (err) => {
            if (err) {
                console.log(err);
                res.send({ error: true, message: 'Something went wrong' });
            } else {
                res.send({ error: false, message: 'Successfully Insert' });
            }
        });


    } else {
        res.status(401).send(JoiErrorMsg);
    }


});



//READ by Pending
app.post('/get-applicant-pending', (req, res) => {
    if (req.body.key === WsKey) {

        let qry = `SELECT a.*, j.job_title FROM ${MySQLDB()}.applicants a JOIN ${MySQLDB()}.jobs j ON a.job_post_id=j.job_id  WHERE applicant_status='Pending' ORDER BY applicant_id desc`
        mysql.query(qry, (err, recset) => {
            if (err) {
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                res.send({ error: false, message: recset })
            }
        })

    } else {
        res.status(401).send(JoiErrorMsg);
    }
});


//READ by Examination
app.post('/get-applicant-exam-takers', (req, res) => {
    if (req.body.key === WsKey) {

        let qry = `SELECT a.*, j.job_title FROM ${MySQLDB()}.applicants a JOIN ${MySQLDB()}.jobs j ON a.job_post_id=j.job_id WHERE applicant_status='Examination' ORDER BY applicant_id desc`
        mysql.query(qry, (err, recset) => {
            if (err) {
                console.log(err);
                res.send({ error: true, message: 'Something went wrong' })
            } else {
                console.log(recset);
                res.send({ error: false, message: recset })
            }
        })

    } else {
        res.status(401).send(JoiErrorMsg);
    }
});




//READ BY ID
app.post('/get-applicant-by-id', (req, res) => {
    if (req.body.key === WsKey) {
        //     JOIN ${MySQLDB()}. e ON a.applicant_id=e.applicant_id
        //     JOIN ${MySQLDB()}.employment_history eh ON a.applicant_id=eh.applicant_id
        //     JOIN ${MySQLDB()}.reference r ON a.applicant_id=r.applicant_id
        //     JOIN ${MySQLDB()}.referral re ON a.applicant_id=re.applicant_id
        //     JOIN ${MySQLDB()}.training_history t ON a.applicant_id=t.applicant_id
        //    WHERE a.applicant_id=${57}
        const qry1 = `SELECT * FROM ${MySQLDB()}.applicants WHERE applicant_id=${req.body.applicantId}`
        const qry2 = `SELECT * FROM ${MySQLDB()}.education WHERE applicant_id=${req.body.applicantId}`
        const qry3 = `SELECT * FROM ${MySQLDB()}.reference WHERE applicant_id=${req.body.applicantId}`
        const qry4 = `SELECT * FROM ${MySQLDB()}.referral WHERE applicant_id=${req.body.applicantId}`
        const qry5 = `SELECT * FROM ${MySQLDB()}.training_history WHERE applicant_id=${req.body.applicantId}`
        const qry6 = `SELECT * FROM ${MySQLDB()}.employment_history WHERE applicant_id=${req.body.applicantId}`

        mysql.query(qry1, (err1, recset1) => {
            if (err1) {
                console.log(err1);
                res.send({ error: true, message: 'Something went wrong in query 1' })
            } else {
                mysql.query(qry2, (err2, recset2) => {
                    if (err2) {
                        console.log(err2);
                        res.send({ error: true, message: 'Something went wrong in query 2' })
                    } else {
                        mysql.query(qry3, (err3, recset3) => {
                            if (err3) {
                                console.log(err3);
                                res.send({ error: true, message: 'Something went wrong in query 3' })
                            } else {
                                mysql.query(qry4, (err4, recset4) => {
                                    if (err4) {
                                        console.log(err4);
                                        res.send({ error: true, message: 'Something went wrong in query 4' })
                                    } else {
                                        mysql.query(qry5, (err5, recset5) => {
                                            if (err5) {
                                                console.log(err5);
                                                res.send({ error: true, message: 'Something went wrong in query 5' })
                                            } else {
                                                mysql.query(qry6, (err6, recset6) => {
                                                    if (err6) {
                                                        console.log(err6);
                                                        res.send({ error: true, message: 'Something went wrong in query 6' })
                                                    } else {
                                                        res.send({ error: false, message: [recset1, recset2, { employment: recset3 }, { training: recset4 }, { references: recset5 }, { referral: recset6 }] })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })




    } else {
        res.status(401).send(JoiErrorMsg);
    }
});




//READ
app.post('/post-applicant-to-examination', (req, res) => {
    const qry = `UPDATE  ${MySQLDB()}.applicants SET applicant_status='Examination' WHERE applicant_id=${req.body.applicant.applicant_id}`

    mysql.query(qry, (err, recset) => {
        if (err) {
            console.log(err);
            res.send({ error: true })
        }

        if (recset.changedRows) res.send({ error: false, message: "Successfully Update" });
        else res.send({ error: false, message: "This account doesn't exists" });
    })
});









app.post('/search-job', (req, res) => {

    if (req.body.key === WsKey) {
        const val = req.body.value;
        const qry = `SELECT * FROM ${MySQLDB()}.jobs WHERE Job_Name LIKE '%${val}%' OR Specialization LIKE '%${val}%'`;

        mysql.query(qry, (err, recset) => {
            if (err) {
                console.log(err);
                res.send({ error: true })
            }

            res.send({ error: false, errMsg: "", message: recset })
        })

        console.log(qry);
    } else {
        res.status(401)
    }


});


/** CRUD for Applicant  */

// Insert personal information
app.post('/insert-applicant-personal-info', (req, res) => {
    if (req.body.key === WsKey) {
        const { job_post_id, first_name, last_name, email, phone_number, address, expected_salary } = req.body
        const qry = `INSERT INTO ${MySQLDB()}.applicants 
        ( first_name, last_name, email, phone_number, address, expected_salary, job_post_id) VALUES 
        ("${first_name}", "${last_name}", "${email}", "${phone_number}", "${address}", "${expected_salary}", ${job_post_id})`

        mysql.query(qry, (err) => {
            if (err) {
                console.log(err);
                res.send({ error: true })
            }
            console.log('success');
            res.send({ error: false, message: 'Successfully Insert' })
        })

    } else {
        res.status(401).send(JoiErrorMsg);
    }

});


app.post('/insert-applicant-education', (req, res) => {
    if (req.body.key === WsKey) {
        const { applicant_id, elementary_name, elementary_address, elementary_year, highschool_name,
            highschool_address, highschool_year, college_name, college_address, college_year,
            college_course } = req.body;

        const qry = `INSERT INTO ${MySQLDB()}.education 
        (applicant_id, elementary_name, elementary_address, elementary_year, highschool_name,
        highschool_address, highschool_year, college_name, college_address, college_year, 
        college_course) VALUES 
        (${applicant_id}, "${elementary_name}", "${elementary_address}", "${elementary_year}", "${highschool_name}",
         "${highschool_address}", "${highschool_year}", "${college_name}", "${college_address}", "${college_year}", 
         "${college_course}")`

        mysql.query(qry, (err) => {
            if (err) {
                console.log(err);
                res.send({ error: true })
            }
            console.log('success');
            res.send({ error: false, message: 'Successfully Insert' })
        })

    } else {
        res.status(401).send(JoiErrorMsg);
    }

});


// app.post('/insert-applicant-employment', (req, res)=>{
//     if(req.body.key ===  WsKey){

//          const {applicant_id, company_name, job_title, salary, start_date, end_date, reason}= req.body;

//         const qry = `INSERT INTO ${MySQLDB()}.employment_history 
//         (applicant_id, company_name, job_title, salary, start_date, end_date, reason) VALUES 
//         (${applicant_id}, "${company_name}", "${job_title}", "${salary}", "${start_date}","${end_date}", "${reason}")`

//         mysql.query(qry, (err) => {
//             if(err){
//                 console.log(err);
//                 res.send({error: true})
//             }
//             console.log('success');
//             res.send({error: false, message: 'Successfully Insert'})
//         })

//     }else {
//         res.status(401).send(JoiErrorMsg);
//     }

// });

// app.post('/insert-applicant-training', (req, res)=>{
//     if(req.body.key ===  WsKey){

//          const {applicant_id, training_name, completion_date, location}= req.body;

//         const qry = `INSERT INTO ${MySQLDB()}.training_history 
//         (applicant_id,training_name, completion_date, location) VALUES 
//         (${applicant_id}, "${training_name}", "${completion_date}", "${location}")`

//         mysql.query(qry, (err) => {
//             if(err){
//                 console.log(err);
//                 res.send({error: true})
//             }
//             console.log('success');
//             res.send({error: false, message: 'Successfully Insert'})
//         })

//     }else {
//         res.status(401).send(JoiErrorMsg);
//     }

// });

// app.post('/insert-applicant-reference', (req, res)=>{
//     if(req.body.key ===  WsKey){

//          const {applicant_id, reference_name, work_position, reference_phone_number, relationship}= req.body;

//         const qry = `INSERT INTO ${MySQLDB()}.reference 
//         (applicant_id, reference_name, work_position, reference_phone_number, relationship) VALUES 
//         (${applicant_id}, "${reference_name}", "${work_position}", "${reference_phone_number}", "${relationship}")`

//         mysql.query(qry, (err) => {
//             if(err){
//                 console.log(err);
//                 res.send({error: true})
//             }
//             console.log('success');
//             res.send({error: false, message: 'Successfully Insert'})
//         })

//     }else {
//         res.status(401).send(JoiErrorMsg);
//     }

// });


// app.post('/insert-applicant-referral', (req, res)=>{
//     if(req.body.key ===  WsKey){

//          const {applicant_id, referral_name, referral_position, referral_phone_number}= req.body;

//         const qry = `INSERT INTO ${MySQLDB()}.referral 
//         (applicant_id, referral_name, referral_position, referral_phone_number) VALUES 
//         (${applicant_id}, "${referral_name}", "${referral_position}", "${referral_phone_number}")`

//         mysql.query(qry, (err) => {
//             if(err){
//                 console.log(err);
//                 res.send({error: true})
//             }
//             console.log('success');
//             res.send({error: false, message: 'Successfully Insert'})
//         })

//     }else {
//         res.status(401).send(JoiErrorMsg);
//     }

// });



app.post('/insertInfo', (req, res) => {
    if (req.body.key === WsKey) {

        const { id, pInfo, eInfo, refInfo } = req.body;
        const { name1, relationship1, contact1, position1, name2, relationship2,
            contact2, position2, name3, relationship3, contact3, position3 } = refInfo;

        const { elemName, elemAdd, elemYear, highName, highAdd, highYear, colName, colAdd, colYear, course } = eInfo;
        const { firstName, lastName, middleName, nickName, city, provincial, mobile, landline, email } = pInfo;

        const qry1 = `INSERT INTO ${MySQLDB()}.applicants 
        ( first_name, last_name, email, mobile_number, city, job_post_id, middle_name, nick_name, provincial, land_number) VALUES 
        ("${firstName}", "${lastName}", "${email}", "${mobile}", "${city}", ${id}, "${middleName}", "${nickName}", "${provincial}", "${landline}")`

        mysql.query(qry1, (err) => {
            if (err) {
                console.log(err);
                res.send({ error: true })
            }
            console.log(qry1);
        })

        // const qry = `INSERT INTO ${MySQLDB()}.education 
        // (applicant_id, elementary_name, elementary_address, elementary_year, highschool_name,
        // highschool_address, highschool_year, college_name, college_address, college_year, 
        // college_course) VALUES 
        // (${applicant_id}, "${elementary_name}", "${elementary_address}", "${elementary_year}", "${highschool_name}",
        //  "${highschool_address}", "${highschool_year}", "${college_name}", "${college_address}", "${college_year}", 
        //  "${college_course}")`

        // const qry = `INSERT INTO ${MySQLDB()}.referral 
        // (applicant_id, referral_name, referral_position, referral_phone_number) VALUES 
        // (${applicant_id}, "${referral_name}", "${referral_position}", "${referral_phone_number}")`

        // mysql.query(qry, (err) => {
        //     if(err){
        //         console.log(err);
        //         res.send({error: true})
        //     }
        //     console.log('success');
        //     res.send({error: false, message: 'Successfully Insert'})
        // })

    } else {
        res.status(401).send(JoiErrorMsg);
    }

});


function ValidateKey(req) {
    const schema = {
        key: Joi.string().required()
    }
    return Joi.validate(req, schema)
}


function ValidateSignup(req) {
    const schema = {
        key: Joi.string().required(),
        email: Joi.string().required(),
        uname: Joi.string().required(),
        pass: Joi.string().required()
    }
    return Joi.validate(req, schema)
}

function ValidateGetUser(req) {
    const schema = {
        key: Joi.string().required(),
        email: Joi.string().required(),
        pass: Joi.string().required()
    }
    return Joi.validate(req, schema)
}

app.listen(Port(), () => {
    console.log(`You are listening in port ${Port()}`);
})