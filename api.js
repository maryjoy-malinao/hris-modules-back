const express = require('express');
const app = express();
const Joi = require('joi');
const cors = require('cors')
const MySQL = require("mysql")
const {Port, WebServiceKey, MySQLConfig, MySQLDB} = require('./config');

app.use(express.json(), cors());

const JoiErrorMsg = {error: true, message: 'An Authorized Person'}
const WsKey = WebServiceKey();
const mysql = MySQLConfig(MySQL)

app.post('/signup', (req, res)=>{
    const { error } = ValidateSignup(req.body);
    
    if(req.body.key ===  WsKey){
        const {email, uname, pass}= req.body;
        if(req.body){
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
    }else {
        res.status(401).send(JoiErrorMsg);
    }
        
  
});


app.post('/get-user', (req, res)=>{
    const { error } = ValidateKey(req);

    if(req.body.key ===  WsKey){
        const {email, pass}= req.body;
        const qry = `SELECT count(*) as count FROM ${MySQLDB()}.users WHERE email="${email}" AND password="${pass}"`

        mysql.query(qry, (err, recset) => {
            if(err){
                console.log(err);
                res.send({error: true})
            }

            if (recset[0].count){
            
                res.send({error: false, errMsg: '', message: 'Account Exist'});
            }
            else res.send({error: false, errMsg: "Account Doesn't Exist", message: ""})
            
        })
    }else {
        res.status(401).send(JoiErrorMsg);
    }
    
 
});


app.post('/update-user/:id', (req, res)=>{
    const { error } = ValidateSignup(req.body);

    if(!error){
        if(req.body.key ===  WsKey){
            const {email, uname, pass}= req.body;

            const qry = `UPDATE  ${MySQLDB()}.users SET email='${email}', username='${uname}',
            password='${pass}' WHERE id=${req.params.id}`

            mysql.query(qry, (err, recset) => {
                if(err){
                    console.log(err);
                    res.send({error: true})
                }

                if(recset.changedRows) res.send({error: false, message: "Successfully Update"});
                else res.send({error: false, message: "This account doesn't exists"});                      
            })
        }else {
            res.status(401)
        }
        
    }else res.status(401).send(JoiErrorMsg);
});

app.post('/delete-user/:id', (req, res)=>{
    const { error } = ValidateKey(req.body);

    if(!error){
        if(req.body.key ===  WsKey){
            const qry = `DELETE FROM ${MySQLDB()}.users WHERE id=${req.params.id}`

            mysql.query(qry, (err, recset) => {
                if(err){
                    console.log(err);
                    res.send({error: true})
                }

                if(recset.affectedRows) res.send({error: false, message: "Successfully Delete"});
                else res.send({error: false, message: "This account doesn't exists"});                      
            })
        }else {
            res.status(401)
        }
        
    }else res.status(401).send(JoiErrorMsg);
});




app.post('/insert-job', (req, res)=>{
    const { error } = ValidateKey(req);

    if(req.body.key ===  WsKey){
        const {job_title, job_location, job_desc, job_type, job_specialization, job_career} =  req.body;

        const qry = `INSERT INTO ${MySQLDB()}.jobs 
        (job_title, job_specialization, job_location, job_desc, job_type, job_career) VALUES 
        ("${job_title}", "${job_specialization}", "${job_location}", '${job_desc}', "${job_type}", "${job_career}")`

        mysql.query(qry, (err) => {
            if(err){
                res.send({error: true, message: 'Something went wrong'})
            }
            res.send({error: false, message: 'Successfully Insert'})
        })


    }else {
        res.status(401).send(JoiErrorMsg);
    }
    
 
});



app.post('/get-jobs', (req, res)=>{
    const { error } = ValidateKey(req);

    if(req.body.key ===  WsKey){
        const qry = `SELECT * FROM ${MySQLDB()}.jobs ORDER BY job_id DESC`

        mysql.query(qry, (err, recset) => {
            if(err){
                res.send({error: true, message: 'Something went wrong'})
            }  
            res.send({error: false, message: recset})      
        })

    }else {
        res.status(401).send(JoiErrorMsg);
    }
});



app.post('/update-status', (req, res)=>{
  
    if(req.body.key ===  WsKey){

        const status = req.body.job_status === 'Active' ? 'Inactive' : 'Active';
        const qry =`UPDATE ${MySQLDB()}.jobs SET job_status='${status}' WHERE job_id='${req.body.job_id}'`

        mysql.query(qry, (err, recset) => {
            if(err){
                res.send({error: true, message: 'Something went wrong'})
            }

            if(recset.changedRows) res.send({error: false, message: "Successfully Update"});
            else res.send({error: false, message: "Cannot update this job post"});                       
        })
    }else {
        res.status(401)
    }
    

});



app.post('/delete-job', (req, res)=>{
    if(req.body.key ===  WsKey){

        const qry = `DELETE FROM ${MySQLDB()}.jobs WHERE job_id=${req.body.jobid}`

        mysql.query(qry, (err, recset) => {
            if(err){
                console.log(err);
                res.send({error: true, message:'Something went wrong'})
            }

            if(recset.affectedRows) res.send({error: false, message: "Successfully Delete"});
            else res.send({error: false, message: "Cannot find this job post"});                      
        })
    }else {
        res.status(401)
    } 
});



app.post('/get-jobbyid', (req, res)=>{
    if(req.body.key ===  WsKey){

        const qry = `SELECT * FROM ${MySQLDB()}.jobs WHERE job_id=${req.body.jobid}`

        mysql.query(qry, (err, recset) => {
            if(err){
                res.send({error: true, message: 'Something went wrong'})
            }     
            res.send({error: false, message: recset})          
        })
    }else {
        res.status(401).send(JoiErrorMsg);
    }
    
 
});

app.post('/edit-job', (req, res)=>{
  
    if(req.body.key ===  WsKey){
        console.log(req.body);
        // const {id, job_title ,work_loc , job_desc , job_type, specialization, career_level, status} =  req.body;
   
        // const qry =`UPDATE ${MySQLDB()}.jobs SET 
        // Job_Name='${job_title}',
        // Specialization='${specialization}',
        // Work_Location='${work_loc}',
        // Status='${status}',
        // Job_Desc='${job_desc}',
        // Job_Type='${job_type}',
        // Career_Level='${career_level}'
        // WHERE id='${id}'`

        // mysql.query(qry, (err, recset) => {
        //     if(err){
        //         console.log(err);
        //         res.send({error: true})
        //     }

        //     if(recset.changedRows) res.send({error: false, message: "Successfully Update"});
        //     else res.send({error: false, message: "Cannot update this job post"});                       
        // })
    }else {
        res.status(401)
    }
    

});



app.post('/insert-applicant', (req, res)=>{
    const { error } = ValidateKey(req);

    if(req.body.key ===  WsKey){
        const {personalInfo,educationInfo, employmentInfo,trainingInfo, referencesInfo,referralInfo}=req.body;
        const {job_id,applicant_last, applicant_first, applicant_middle, applicant_gender, applicant_city, applicant_provincial, applicant_mobile, applicant_email, applicant_salary}=personalInfo;
        const {applicant_elemName, applicant_elemAddress, applicant_elemYear, applicant_highName, applicant_highAddress, applicant_highYear, applicant_colName, applicant_colAddress, applicant_colYear}=educationInfo;
        const {applicant_name1, applicant_relationship1, applicant_contact1, applicant_name2, applicant_relationship2, applicant_contact2,
            applicant_name3, applicant_relationship3, applicant_contact3
        }=referencesInfo;


      

        // const {job_title, job_location, job_desc, job_type, job_specialization, job_career} =  req.body;

        const qry1 = `INSERT INTO ${MySQLDB()}.applicants 
        (first_name, last_name, email, mobile_number, city, expected_salary, job_post_id, gender, provincial)
         VALUES 
        ("${applicant_first}", "${applicant_last}", "${applicant_email}", '${applicant_mobile}', "${applicant_city}", "${applicant_salary}",
        ${job_id}, "${applicant_gender}", "${applicant_provincial}"
        )`

        

        mysql.query(qry1, (err, recset) => {
            const id = recset.insertId;
            const qry2 = `INSERT INTO ${MySQLDB()}.education
            (applicant_id, elementary_name, elementary_address, elementary_year,
             highschool_name, highschool_address, highschool_year, college_name, 
             college_address, college_year)
             VALUES 
            (${id}, "${applicant_elemName}", "${applicant_elemAddress}", "${applicant_elemYear}", 
            "${applicant_highName}","${applicant_highAddress}","${applicant_highYear}", 
            "${applicant_colName}", "${applicant_colAddress}", "${applicant_colYear}");`

            const qry3 = `INSERT INTO ${MySQLDB()}.reference
            (applicant_id, reference_name, reference_phone_number, relationship)
             VALUES 
            (${id},  "${applicant_name1}", "${applicant_contact1}", "${applicant_relationship1}"),
            (${id},  "${applicant_name2}", "${applicant_contact2}", "${applicant_relationship2}"), 
            (${id},  "${applicant_name3}", "${applicant_contact3}", "${applicant_relationship3}");`

            const str = qry2+qry3;
            mysql.query(str, (err) => {
                if(err){
                    console.log(err);
                    res.send({error: true, message: 'Something went wrong'})
                }else{
                    res.send({error: false, message: 'Successfully Insert'})
                }
                
            })

        })


    }else {
        res.status(401).send(JoiErrorMsg);
    }
    
 
});





app.post('/sort-job', (req, res)=>{
  
    if(req.body.key ===  WsKey){
        const val =  req.body.value;
        const SELECT = `SELECT * FROM ${MySQLDB()}.jobs ORDER BY`;

        let qry = `${SELECT} job_Name desc`

        switch(val){
            case 'job_title_asc':
                qry = `${SELECT} job_Name`
            break;
            case 'specia_asc':
                qry = `${SELECT} Specialization`
            break;
            case 'specia_desc':
                qry = `${SELECT} Specialization desc`    
            break;          
        }

        mysql.query(qry, (err, recset) => {
            if(err){
                console.log(err);
                res.send({error: true})
            }

            res.send({error: false, errMsg: "", message: recset})
        })
    }else {
        res.status(401)
    }
    

});

app.post('/search-job', (req, res)=>{
  
    if(req.body.key ===  WsKey){
        const val =  req.body.value;
        const qry = `SELECT * FROM ${MySQLDB()}.jobs WHERE Job_Name LIKE '%${val}%' OR Specialization LIKE '%${val}%'`;

        mysql.query(qry, (err, recset) => {
            if(err){
                console.log(err);
                res.send({error: true})
            }

            res.send({error: false, errMsg: "", message: recset})
        })

        console.log(qry);
    }else {
        res.status(401)
    }
    

});


/** CRUD for Applicant  */

// Insert personal information
app.post('/insert-applicant-personal-info', (req, res)=>{
    if(req.body.key ===  WsKey){
        const {job_post_id, first_name, last_name, email, phone_number, address, expected_salary} = req.body
        const qry = `INSERT INTO ${MySQLDB()}.applicants 
        ( first_name, last_name, email, phone_number, address, expected_salary, job_post_id) VALUES 
        ("${first_name}", "${last_name}", "${email}", "${phone_number}", "${address}", "${expected_salary}", ${job_post_id})`

        mysql.query(qry, (err) => {
            if(err){
                console.log(err);
                res.send({error: true})
            }
            console.log('success');
            res.send({error: false, message: 'Successfully Insert'})
        })

    }else {
        res.status(401).send(JoiErrorMsg);
    }
    
});


app.post('/insert-applicant-education', (req, res)=>{
    if(req.body.key ===  WsKey){
         const {applicant_id, elementary_name, elementary_address, elementary_year, highschool_name,
                highschool_address, highschool_year, college_name, college_address, college_year, 
                college_course}= req.body;

        const qry = `INSERT INTO ${MySQLDB()}.education 
        (applicant_id, elementary_name, elementary_address, elementary_year, highschool_name,
        highschool_address, highschool_year, college_name, college_address, college_year, 
        college_course) VALUES 
        (${applicant_id}, "${elementary_name}", "${elementary_address}", "${elementary_year}", "${highschool_name}",
         "${highschool_address}", "${highschool_year}", "${college_name}", "${college_address}", "${college_year}", 
         "${college_course}")`

        mysql.query(qry, (err) => {
            if(err){
                console.log(err);
                res.send({error: true})
            }
            console.log('success');
            res.send({error: false, message: 'Successfully Insert'})
        })

    }else {
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



app.post('/insertInfo', (req, res)=>{
    if(req.body.key ===  WsKey){
   
        const {id, pInfo, eInfo, refInfo} =  req.body;
         const {name1, relationship1, contact1, position1, name2, relationship2,
        contact2, position2, name3, relationship3, contact3, position3}= refInfo;

        const {elemName, elemAdd, elemYear, highName, highAdd, highYear, colName, colAdd, colYear, course}=eInfo;
        const {firstName, lastName, middleName, nickName, city, provincial, mobile, landline, email }= pInfo;

        const qry1 = `INSERT INTO ${MySQLDB()}.applicants 
        ( first_name, last_name, email, mobile_number, city, job_post_id, middle_name, nick_name, provincial, land_number) VALUES 
        ("${firstName}", "${lastName}", "${email}", "${mobile}", "${city}", ${id}, "${middleName}", "${nickName}", "${provincial}", "${landline}")`

        mysql.query(qry1, (err) => {
            if(err){
                console.log(err);
                res.send({error: true})
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

    }else {
        res.status(401).send(JoiErrorMsg);
    }
    
});


function ValidateKey(req){
    const schema = {
        key: Joi.string().required()
    }
    return Joi.validate(req, schema)
}


function ValidateSignup(req){
    const schema = {
        key: Joi.string().required(),
        email: Joi.string().required(),
        uname: Joi.string().required(),
        pass: Joi.string().required()
    }
    return Joi.validate(req, schema)
}

function ValidateGetUser(req){
    const schema = {
        key: Joi.string().required(),
        email: Joi.string().required(),
        pass: Joi.string().required()
    }
    return Joi.validate(req, schema)
}

app.listen(Port(), ()=>{
    console.log(`You are listening in port ${Port()}`);
})