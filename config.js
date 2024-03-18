const env = 'DEVELOPMENT'

exports.WebServiceKey = () => {
    return 'MCJIM_HRIS_Key_2024';
};

exports.Port = () => {
    return 3003;
}

exports.mysqlHris = () => {
    return 'users'
}

exports.MySQLConfig = (mysql) => {
    return mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true
    })
}

exports.MySQLDB = () => {
    if(env === 'PRODUCTION') return 'hris_prod'
    else return 'hris'
}